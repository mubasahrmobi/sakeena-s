import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "sakeena_admin";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-secret-change-me");

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
export async function isAuthed() {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return false;
  try { await jwtVerify(t, secret()); return true; } catch { return false; }
}
export const COOKIE_NAME = COOKIE;
export const jwtSecret = secret;
