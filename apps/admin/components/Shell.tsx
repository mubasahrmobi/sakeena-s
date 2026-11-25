import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "./Logo";
import { destroySession } from "@/lib/auth";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/stock", label: "Stock" },
  { href: "/categories", label: "Categories" },
  { href: "/coupons", label: "Coupons" },
];

async function logout() {
  "use server";
  await destroySession();
  redirect("/login");
}

export function Shell({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-emerald-dark p-6 text-cream md:min-h-screen md:w-64">
        <Logo light />
        <nav className="mt-10 flex flex-wrap gap-1 md:flex-col">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="px-3 py-2 text-sm uppercase tracking-widest hover:bg-emerald">{n.label}</Link>
          ))}
        </nav>
        <form action={logout} className="mt-8"><button className="px-3 text-xs uppercase tracking-widest text-gold-light">Sign out</button></form>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl">{title}</h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
