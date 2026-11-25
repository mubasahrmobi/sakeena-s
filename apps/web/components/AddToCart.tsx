"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export function AddToCart(p: {
  productId: string; slug: string; name: string; price: number;
  sizes: string[]; colors: string[]; stock: number;
}) {
  const { add } = useCart();
  const [size, setSize] = useState(p.sizes[0] ?? "");
  const [color, setColor] = useState(p.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = p.stock <= 0;
  const pill = (on: boolean) =>
    `min-w-12 border px-4 py-2 text-sm transition ${on ? "border-emerald bg-emerald text-cream" : "border-ink/20 hover:border-emerald"}`;

  return (
    <div className="mt-8 space-y-6">
      {p.sizes.length > 0 && (
        <div>
          <span className="label">Size</span>
          <div className="flex flex-wrap gap-2">
            {p.sizes.map((s) => <button key={s} type="button" onClick={() => setSize(s)} className={pill(s === size)}>{s}</button>)}
          </div>
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
          <button type="button" className="px-4 py-2" onClick={() => setQty(Math.min(p.stock || 1, qty + 1))}>+</button>
        </div>
      </div>
      <button
        disabled={soldOut}
        className="btn-primary w-full"
        onClick={() => {
          add({ productId: p.productId, slug: p.slug, name: p.name, price: p.price, size, color, qty });
          setAdded(true);
          setTimeout(() => setAdded(false), 2500);
        }}
      >
        {soldOut ? "Sold out" : "Add to bag"}
      </button>
      {added && (
        <p className="text-sm text-emerald">
          Added to your bag. <Link href="/cart" className="underline">View bag</Link>
        </p>
      )}
    </div>
  );
}
