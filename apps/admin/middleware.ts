import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/login") return NextResponse.next();
  const token = req.cookies.get("sakeena_admin")?.value;
  try {
    if (!token) throw new Error("no token");
    const s = process.env.AUTH_SECRET;
    if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
    await jwtVerify(token, new TextEncoder().encode(s || "dev-only-secret-change-me"));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"] };
