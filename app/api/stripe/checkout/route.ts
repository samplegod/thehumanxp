import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const plans = {
  supporter: {
    mode: "subscription",
    priceEnv: "STRIPE_SUPPORTER_PRICE_ID",
  },
  monthly: {
    mode: "subscription",
    priceEnv: "STRIPE_MONTHLY_PRICE_ID",
  },
  god: {
    mode: "subscription",
    priceEnv: "STRIPE_GOD_LEVEL_PRICE_ID",
  },
} as const;

type PlanKey = keyof typeof plans;

function getBaseUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.PUBLIC_BASE_URL ??
    request.nextUrl.origin
  );
}

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan");

  if (plan !== "supporter" && plan !== "monthly" && plan !== "god") {
    return NextResponse.json(
      { error: "Invalid membership plan." },
      { status: 400 },
    );
  }

  const selectedPlan = plans[plan as PlanKey];
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[selectedPlan.priceEnv];

  if (!stripeSecretKey || !priceId) {
    return NextResponse.json(
      {
        error:
          `Stripe checkout is not configured for the ${plan} plan. Set STRIPE_SECRET_KEY and ${selectedPlan.priceEnv}.`,
      },
      { status: 503 },
    );
  }

  const baseUrl = getBaseUrl(request);
  const user = await getCurrentUser();
  const params = new URLSearchParams({
    mode: selectedPlan.mode,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${baseUrl}/members?checkout=success`,
    cancel_url: `${baseUrl}/membership?checkout=cancelled#pricing`,
    "metadata[plan]": plan,
    "subscription_data[metadata][plan]": plan,
    allow_promotion_codes: "true",
  });

  if (user?.email) params.set("customer_email", user.email);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const payload = await response.json();

  if (!response.ok || !payload.url) {
    return NextResponse.json(
      {
        error:
          payload?.error?.message ??
          "Stripe checkout session creation failed.",
      },
      { status: response.status || 502 },
    );
  }

  return NextResponse.redirect(payload.url, 303);
}
