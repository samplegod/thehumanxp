import { NextResponse, type NextRequest } from "next/server";

import { createMemberToken, memberSessionCookieOptions, MEMBER_SESSION_COOKIE, readMemberToken } from "@/lib/member-auth";
import { getStripeMembership } from "@/lib/stripe-membership";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const token = request.nextUrl.searchParams.get("token");
  const email = token ? await readMemberToken(token, "access") : null;
  if (!email) {
    console.warn("[members/verify] rejected", { reason: "invalid-or-expired-token" });
    return NextResponse.redirect(new URL("/members/access?error=expired", siteUrl), 303);
  }

  const membership = await getStripeMembership(email).catch(() => null);
  if (!membership?.active) {
    console.warn("[members/verify] rejected", { reason: "inactive-subscription" });
    return NextResponse.redirect(new URL("/members/access?error=inactive", siteUrl), 303);
  }

  // Set the session on the same response that performs the canonical redirect.
  // This avoids losing a cookie across deployment aliases or forwarded hosts.
  const sessionToken = await createMemberToken(email, "session", "7d");
  const destination = new URL("/members", siteUrl);
  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(MEMBER_SESSION_COOKIE, sessionToken, memberSessionCookieOptions);
  console.info("[members/verify] success", { redirectPath: destination.pathname, cookiePath: memberSessionCookieOptions.path });
  return response;
}
