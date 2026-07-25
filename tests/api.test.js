import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createApp } from '../src/api/app.js';

async function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function makeUrl(server, path) {
  const address = server.address();
  return `http://127.0.0.1:${address.port}${path}`;
}

async function jsonRequest(server, path, options = {}) {
  const response = await fetch(makeUrl(server, path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let payload = null;
  const text = await response.text();
  if (text) {
    payload = JSON.parse(text);
  }

  return { response, payload };
}

async function rawRequest(server, path, { method = 'POST', body = '', headers = {} } = {}) {
  return fetch(makeUrl(server, path), {
    method,
    body,
    headers,
  });
}

function stripeSignatureFor(body, secret, timestamp = 1700000000) {
  const payload = `${timestamp}.${body}`;
  const digest = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  return `t=${timestamp},v1=${digest}`;
}

test('health endpoint returns ok', async () => {
  const app = createApp();
  const server = await startServer(app);

  try {
    const { response, payload } = await jsonRequest(server, '/api/health');
    assert.equal(response.status, 200);
    assert.deepEqual(payload, { status: 'ok' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST creates item and GET /api/items lists it', async () => {
  const app = createApp();
  const server = await startServer(app);

  try {
    const create = await jsonRequest(server, '/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'First' }),
    });

    assert.equal(create.response.status, 201);
    assert.equal(create.payload.data.id, 1);
    assert.equal(create.payload.data.name, 'First');

    const list = await jsonRequest(server, '/api/items');
    assert.equal(list.response.status, 200);
    assert.equal(list.payload.data.length, 1);
    assert.equal(list.payload.data[0].name, 'First');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('PUT updates item and DELETE removes it', async () => {
  const app = createApp();
  const server = await startServer(app);

  try {
    const create = await jsonRequest(server, '/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'Original' }),
    });

    const id = create.payload.data.id;

    const update = await jsonRequest(server, `/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    assert.equal(update.response.status, 200);
    assert.equal(update.payload.data.name, 'Updated');

    const remove = await jsonRequest(server, `/api/items/${id}`, {
      method: 'DELETE',
    });

    assert.equal(remove.response.status, 204);

    const fetchDeleted = await jsonRequest(server, `/api/items/${id}`);
    assert.equal(fetchDeleted.response.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('validation errors return 400', async () => {
  const app = createApp();
  const server = await startServer(app);

  try {
    const create = await jsonRequest(server, '/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    });

    assert.equal(create.response.status, 400);

    const update = await jsonRequest(server, '/api/items/1', {
      method: 'PUT',
      body: JSON.stringify({ name: '   ' }),
    });

    assert.equal(update.response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('podcast membership monetization flow works end-to-end', async () => {
  const app = createApp();
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Premium',
        priceCents: 1000,
        billingPeriod: 'monthly',
        benefits: ['Bonus episodes', 'Ad-free feed'],
      }),
    });
    assert.equal(plan.response.status, 201);

    const member = await jsonRequest(server, '/api/membership/members', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Taylor',
        email: 'taylor@example.com',
        planId: plan.payload.data.id,
      }),
    });
    assert.equal(member.response.status, 201);

    const freeEpisode = await jsonRequest(server, '/api/podcast/episodes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Public Episode',
        description: 'Available to everyone',
        isPremium: false,
      }),
    });
    assert.equal(freeEpisode.response.status, 201);

    const premiumEpisode = await jsonRequest(server, '/api/podcast/episodes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Premium Episode',
        description: 'Members only',
        isPremium: true,
      }),
    });
    assert.equal(premiumEpisode.response.status, 201);

    const freeAccess = await jsonRequest(
      server,
      `/api/podcast/access?episodeId=${freeEpisode.payload.data.id}`,
    );
    assert.equal(freeAccess.response.status, 200);
    assert.equal(freeAccess.payload.data.hasAccess, true);

    const deniedAccess = await jsonRequest(
      server,
      `/api/podcast/access?episodeId=${premiumEpisode.payload.data.id}`,
    );
    assert.equal(deniedAccess.response.status, 403);
    assert.equal(deniedAccess.payload.data.hasAccess, false);

    const grantedAccess = await jsonRequest(
      server,
      `/api/podcast/access?memberId=${member.payload.data.id}&episodeId=${premiumEpisode.payload.data.id}`,
    );
    assert.equal(grantedAccess.response.status, 200);
    assert.equal(grantedAccess.payload.data.hasAccess, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('membership metrics reflect active revenue and cancellation', async () => {
  const app = createApp();
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Supporter',
        priceCents: 500,
        billingPeriod: 'monthly',
        benefits: ['Early access'],
      }),
    });

    const member = await jsonRequest(server, '/api/membership/members', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alex',
        email: 'alex@example.com',
        planId: plan.payload.data.id,
      }),
    });

    const beforeCancel = await jsonRequest(server, '/api/membership/metrics');
    assert.equal(beforeCancel.response.status, 200);
    assert.equal(beforeCancel.payload.data.activeMembers, 1);
    assert.equal(beforeCancel.payload.data.recurringRevenueCents, 500);

    const cancel = await jsonRequest(server, `/api/membership/members/${member.payload.data.id}/cancel`, {
      method: 'POST',
    });
    assert.equal(cancel.response.status, 200);
    assert.equal(cancel.payload.data.status, 'canceled');

    const afterCancel = await jsonRequest(server, '/api/membership/metrics');
    assert.equal(afterCancel.response.status, 200);
    assert.equal(afterCancel.payload.data.activeMembers, 0);
    assert.equal(afterCancel.payload.data.recurringRevenueCents, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('stripe webhook rejects invalid signature', async () => {
  const app = createApp({ stripeWebhookSecret: 'whsec_test' });
  const server = await startServer(app);

  try {
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { metadata: { planId: '1' } } },
    });

    const response = await rawRequest(server, '/api/stripe/webhook', {
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=1700000000,v1=bad',
      },
    });

    assert.equal(response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('stripe checkout session endpoint creates a payment session for a configured plan', async () => {
  const createdSessions = [];
  const app = createApp({
    stripeSecretKey: 'sk_test_123',
    publicBaseUrl: 'https://thehumanxp.com',
    checkoutSessionCreator: async (input) => {
      createdSessions.push(input);
      return {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      };
    },
  });
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Inner Circle',
        priceCents: 1000,
        billingPeriod: 'monthly',
        benefits: ['Private feed'],
        stripePriceId: 'price_test_inner_circle',
      }),
    });
    assert.equal(plan.response.status, 201);
    assert.equal(plan.payload.data.stripePriceId, 'configured');

    const checkout = await jsonRequest(server, '/api/stripe/checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planId: plan.payload.data.id,
        email: ' Listener@Example.com ',
        memberName: 'Listener Name',
      }),
    });

    assert.equal(checkout.response.status, 201);
    assert.equal(checkout.payload.data.checkoutSessionId, 'cs_test_123');
    assert.equal(checkout.payload.data.checkoutUrl, 'https://checkout.stripe.com/c/pay/cs_test_123');
    assert.equal(checkout.payload.data.plan.price, '$10.00');
    assert.equal(createdSessions.length, 1);
    assert.equal(createdSessions[0].plan.stripePriceId, 'price_test_inner_circle');
    assert.equal(createdSessions[0].email, 'listener@example.com');
    assert.equal(createdSessions[0].memberName, 'Listener Name');
    assert.equal(createdSessions[0].baseUrl, 'https://thehumanxp.com');
    assert.equal(createdSessions[0].stripeSecretKey, 'sk_test_123');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('stripe checkout session endpoint rejects plans without a Stripe price ID', async () => {
  const app = createApp({
    checkoutSessionCreator: async () => {
      throw new Error('Should not be called');
    },
  });
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Member',
        priceCents: 500,
        billingPeriod: 'monthly',
        benefits: ['Early access'],
      }),
    });
    assert.equal(plan.response.status, 201);

    const checkout = await jsonRequest(server, '/api/stripe/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planId: plan.payload.data.id }),
    });

    assert.equal(checkout.response.status, 400);
    assert.match(checkout.payload.error, /Stripe price ID/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('paypal subscription endpoint creates an approval session for a configured plan', async () => {
  const createdSubscriptions = [];
  const app = createApp({
    paypalClientId: 'paypal_client_test',
    paypalClientSecret: 'paypal_secret_test',
    paypalEnvironment: 'sandbox',
    publicBaseUrl: 'https://thehumanxp.com',
    paypalSubscriptionCreator: async (input) => {
      createdSubscriptions.push(input);
      return {
        id: 'I-SUBSCRIPTION123',
        status: 'APPROVAL_PENDING',
        approvalUrl: 'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-123',
      };
    },
  });
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Inner Circle',
        priceCents: 1000,
        billingPeriod: 'monthly',
        benefits: ['Private feed'],
        paypalPlanId: 'P-PAYPALINNER123',
      }),
    });
    assert.equal(plan.response.status, 201);
    assert.equal(plan.payload.data.paypalPlanId, 'configured');

    const subscription = await jsonRequest(server, '/api/paypal/subscription', {
      method: 'POST',
      body: JSON.stringify({
        planId: plan.payload.data.id,
        email: ' Listener@Example.com ',
        memberName: 'Listener Name',
      }),
    });

    assert.equal(subscription.response.status, 201);
    assert.equal(subscription.payload.data.subscriptionId, 'I-SUBSCRIPTION123');
    assert.equal(
      subscription.payload.data.approvalUrl,
      'https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-123',
    );
    assert.equal(subscription.payload.data.plan.price, '$10.00');
    assert.equal(createdSubscriptions.length, 1);
    assert.equal(createdSubscriptions[0].plan.paypalPlanId, 'P-PAYPALINNER123');
    assert.equal(createdSubscriptions[0].email, 'listener@example.com');
    assert.equal(createdSubscriptions[0].memberName, 'Listener Name');
    assert.equal(createdSubscriptions[0].baseUrl, 'https://thehumanxp.com');
    assert.equal(createdSubscriptions[0].paypalClientId, 'paypal_client_test');
    assert.equal(createdSubscriptions[0].paypalClientSecret, 'paypal_secret_test');
    assert.equal(createdSubscriptions[0].paypalEnvironment, 'sandbox');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('paypal subscription endpoint rejects plans without a PayPal plan ID', async () => {
  const app = createApp({
    paypalSubscriptionCreator: async () => {
      throw new Error('Should not be called');
    },
  });
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Member',
        priceCents: 500,
        billingPeriod: 'monthly',
        benefits: ['Early access'],
      }),
    });
    assert.equal(plan.response.status, 201);

    const subscription = await jsonRequest(server, '/api/paypal/subscription', {
      method: 'POST',
      body: JSON.stringify({ planId: plan.payload.data.id }),
    });

    assert.equal(subscription.response.status, 400);
    assert.match(subscription.payload.error, /PayPal plan ID/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('stripe webhook creates and cancels member from subscription events', async () => {
  const secret = 'whsec_test';
  const app = createApp({ stripeWebhookSecret: secret });
  const server = await startServer(app);

  try {
    const plan = await jsonRequest(server, '/api/membership/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Premium',
        priceCents: 1000,
        billingPeriod: 'monthly',
        benefits: ['Bonus episodes'],
      }),
    });
    assert.equal(plan.response.status, 201);

    const checkoutPayload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
          customer_details: { email: 'member@example.com' },
          metadata: { planId: String(plan.payload.data.id), memberName: 'Member Name' },
        },
      },
    });

    const checkoutSignature = stripeSignatureFor(checkoutPayload, secret);
    const checkoutResponse = await rawRequest(server, '/api/stripe/webhook', {
      body: checkoutPayload,
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': checkoutSignature,
      },
    });
    assert.equal(checkoutResponse.status, 200);

    const members = await jsonRequest(server, '/api/membership/members');
    assert.equal(members.payload.data.length, 1);
    assert.equal(members.payload.data[0].status, 'active');
    assert.equal(members.payload.data[0].stripeSubscriptionId, 'sub_123');

    const cancelPayload = JSON.stringify({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_123',
          status: 'canceled',
        },
      },
    });
    const cancelSignature = stripeSignatureFor(cancelPayload, secret);
    const cancelResponse = await rawRequest(server, '/api/stripe/webhook', {
      body: cancelPayload,
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': cancelSignature,
      },
    });
    assert.equal(cancelResponse.status, 200);

    const membersAfter = await jsonRequest(server, '/api/membership/members');
    assert.equal(membersAfter.payload.data[0].status, 'canceled');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
