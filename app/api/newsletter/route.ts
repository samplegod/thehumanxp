import { NextResponse } from "next/server";

const RESEND_CONTACTS_URL = "https://api.resend.com/contacts";

function resendHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "HXP-Website/1.0",
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  if (!apiKey || !segmentId) {
    return NextResponse.json({ error: "Newsletter signup is not configured yet." }, { status: 503 });
  }

  try {
    const response = await fetch(RESEND_CONTACTS_URL, {
      method: "POST",
      headers: resendHeaders(apiKey),
      body: JSON.stringify({
        email,
        unsubscribed: false,
        segments: [{ id: segmentId }],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) return NextResponse.json({ ok: true });

    // A returning subscriber may already exist as a global Resend contact.
    // Ensure that contact belongs to the newsletter segment and treat the
    // operation as idempotent.
    if (response.status === 409) {
      const addToSegment = await fetch(
        `${RESEND_CONTACTS_URL}/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`,
        {
          method: "POST",
          headers: resendHeaders(apiKey),
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        },
      );

      if (addToSegment.ok || addToSegment.status === 409) {
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 502 });
  }
}
