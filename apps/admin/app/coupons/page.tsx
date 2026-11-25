import { prisma } from "@sakeena/db";
import { Shell } from "@/components/Shell";
import { addCoupon, toggleCoupon } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Coupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return (
    <Shell title="Coupons">
      <form action={addCoupon} className="mb-8 flex max-w-lg gap-3">
        <input name="code" required placeholder="CODE" className="input" />
        <input name="percent" type="number" min={1} max={90} required placeholder="% off" className="input !w-28" />
        <button className="btn-primary">Add</button>
      </form>
      <ul className="max-w-lg divide-y divide-ink/10 bg-white">
        {coupons.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-4 text-sm">
            <span className="font-medium">{c.code} <span className="text-ink/50">— {c.percent}% off</span></span>
            <form action={toggleCoupon}>
              <input type="hidden" name="id" value={c.id} />
              <button className={`text-xs uppercase tracking-widest ${c.active ? "text-emerald" : "text-ink/40"}`}>{c.active ? "Active" : "Disabled"}</button>
            </form>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
