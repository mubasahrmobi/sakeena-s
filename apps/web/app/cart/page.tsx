"use client";
import Link from "next/link";
import { useCart, keyOf } from "@/lib/cart";
import { formatPKR, shippingFor } from "@sakeena/db/utils";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-4xl">Your bag is empty</h1>
        <p className="mt-4 text-ink/60">Find something you’ll love.</p>
        <Link href="/shop" className="btn-primary mt-8">Start shopping</Link>
      </div>
    );
  }
  const shipping = shippingFor(subtotal);
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1fr_340px]">
      <div>
        <h1 className="mb-8 text-4xl">Your bag</h1>
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {items.map((i) => {
            const k = keyOf(i);
            return (
              <li key={k} className="flex items-center justify-between gap-4 py-5">
                <div>
                  <Link href={`/product/${i.slug}`} className="font-display text-xl">{i.name}</Link>
                  <p className="text-sm text-ink/60">Size {i.size}{i.color && ` · ${i.color}`}</p>
                  <button onClick={() => remove(k)} className="mt-2 text-xs uppercase tracking-widest text-ink/50 underline">Remove</button>
                </div>
                <div className="flex items-center gap-6">
                  <div className="inline-flex items-center border border-ink/20">
                    <button className="px-3 py-1" onClick={() => setQty(k, i.qty - 1)}>−</button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button className="px-3 py-1" onClick={() => setQty(k, i.qty + 1)}>+</button>
                  </div>
                  <span className="w-28 text-right">{formatPKR(i.price * i.qty)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit bg-white p-6">
        <h2 className="text-2xl">Summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{shipping === 0 ? "Free" : formatPKR(shipping)}</dd></div>
          <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium"><dt>Total</dt><dd>{formatPKR(subtotal + shipping)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-6 w-full">Checkout</Link>
      </aside>
    </div>
  );
}
