import { NextResponse } from "next/server";
import { z } from "zod";

import { createMemberToken } from "@/lib/member-auth";
import { getStripeMembership } from "@/lib/stripe-membership";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().email().max(160) });

export async function POST(request: Request) {
  const startedAt = Date.now();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  try {
    const email = parsed.data.email.toLowerCase();
    const membership = await getStripeMembership(email);
    if (membership.active) await sendAccessEmail(request, email);
    console.info("[members/access] completed", { active: membership.active, durationMs: Date.now() - startedAt });
  } catch (error) {
    console.error("[members/access] failed", { error: error instanceof Error ? error.message : String(error), durationMs: Date.now() - startedAt });
    return NextResponse.json({ error: "Member access is temporarily unavailable. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, message: "If that email has an active membership, a private access link is on its way." });
}

async function sendAccessEmail(request: Request, email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredDomain = process.env.RESEND_EMAIL_DOMAIN;
  if (!apiKey || !configuredDomain) throw new Error("Member email delivery is not configured.");

  const from = configuredDomain.includes("@") ? configuredDomain : `HXP Members <members@${configuredDomain}>`;
  const token = await createMemberToken(email, "access", "15m");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const accessUrl = `${siteUrl}/api/members/verify?token=${encodeURIComponent(token)}`;
  console.info("[members/access] sending callback", { callbackPath: `${siteUrl}/api/members/verify`, successPath: `${siteUrl}/members` });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your private HXP archive link",
      text: `Enter the HXP members room: ${accessUrl}\n\nThis secure link expires in 15 minutes.`,
      html: `<div style="background:#07080c;color:#f4eddf;padding:40px;font-family:Georgia,serif"><p style="color:#d9bd82;letter-spacing:.16em;text-transform:uppercase;font:11px Arial,sans-serif">The Human Experience</p><h1>Your private archive is ready.</h1><p style="color:#aaa;line-height:1.7">This secure link expires in 15 minutes.</p><p><a href="${accessUrl}" style="display:inline-block;background:#ddc187;color:#08090c;padding:15px 20px;text-decoration:none;font:700 11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase">Enter the members room</a></p></div>`,
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Member email delivery failed (${response.status}).`);
}
