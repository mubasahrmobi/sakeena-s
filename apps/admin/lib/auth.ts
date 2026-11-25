import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "sakeena_admin";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  // Never fall back to a known secret on a live site: anyone could forge an admin login.
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s || "dev-only-secret-change-me");
};

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
