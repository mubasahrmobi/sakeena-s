import { redirect } from "next/navigation";
import { prisma } from "@sakeena/db";

export const metadata = { title: "Track your order" };

async function find(form: FormData) {
  "use server";
  const orderNo = String(form.get("orderNo") ?? "").trim().toUpperCase();
  const digits = String(form.get("phone") ?? "").replace(/\D/g, "").slice(-10);
  const o = digits.length === 10 && orderNo ? await prisma.order.findUnique({ where: { orderNo } }) : null;
  // Order number AND phone must match, so nobody can browse other people's orders.
  if (o?.trackingId && o.phone.replace(/\D/g, "").endsWith(digits)) redirect(`/track/${o.trackingId}`);
  redirect("/track?error=1");
}

export default async function TrackLookup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-center text-4xl">Track your order</h1>
      <p className="mt-3 text-center text-sm text-ink/60">Enter your order number and the mobile number you ordered with. Or use the link we sent you.</p>
      <form action={find} className="mt-8 space-y-4 bg-white p-6">
        <div><label className="label">Order number</label><input name="orderNo" required placeholder="SK-123456" className="input" /></div>
        <div><label className="label">Mobile number</label><input name="phone" required placeholder="03001234567" className="input" /></div>
        {error && <p className="text-sm text-red-700">We couldn’t find an order with those details.</p>}
        <button className="btn-primary w-full">Track order</button>
      </form>
    </div>
  );
}
