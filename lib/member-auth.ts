import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "hxp_member_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured.");
  return new TextEncoder().encode(value);
}

export async function createMemberToken(email: string, purpose: "access" | "session", expiresIn: string) {
  return new SignJWT({ email: email.toLowerCase(), purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret());
}

export async function readMemberToken(token: string, purpose: "access" | "session") {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== purpose || typeof payload.email !== "string") return null;
    return payload.email;
  } catch {
    return null;
  }
}

export async function createMemberSession(email: string) {
  const token = await createMemberToken(email, "session", "7d");
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getMemberEmail() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? readMemberToken(token, "session") : null;
}
