import { NextResponse } from "next/server";

const KIT_API_URL = "https://api.kit.com/v4";

function kitHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "User-Agent": "HXP-Website/1.0",
    "X-Kit-Api-Key": apiKey,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) {
    return NextResponse.json({ error: "Newsletter signup is not configured yet." }, { status: 503 });
  }

  try {
    const headers = kitHeaders(apiKey);
    const subscriberResponse = await fetch(`${KIT_API_URL}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!subscriberResponse.ok) {
      return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
    }

    const subscriberPayload = await subscriberResponse.json().catch(() => null);
    const subscriberId = subscriberPayload?.subscriber?.id;
    if (typeof subscriberId !== "number" && typeof subscriberId !== "string") {
      return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
    }

    const referrer = request.headers.get("referer") ?? new URL(request.url).origin;
    const formResponse = await fetch(
      `${KIT_API_URL}/forms/${encodeURIComponent(formId)}/subscribers/${encodeURIComponent(String(subscriberId))}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ referrer }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (formResponse.ok) return NextResponse.json({ ok: true });

    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
  }
}
