import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { clearSession, createSession, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const signupSchema = z.object({
  action: z.literal("signup"),
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(160),
  handle: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,30}$/),
  password: z.string().min(10).max(128),
});
const loginSchema = z.object({ action: z.literal("login"), email: z.string().email(), password: z.string().min(1) });

export async function GET() {
  return NextResponse.json({ user: await getCurrentUser() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (body?.action === "logout") {
    await clearSession();
    return NextResponse.json({ ok: true });
  }
  if (body?.action === "signup") {
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const exists = await db.user.findFirst({ where: { OR: [{ email: parsed.data.email.toLowerCase() }, { handle: parsed.data.handle }] } });
    if (exists) return NextResponse.json({ error: "That email or handle is already in use." }, { status: 409 });
    const user = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), handle: parsed.data.handle, passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
    await createSession(user.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.user.delete({ where: { id: user.id } });
  await clearSession();
  return NextResponse.json({ ok: true });
}
