import { NextResponse, type NextRequest } from "next/server";

import { createMemberSession } from "@/lib/member-auth";
import { getStripeMembership } from "@/lib/stripe-membership";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !secret) return NextResponse.redirect(new URL("/members/access?error=checkout", request.url));

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: "no-store", signal: AbortSignal.timeout(8_000),
  });
  const session = await response.json().catch(() => null);
  const email = session?.customer_details?.email ?? session?.customer_email;
  if (!response.ok || typeof email !== "string") return NextResponse.redirect(new URL("/members/access?error=checkout", request.url));

  const membership = await getStripeMembership(email).catch(() => null);
  if (!membership?.active) return NextResponse.redirect(new URL("/members/access?error=pending", request.url));
  await createMemberSession(email);
  return NextResponse.redirect(new URL("/members", request.url));
}
