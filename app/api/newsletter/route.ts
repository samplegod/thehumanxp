import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: "Newsletter signup is not configured yet. Add NEWSLETTER_WEBHOOK_URL to enable it." }, { status: 503 });
  const response = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "hxp-website" }) });
  if (!response.ok) return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
