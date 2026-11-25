import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createSession } from "@/lib/auth";

async function login(form: FormData) {
  "use server";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const okEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  if (email === okEmail && password === process.env.ADMIN_PASSWORD && password) {
    await createSession();
    redirect("/");
  }
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
        {error && <p className="text-sm text-red-700">Incorrect email or password.</p>}
        <button className="btn-primary w-full">Sign in</button>
      </form>
    </div>
  );
}
