import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@sakeena/db";
import { Logo } from "@/components/Logo";
import { createSession, safeEqual, verifyPassword } from "@/lib/auth";

const MAX_TRIES = 5; // wrong attempts allowed per email + address ...
const WINDOW_MS = 15 * 60 * 1000; // ... within 15 minutes

async function login(form: FormData) {
  "use server";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${email}|${ip}`;

  const since = new Date(Date.now() - WINDOW_MS);
  if ((await prisma.loginAttempt.count({ where: { key, createdAt: { gt: since } } })) >= MAX_TRIES) redirect("/login?error=locked");

  // The owner account comes from the environment; staff accounts live in the database.
  const ownerEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const ownerPass = process.env.ADMIN_PASSWORD ?? "";
  if (ownerPass && email === ownerEmail && safeEqual(password, ownerPass)) {
    await prisma.loginAttempt.deleteMany({ where: { key } });
    await createSession({ role: "OWNER", email, name: "Owner" });
    redirect("/");
  }
  const staff = await prisma.adminUser.findUnique({ where: { email } });
  if (staff?.active && verifyPassword(password, staff.passwordHash)) {
    await prisma.loginAttempt.deleteMany({ where: { key } });
    await createSession({ role: staff.role === "OWNER" ? "OWNER" : "STAFF", email, name: staff.name });
    redirect("/");
  }
  await prisma.loginAttempt.create({ data: { key } });
  redirect("/login?error=1");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald px-5">
      <form action={login} className="w-full max-w-sm space-y-5 bg-cream p-8">
        <div className="flex justify-center"><Logo /></div>
        <p className="text-center text-xs uppercase tracking-[0.3em] text-ink/50">Admin panel</p>
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">Password</label><input name="password" type="password" required className="input" /></div>
        {error === "locked" && <p className="text-sm text-red-700">Too many wrong attempts. Try again in 15 minutes.</p>}
        {error === "1" && <p className="text-sm text-red-700">Incorrect email or password.</p>}
        <button className="btn-primary w-full">Sign in</button>
      </form>
    </div>
  );
}
