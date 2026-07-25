import crypto from 'node:crypto';
import express from 'express';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function asPositiveInteger(value) {
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function safeEqualHex(hexA, hexB) {
  try {
    const left = Buffer.from(hexA, 'hex');
    const right = Buffer.from(hexB, 'hex');

    if (left.length !== right.length) {
      return false;
    }

    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function centsToDollars(cents) {
  return (cents / 100).toFixed(2);
}

function publicPlan(plan) {
  return {
    ...plan,
    stripePriceId: plan.stripePriceId ? 'configured' : null,
    paypalPlanId: plan.paypalPlanId ? 'configured' : null,
  };
}

function publicPlans(planList) {
  return planList.map(publicPlan);
}

function getBaseUrl(optionsBaseUrl) {
  return optionsBaseUrl ?? process.env.PUBLIC_BASE_URL ?? process.env.CLIENT_BASE_URL ?? 'http://localhost:5173';
}

async function createStripeCheckoutSession({ plan, email, memberName, baseUrl, stripeSecretKey }) {
  if (!stripeSecretKey) {
    const error = new Error('Stripe is not configured');
    error.statusCode = 503;
    throw error;
  }

  if (!plan.stripePriceId) {
    const error = new Error('Plan is missing a Stripe price ID');
    error.statusCode = 400;
    throw error;
  }

  const params = new URLSearchParams({
    mode: 'subscription',
    success_url: `${baseUrl}/membership.html?checkout=success`,
    cancel_url: `${baseUrl}/membership.html?checkout=cancelled`,
    'line_items[0][price]': plan.stripePriceId,
    'line_items[0][quantity]': '1',
    'metadata[planId]': String(plan.id),
    'metadata[memberName]': memberName,
    'subscription_data[metadata][planId]': String(plan.id),
    'subscription_data[metadata][memberName]': memberName,
  });

  if (email) {
    params.set('customer_email', email);
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Stripe checkout session creation failed');
    error.statusCode = response.status;
    throw error;
  }

  return {
    id: payload.id,
    url: payload.url,
  };
}

function getPayPalApiBase(environment) {
  return environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

function getPlanCheckoutUrl(baseUrl, status, provider = 'paypal') {
  return `${baseUrl}/membership.html?checkout=${status}&provider=${provider}`;
}

function findApprovalUrl(links = []) {
  return links.find((link) => link.rel === 'approve')?.href ?? null;
}

async function getPayPalAccessToken({ clientId, clientSecret, apiBase }) {
  if (!clientId || !clientSecret) {
    const error = new Error('PayPal is not configured');
    error.statusCode = 503;
    throw error;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.error_description || payload?.error || 'PayPal authentication failed');
    error.statusCode = response.status;
    throw error;
  }

  return payload.access_token;
}

async function createPayPalSubscription({
  plan,
  email,
  memberName,
  baseUrl,
  paypalClientId,
  paypalClientSecret,
  paypalEnvironment,
}) {
  if (!plan.paypalPlanId) {
    const error = new Error('Plan is missing a PayPal plan ID');
    error.statusCode = 400;
    throw error;
  }

  const apiBase = getPayPalApiBase(paypalEnvironment);
  const accessToken = await getPayPalAccessToken({
    clientId: paypalClientId,
    clientSecret: paypalClientSecret,
    apiBase,
  });

  const response = await fetch(`${apiBase}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      plan_id: plan.paypalPlanId,
      custom_id: JSON.stringify({
        planId: plan.id,
        email,
        memberName,
      }),
      subscriber: {
        name: {
          given_name: memberName || 'The Human Experience',
          surname: 'Member',
        },
        email_address: email || undefined,
      },
      application_context: {
        brand_name: 'The Human Experience',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: getPlanCheckoutUrl(baseUrl, 'success', 'paypal'),
        cancel_url: getPlanCheckoutUrl(baseUrl, 'cancelled', 'paypal'),
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.details?.[0]?.description || 'PayPal subscription creation failed');
    error.statusCode = response.status;
    throw error;
  }

  const approvalUrl = findApprovalUrl(payload.links);
  if (!approvalUrl) {
    const error = new Error('PayPal did not return an approval URL');
    error.statusCode = 502;
    throw error;
  }

  return {
    id: payload.id,
    status: payload.status,
    approvalUrl,
  };
}

function parseStripeSignature(headerValue) {
  if (!isNonEmptyString(headerValue)) {
    return null;
  }

  const parts = headerValue.split(',');
  const signature = { t: null, v1: [] };

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      signature.t = value;
    }

    if (key === 'v1' && value) {
      signature.v1.push(value);
    }
  }

  if (!signature.t || signature.v1.length === 0) {
    return null;
  }

  return signature;
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!secret) {
    return false;
  }

  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed) {
    return false;
  }

  const payloadToSign = `${parsed.t}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(payloadToSign, 'utf8').digest('hex');

  return parsed.v1.some((candidate) => safeEqualHex(candidate, expected));
}

export function createApp(options = {}) {
  const app = express();

  const stripeWebhookSecret = options.stripeWebhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET ?? '';
  const stripeSecretKey = options.stripeSecretKey ?? process.env.STRIPE_SECRET_KEY ?? '';
  const paypalClientId = options.paypalClientId ?? process.env.PAYPAL_CLIENT_ID ?? '';
  const paypalClientSecret = options.paypalClientSecret ?? process.env.PAYPAL_CLIENT_SECRET ?? '';
  const paypalEnvironment = options.paypalEnvironment ?? process.env.PAYPAL_ENVIRONMENT ?? 'sandbox';
  const publicBaseUrl = getBaseUrl(options.publicBaseUrl);
  const checkoutSessionCreator = options.checkoutSessionCreator ?? createStripeCheckoutSession;
  const paypalSubscriptionCreator = options.paypalSubscriptionCreator ?? createPayPalSubscription;

  let nextId = 1;
  const items = [];
  let nextPlanId = 1;
  let nextMemberId = 1;
  let nextEpisodeId = 1;
  const plans = [];
  const members = [];
  const episodes = [];

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Stripe-Signature,Paypal-Transmission-Id');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const signatureHeader = req.headers['stripe-signature'];
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }

    const isValid = verifyStripeSignature(rawBody, signatureHeader, stripeWebhookSecret);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid Stripe signature' });
      return;
    }

    const event = JSON.parse(rawBody.toString('utf8'));

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object ?? {};
      const email = session.customer_details?.email?.toLowerCase();
      const planId = Number(session.metadata?.planId);
      const memberName = session.metadata?.memberName || email;
      const plan = plans.find((entry) => entry.id === planId);

      if (email && plan) {
        const existingMember = members.find((entry) => entry.email === email);

        if (existingMember) {
          existingMember.status = 'active';
          existingMember.planId = plan.id;
          existingMember.canceledAt = null;
          existingMember.stripeCustomerId = session.customer || existingMember.stripeCustomerId;
          existingMember.stripeSubscriptionId = session.subscription || existingMember.stripeSubscriptionId;
        } else {
          members.push({
            id: nextMemberId,
            name: memberName,
            email,
            planId: plan.id,
            status: 'active',
            startedAt: new Date().toISOString(),
            canceledAt: null,
            stripeCustomerId: session.customer || null,
            stripeSubscriptionId: session.subscription || null,
          });

          nextMemberId += 1;
        }
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data?.object ?? {};
      const subscriptionId = subscription.id;
      const status = subscription.status;
      const matched = members.find((entry) => entry.stripeSubscriptionId === subscriptionId);

      if (matched) {
        matched.status = status === 'active' || status === 'trialing' ? 'active' : 'canceled';
        if (matched.status === 'canceled') {
          matched.canceledAt = new Date().toISOString();
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/items', (_req, res) => {
    res.json({ data: items });
  });

  app.get('/api/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const item = items.find((entry) => entry.id === id);

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json({ data: item });
  });

  app.post('/api/items', (req, res) => {
    const { name } = req.body ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: '"name" is required and must be a non-empty string' });
      return;
    }

    const item = {
      id: nextId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    nextId += 1;
    items.push(item);

    res.status(201).json({ data: item });
  });

  app.put('/api/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: '"name" is required and must be a non-empty string' });
      return;
    }

    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const updatedItem = {
      ...items[index],
      name: name.trim(),
    };

    items[index] = updatedItem;
    res.json({ data: updatedItem });
  });

  app.delete('/api/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = items.findIndex((entry) => entry.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    items.splice(index, 1);
    res.status(204).end();
  });

  app.get('/api/membership/plans', (_req, res) => {
    res.json({ data: publicPlans(plans) });
  });

  app.post('/api/membership/plans', (req, res) => {
    const { name, priceCents, billingPeriod = 'monthly', benefits = [], stripePriceId = '', paypalPlanId = '' } =
      req.body ?? {};
    const parsedPrice = asPositiveInteger(priceCents);
    const isValidBenefits = Array.isArray(benefits) && benefits.every(isNonEmptyString);

    if (!isNonEmptyString(name) || !parsedPrice || !isNonEmptyString(billingPeriod) || !isValidBenefits) {
      res.status(400).json({
        error:
          '"name" (string), "priceCents" (positive integer), "billingPeriod" (string), and "benefits" (array of non-empty strings) are required',
      });
      return;
    }

    const plan = {
      id: nextPlanId,
      name: name.trim(),
      priceCents: parsedPrice,
      billingPeriod: billingPeriod.trim().toLowerCase(),
      benefits: benefits.map((entry) => entry.trim()),
      stripePriceId: isNonEmptyString(stripePriceId) ? stripePriceId.trim() : null,
      paypalPlanId: isNonEmptyString(paypalPlanId) ? paypalPlanId.trim() : null,
      createdAt: new Date().toISOString(),
    };

    nextPlanId += 1;
    plans.push(plan);

    res.status(201).json({ data: publicPlan(plan) });
  });

  app.post('/api/stripe/checkout-session', async (req, res) => {
    const { planId, email = '', memberName = '' } = req.body ?? {};
    const parsedPlanId = asPositiveInteger(planId);
    const plan = plans.find((entry) => entry.id === parsedPlanId);
    const normalizedEmail = isNonEmptyString(email) ? email.trim().toLowerCase() : '';
    const normalizedName = isNonEmptyString(memberName) ? memberName.trim() : normalizedEmail;

    if (!plan) {
      res.status(400).json({ error: '"planId" must match an existing membership plan' });
      return;
    }

    if (!plan.stripePriceId) {
      res.status(400).json({ error: `Plan "${plan.name}" is not connected to a Stripe price ID` });
      return;
    }

    try {
      const session = await checkoutSessionCreator({
        plan,
        email: normalizedEmail,
        memberName: normalizedName || 'Member',
        baseUrl: publicBaseUrl,
        stripeSecretKey,
      });

      res.status(201).json({
        data: {
          checkoutSessionId: session.id,
          checkoutUrl: session.url,
          plan: {
            id: plan.id,
            name: plan.name,
            price: `$${centsToDollars(plan.priceCents)}`,
            billingPeriod: plan.billingPeriod,
          },
        },
      });
    } catch (error) {
      res.status(error.statusCode || 502).json({ error: error.message || 'Unable to create checkout session' });
    }
  });

  app.post('/api/paypal/subscription', async (req, res) => {
    const { planId, email = '', memberName = '' } = req.body ?? {};
    const parsedPlanId = asPositiveInteger(planId);
    const plan = plans.find((entry) => entry.id === parsedPlanId);
    const normalizedEmail = isNonEmptyString(email) ? email.trim().toLowerCase() : '';
    const normalizedName = isNonEmptyString(memberName) ? memberName.trim() : normalizedEmail;

    if (!plan) {
      res.status(400).json({ error: '"planId" must match an existing membership plan' });
      return;
    }

    if (!plan.paypalPlanId) {
      res.status(400).json({ error: `Plan "${plan.name}" is not connected to a PayPal plan ID` });
      return;
    }

    try {
      const subscription = await paypalSubscriptionCreator({
        plan,
        email: normalizedEmail,
        memberName: normalizedName || 'Member',
        baseUrl: publicBaseUrl,
        paypalClientId,
        paypalClientSecret,
        paypalEnvironment,
      });

      res.status(201).json({
        data: {
          subscriptionId: subscription.id,
          approvalUrl: subscription.approvalUrl,
          status: subscription.status,
          plan: {
            id: plan.id,
            name: plan.name,
            price: `$${centsToDollars(plan.priceCents)}`,
            billingPeriod: plan.billingPeriod,
          },
        },
      });
    } catch (error) {
      res.status(error.statusCode || 502).json({ error: error.message || 'Unable to create PayPal subscription' });
    }
  });

  app.get('/api/membership/members', (_req, res) => {
    res.json({ data: members });
  });

  app.post('/api/membership/members', (req, res) => {
    const { name, email, planId } = req.body ?? {};
    const parsedPlanId = asPositiveInteger(planId);
    const plan = plans.find((entry) => entry.id === parsedPlanId);

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !plan) {
      res.status(400).json({ error: '"name" and "email" are required, and "planId" must match an existing plan' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = members.some((entry) => entry.email.toLowerCase() === normalizedEmail);
    if (existingEmail) {
      res.status(409).json({ error: 'A member with this email already exists' });
      return;
    }

    const member = {
      id: nextMemberId,
      name: name.trim(),
      email: normalizedEmail,
      planId: plan.id,
      status: 'active',
      startedAt: new Date().toISOString(),
      canceledAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };

    nextMemberId += 1;
    members.push(member);

    res.status(201).json({ data: member });
  });

  app.post('/api/membership/members/:id/cancel', (req, res) => {
    const id = Number(req.params.id);
    const member = members.find((entry) => entry.id === id);

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    member.status = 'canceled';
    member.canceledAt = new Date().toISOString();
    res.json({ data: member });
  });

  app.get('/api/podcast/episodes', (_req, res) => {
    res.json({ data: episodes });
  });

  app.post('/api/podcast/episodes', (req, res) => {
    const { title, description = '', isPremium = false } = req.body ?? {};

    if (!isNonEmptyString(title) || !isNonEmptyString(description) || typeof isPremium !== 'boolean') {
      res
        .status(400)
        .json({ error: '"title" and "description" must be non-empty strings, and "isPremium" must be boolean' });
      return;
    }

    const episode = {
      id: nextEpisodeId,
      title: title.trim(),
      description: description.trim(),
      isPremium,
      publishedAt: new Date().toISOString(),
    };

    nextEpisodeId += 1;
    episodes.push(episode);
    res.status(201).json({ data: episode });
  });

  app.get('/api/podcast/access', (req, res) => {
    const memberId = req.query.memberId ? Number(req.query.memberId) : null;
    const episodeId = req.query.episodeId ? Number(req.query.episodeId) : null;
    const episode = episodes.find((entry) => entry.id === episodeId);

    if (!episode) {
      res.status(404).json({ error: 'Episode not found' });
      return;
    }

    if (!episode.isPremium) {
      res.json({ data: { hasAccess: true, reason: 'free_episode' } });
      return;
    }

    const member = members.find((entry) => entry.id === memberId);
    if (!member || member.status !== 'active') {
      res.status(403).json({ data: { hasAccess: false, reason: 'active_membership_required' } });
      return;
    }

    res.json({ data: { hasAccess: true, reason: 'active_member' } });
  });

  app.get('/api/membership/metrics', (_req, res) => {
    const activeMembers = members.filter((entry) => entry.status === 'active');
    const recurringRevenueCents = activeMembers.reduce((total, member) => {
      const plan = plans.find((entry) => entry.id === member.planId);
      return total + (plan?.priceCents ?? 0);
    }, 0);

    const activeMembersByPlan = plans.map((plan) => ({
      planId: plan.id,
      planName: plan.name,
      activeMembers: activeMembers.filter((member) => member.planId === plan.id).length,
    }));

    res.json({
      data: {
        totalPlans: plans.length,
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        recurringRevenueCents,
        activeMembersByPlan,
      },
    });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}
