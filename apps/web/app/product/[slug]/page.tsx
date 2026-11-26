import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, finalPrice, formatPKR, parseLines, parseList } from "@sakeena/db";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { AddToCart } from "@/components/AddToCart";
import { WishlistButton } from "@/components/WishlistButton";
import { ReviewForm } from "@/components/ReviewForm";
import { abs, SITE_URL } from "@/lib/site";
import { getProduct } from "@/lib/cache";

export const revalidate = 60; // served from cache; refreshed at most once a minute (or instantly by the admin)
// Existing products are built ahead of time so even the first visitor gets a fast page.
// Products added later are built the first time someone opens them, then cached.
export async function generateStaticParams() {
  const rows = await prisma.product.findMany({ where: { active: true }, select: { slug: true }, take: 300 });
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product" };
  const img = parseLines(p.images)[0];
  const desc = p.description.slice(0, 155);
  return {
    title: p.brand ? `${p.name} — ${p.brand.name}` : p.name,
    description: desc,
    alternates: { canonical: `${SITE_URL}/product/${p.slug}` },
    openGraph: { title: p.name, description: desc, type: "website", url: `${SITE_URL}/product/${p.slug}`, images: img ? [abs(img)] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p || !p.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, categoryId: p.categoryId, NOT: { id: p.id } },
    take: 4,
    include: { brand: true },
  });
  const images = parseLines(p.images);
  const price = finalPrice(p.price, p.discountPercent);
  const sizeStock = Object.fromEntries(p.sizeStocks.map((s) => [s.size, s.stock]));
  const avg = p.reviews.length ? p.reviews.reduce((n, r) => n + r.rating, 0) / p.reviews.length : 0;
  const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

  // Structured data so Google can show price, stock and rating in search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: images.map(abs),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand.name } } : {}),
    offers: {
      "@type": "Offer", priceCurrency: "PKR", price: price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${p.slug}`,
    },
    ...(p.reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: p.reviews.length } } : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-12 md:grid-cols-2">
        <div className="grid gap-4">
          {(images.length ? images : [undefined]).map((src, i) => (
            <ProductImage key={i} src={src} name={p.name} natural className={src ? "" : "aspect-[3/4]"} />
          ))}
        </div>
        <div className="md:sticky md:top-32 md:self-start">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">
              {p.brand && <><Link href={`/brand/${p.brand.slug}`} className="underline underline-offset-4">{p.brand.name}</Link> · </>}
              {p.category.name}
            </p>
            <WishlistButton slug={p.slug} className="border border-ink/10" />
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl">{p.name}</h1>
          {p.reviews.length > 0 && (
            <a href="#reviews" className="mt-3 inline-block text-sm text-gold">{stars(avg)} <span className="text-ink/60 underline">{p.reviews.length} {p.reviews.length === 1 ? "review" : "reviews"}</span></a>
          )}
          <p className="mt-5 text-2xl">
            <span className="text-emerald">{formatPKR(price)}</span>
            {p.discountPercent > 0 && (
              <>
                <span className="ml-3 text-lg text-ink/40 line-through">{formatPKR(p.price)}</span>
                <span className="ml-3 bg-gold px-2 py-1 align-middle text-xs uppercase tracking-widest text-white">Save {p.discountPercent}%</span>
              </>
            )}
          </p>
          <p className="mt-6 leading-relaxed text-ink/80">{p.description}</p>
          <AddToCart
            productId={p.id} slug={p.slug} name={p.name} price={price}
            sizes={parseList(p.sizes)} colors={parseList(p.colors)} sizeStock={sizeStock} stock={p.stock}
          />
          <ul className="mt-8 space-y-2 border-t border-ink/10 pt-6 text-sm text-ink/70">
            <li>Delivery across Pakistan in 3–5 working days</li>
            <li>Cash on Delivery · JazzCash · Easypaisa · Bank transfer</li>
            <li>7-day easy exchange</li>
          </ul>
        </div>
      </div>

      <section id="reviews" className="mt-24 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-3xl">Customer reviews</h2>
          {p.reviews.length === 0 ? (
            <p className="mt-4 text-ink/60">No reviews yet. Be the first to share your thoughts.</p>
          ) : (
            <ul className="mt-6 divide-y divide-ink/10">
              {p.reviews.map((r) => (
                <li key={r.id} className="py-5">
                  <p className="text-gold">{stars(r.rating)}</p>
                  <p className="mt-2 text-ink/80">{r.comment}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">{r.name} · {r.createdAt.toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ReviewForm slug={p.slug} />
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-3xl">You may also love</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
