import { NextResponse, type NextRequest } from "next/server";

import { createMemberSession, readMemberToken } from "@/lib/member-auth";
import { getStripeMembership } from "@/lib/stripe-membership";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = token ? await readMemberToken(token, "access") : null;
  if (!email) return NextResponse.redirect(new URL("/members/access?error=expired", request.url));

  const membership = await getStripeMembership(email).catch(() => null);
  if (!membership?.active) return NextResponse.redirect(new URL("/members/access?error=inactive", request.url));
  await createMemberSession(email);
  return NextResponse.redirect(new URL("/members", request.url));
}
