"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPKR, shippingFor, PAYMENT_METHODS } from "@sakeena/db/utils";
import { placeOrder } from "@/app/checkout/actions";

type Instr = Record<string, { title: string; lines: string[] } | null>;

export function CheckoutForm({ instructions }: { instructions: Instr }) {
  const { items, subtotal } = useCart();
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const [method, setMethod] = useState<string>("COD");
  const shipping = shippingFor(subtotal);
  const current = PAYMENT_METHODS.find((m) => m.id === method)!;

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/60">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary mt-6">Shop now</Link>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-12 md:grid-cols-[1fr_360px]">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="space-y-10">
        <section>
          <h2 className="mb-5 text-2xl">Delivery details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label">Full name</label><input name="name" required className="input" /></div>
            <div><label className="label">Mobile (03XX…)</label><input name="phone" required inputMode="tel" placeholder="03001234567" className="input" /></div>
            <div className="md:col-span-2"><label className="label">Email (optional)</label><input name="email" type="email" className="input" /></div>
            <div className="md:col-span-2"><label className="label">Complete address</label><textarea name="address" required rows={2} className="input" /></div>
            <div><label className="label">City</label><input name="city" required className="input" /></div>
            <div><label className="label">Order notes</label><input name="notes" className="input" /></div>
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl">Payment</h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={`flex cursor-pointer gap-3 border p-4 ${method === m.id ? "border-emerald bg-white" : "border-ink/15"}`}>
                <input type="radio" name="paymentMethod" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 accent-emerald" />
                <span><span className="block font-medium">{m.label}</span><span className="text-sm text-ink/60">{m.hint}</span></span>
              </label>
            ))}
          </div>
          {current.manual && instructions[method] && (
            <div className="mt-5 border border-gold/50 bg-gold/10 p-5 text-sm">
              <p className="font-medium">{instructions[method]!.title}</p>
              <ul className="mt-2 space-y-1">{instructions[method]!.lines.map((l) => <li key={l}>{l}</li>)}</ul>
              <p className="mt-3">Send <b>{formatPKR(subtotal + shipping)}</b> and enter the transaction ID below. We verify every payment before dispatch.</p>
              <input name="paymentRef" required placeholder="Transaction / reference ID" className="input mt-3" />
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit space-y-4 bg-white p-6">
        <h2 className="text-2xl">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={`${i.productId}${i.size}${i.color}`} className="flex justify-between gap-3">
              <span>{i.name} <span className="text-ink/50">×{i.qty} · {i.size}</span></span>
              <span>{formatPKR(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div><label className="label">Coupon code</label><input name="coupon" placeholder="e.g. WELCOME10" className="input" /></div>
        <dl className="space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{shipping === 0 ? "Free" : formatPKR(shipping)}</dd></div>
          <div className="flex justify-between text-base font-medium"><dt>Total (before coupon)</dt><dd>{formatPKR(subtotal + shipping)}</dd></div>
        </dl>
        {state?.error && <p className="bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full">{pending ? "Placing order…" : "Place order"}</button>
      </aside>
    </form>
  );
}
