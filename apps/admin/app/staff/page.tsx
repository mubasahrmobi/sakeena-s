import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { addStaff, toggleStaff, deleteStaff } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Staff({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <Shell title="Staff">
      <p className="mb-6 max-w-2xl text-sm text-ink/60">
        Staff can manage orders, products, stock, brands, banners and reviews. Only you (the owner) can see sales, coupons, staff and delete orders.
      </p>
      <form action={addStaff} className="mb-8 grid max-w-2xl gap-4 bg-white p-6 md:grid-cols-2">
        <div><label className="label">Name</label><input name="name" required className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div className="md:col-span-2"><label className="label">Password (8+ characters)</label><input name="password" type="password" minLength={8} required className="input" /></div>
        {error === "1" && <p className="text-sm text-red-700 md:col-span-2">Fill in every field. The password needs 8 or more characters.</p>}
        {error === "2" && <p className="text-sm text-red-700 md:col-span-2">That email already has an account.</p>}
        <div className="md:col-span-2"><button className="btn-primary">Add staff member</button></div>
      </form>
      <ul className="max-w-2xl divide-y divide-ink/10 bg-white">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span><b>{u.name}</b> <span className="text-ink/50">· {u.email}</span></span>
            <span className="flex gap-4">
              <form action={toggleStaff}><input type="hidden" name="id" value={u.id} /><button className={`text-xs uppercase tracking-widest ${u.active ? "text-emerald" : "text-ink/40"}`}>{u.active ? "Active" : "Disabled"}</button></form>
              <form action={deleteStaff}><input type="hidden" name="id" value={u.id} /><button className="text-xs uppercase tracking-widest text-red-700">Remove</button></form>
            </span>
          </li>
        ))}
        {users.length === 0 && <li className="p-4 text-ink/50">No staff accounts yet.</li>}
      </ul>
    </Shell>
  );
}
