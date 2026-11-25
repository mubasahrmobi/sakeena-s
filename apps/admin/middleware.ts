import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Pages only the owner may open. Staff are sent back to the dashboard.
const OWNER_ONLY = ["/sales", "/staff", "/coupons"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path === "/login") return NextResponse.next();
  const token = req.cookies.get("sakeena_admin")?.value;
  try {
    if (!token) throw new Error("no token");
    const s = process.env.AUTH_SECRET;
    if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(s || "dev-only-secret-change-me"));
    if (payload.role !== "OWNER" && OWNER_ONLY.some((p) => path === p || path.startsWith(p + "/"))) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"] };
