"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { SizeGuide } from "./SizeGuide";

export function AddToCart(p: {
  productId: string; slug: string; name: string; price: number;
  sizes: string[]; colors: string[];
  /** stock per size, e.g. { S: 3, M: 0 }. Empty for older products tracked by a single total. */
  sizeStock: Record<string, number>;
  stock: number;
}) {
  const { add } = useCart();
  const perSize = Object.keys(p.sizeStock).length > 0;
  const left = (s: string) => (perSize ? p.sizeStock[s] ?? 0 : p.stock);
  const firstAvailable = p.sizes.find((s) => left(s) > 0) ?? p.sizes[0] ?? "";

  const [size, setSize] = useState(firstAvailable);
  const [color, setColor] = useState(p.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const max = Math.max(1, left(size));
  const soldOut = p.sizes.length ? p.sizes.every((s) => left(s) <= 0) : p.stock <= 0;
  const sizeSoldOut = left(size) <= 0;
  const pill = (on: boolean, off = false) =>
    `min-w-12 border px-4 py-2 text-sm transition ${off ? "cursor-not-allowed border-ink/10 text-ink/30 line-through" : on ? "border-emerald bg-emerald text-cream" : "border-ink/20 hover:border-emerald"}`;

  return (
    <div className="mt-8 space-y-6">
      {p.sizes.length > 0 && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="label !mb-0">Size</span>
            <SizeGuide />
          </div>
          <div className="flex flex-wrap gap-2">
            {p.sizes.map((s) => (
              <button key={s} type="button" disabled={left(s) <= 0} onClick={() => { setSize(s); setQty(1); }} className={pill(s === size, left(s) <= 0)}>{s}</button>
            ))}
          </div>
          {!sizeSoldOut && left(size) <= 3 && <p className="mt-2 text-sm text-red-700">Only {left(size)} left in size {size}</p>}
        </div>
      )}
      {p.colors.length > 0 && (
        <div>
          <span className="label">Colour</span>
          <div className="flex flex-wrap gap-2">
            {p.colors.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={pill(c === color)}>{c}</button>)}
          </div>
        </div>
      )}
      <div>
        <span className="label">Quantity</span>
        <div className="inline-flex items-center border border-ink/20">
          <button type="button" className="px-4 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span className="w-10 text-center">{qty}</span>
          <button type="button" className="px-4 py-2" onClick={() => setQty(Math.min(max, qty + 1))}>+</button>
        </div>
      </div>
      <button
        disabled={soldOut || sizeSoldOut}
        className="btn-primary w-full"
        onClick={() => {
          add({ productId: p.productId, slug: p.slug, name: p.name, price: p.price, size, color, qty });
          setAdded(true);
          setTimeout(() => setAdded(false), 2500);
        }}
      >
        {soldOut ? "Sold out" : sizeSoldOut ? "This size is sold out" : "Add to bag"}
      </button>
      {added && (
        <p className="text-sm text-emerald">
          Added to your bag. <Link href="/cart" className="underline">View bag</Link>
        </p>
      )}
    </div>
  );
}
