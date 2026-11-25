import Link from "next/link";
import { finalPrice, formatPKR, parseLines } from "@sakeena/db/utils";
import { ProductImage } from "./ProductImage";

type P = { slug: string; name: string; price: number; discountPercent: number; images: string; stock: number };

export function ProductCard({ p }: { p: P }) {
  const price = finalPrice(p.price, p.discountPercent);
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative">
        <ProductImage src={parseLines(p.images)[0]} name={p.name} className="aspect-[3/4]" />
        {p.discountPercent > 0 && (
          <span className="absolute left-3 top-3 bg-gold px-3 py-1 text-[11px] uppercase tracking-widest text-white">
            {p.discountPercent}% off
          </span>
        )}
        {p.stock <= 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-xs uppercase tracking-widest text-cream">Sold out</span>
        )}
      </div>
      <h3 className="mt-4 text-lg leading-snug">{p.name}</h3>
      <p className="mt-1 text-sm">
        <span className="font-medium text-emerald">{formatPKR(price)}</span>
        {p.discountPercent > 0 && <span className="ml-2 text-ink/40 line-through">{formatPKR(p.price)}</span>}
      </p>
    </Link>
  );
}
