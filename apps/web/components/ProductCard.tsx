import Link from "next/link";
import { finalPrice, formatPKR, parseLines } from "@sakeena/db/utils";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";
import { Tilt } from "./Tilt";

type P = { slug: string; name: string; price: number; discountPercent: number; images: string; stock: number; brand?: { name: string } | null };

export function ProductCard({ p }: { p: P }) {
  const price = finalPrice(p.price, p.discountPercent);
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      {/* the photo tilts toward the mouse; the badge floats in front of it */}
      <Tilt max={7} scale={1.03} className="lift">
        <ProductImage src={parseLines(p.images)[0]} name={p.name} className="aspect-[3/4]" />
        {p.discountPercent > 0 && (
          <span
            className="absolute left-3 top-3 bg-gold px-3 py-1 text-[11px] uppercase tracking-widest text-white shadow-lg"
            style={{ transform: "translateZ(36px)" }}
          >
            {p.discountPercent}% off
          </span>
        )}
        <WishlistButton slug={p.slug} className="absolute right-3 top-3" />
        {p.stock <= 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-xs uppercase tracking-widest text-cream">Sold out</span>
        )}
      </Tilt>
      {p.brand && <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-gold">{p.brand.name}</p>}
      <h3 className={`${p.brand ? "mt-1" : "mt-4"} text-lg leading-snug`}>{p.name}</h3>
      <p className="mt-1 text-sm">
        <span className="font-medium text-emerald">{formatPKR(price)}</span>
        {p.discountPercent > 0 && <span className="ml-2 text-ink/40 line-through">{formatPKR(p.price)}</span>}
      </p>
    </Link>
  );
}
