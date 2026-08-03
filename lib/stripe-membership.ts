import "server-only";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

type StripeCustomerList = {
  data?: Array<{ id?: string }>;
};

type StripeSubscriptionList = {
  data?: Array<{
    id?: string;
    status?: string;
    current_period_end?: number;
    items?: { data?: Array<{ price?: { id?: string } }> };
  }>;
};

export type StripeMembership = {
  active: boolean;
  status: string | null;
  renewsAt: Date | null;
};

async function stripeRequest<T>(path: string, params: URLSearchParams): Promise<T> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not configured.");

  const response = await fetch(`https://api.stripe.com/v1/${path}?${params}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? `Stripe request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export async function getStripeMembership(email: string): Promise<StripeMembership> {
  const customers = await stripeRequest<StripeCustomerList>(
    "customers",
    new URLSearchParams({ email: email.toLowerCase(), limit: "100" }),
  );

  const subscriptionLists = await Promise.all(
    (customers.data ?? []).flatMap((customer) =>
      customer.id
        ? [
            stripeRequest<StripeSubscriptionList>(
              "subscriptions",
              new URLSearchParams({ customer: customer.id, status: "all", limit: "100" }),
            ),
          ]
        : [],
    ),
  );

  const subscriptions = subscriptionLists.flatMap((list) => list.data ?? []);
  const active = subscriptions.find((subscription) =>
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status ?? ""),
  );

  return {
    active: Boolean(active),
    status: active?.status ?? subscriptions[0]?.status ?? null,
    renewsAt: active?.current_period_end
      ? new Date(active.current_period_end * 1000)
      : null,
  };
}
