import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE = "hxp_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "local-development-secret-change-before-production");

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("14d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.userId !== "string") return null;
    return db.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true, handle: true, bio: true, image: true, location: true, showLocation: true, interests: true, role: true, membership: true } });
  } catch { return null; }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/community/login");
  return user;
}
