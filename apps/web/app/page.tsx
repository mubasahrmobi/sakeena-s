import Link from "next/link";
import { prisma } from "@sakeena/db";
import { ProductCard } from "@/components/ProductCard";
import { BrandTile } from "@/components/BrandTile";
import { BrandMarquee } from "@/components/BrandMarquee";
import { Carousel } from "@/components/Carousel";
import { HeroSlider, type Slide } from "@/components/HeroSlider";

export const dynamic = "force-dynamic";

const perks = [
  { icon: "✦", title: "Top brands, one store", text: "Your favourite labels, together in one place." },
  { icon: "◈", title: "Pay your way", text: "Cash on delivery, JazzCash, Easypaisa or bank transfer." },
  { icon: "❖", title: "Delivered nationwide", text: "3–5 working days. Free over Rs. 5,000." },
  { icon: "❀", title: "Easy exchange", text: "7-day exchange if it isn’t the right fit." },
];

export default async function Home() {
  const visible = { active: true, OR: [{ brandId: null }, { brand: { active: true } }] };
  const [latest, featured, sale, categories, brands] = await Promise.all([
    prisma.product.findMany({ where: visible, include: { brand: true }, take: 10, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { ...visible, featured: true }, include: { brand: true }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { ...visible, discountPercent: { gt: 0 } }, include: { brand: true }, take: 10, orderBy: { discountPercent: "desc" } }),
    prisma.category.findMany(),
    prisma.brand.findMany({
      where: { active: true, products: { some: { active: true } } }, orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
  ]);

  const maxDiscount = sale[0]?.discountPercent ?? 0;
  const slides: Slide[] = [
    {
      kind: "brand", eyebrow: "Sakeena’s · Tranquil Elegance",
      title: "The finest Pakistani fashion, all in one place.",
      text: "Shop top brands and our own label — lawn, formal wear, kurtas and shawls, delivered to your door.",
      ctas: [{ label: "Shop now", href: "/shop" }, { label: "Explore brands", href: "/brands", ghost: true }],
    },
    ...(brands.length > 1 ? [{
      kind: "brands" as const, eyebrow: "Top brands",
      title: "Your favourite labels, under one roof.",
      text: "Browse brand by brand, or shop everything together. New arrivals added regularly.",
      brands: brands.map((b) => b.name),
      ctas: [{ label: "View all brands", href: "/brands" }],
    }] : []),
    ...(maxDiscount > 0 ? [{
      kind: "sale" as const, eyebrow: "Limited time",
      title: "The sale you’ve been waiting for.",
      text: "Premium pieces at lower prices while stock lasts. Cash on delivery available.",
      discount: maxDiscount,
      ctas: [{ label: "Shop the sale", href: "/shop?sale=1" }],
    }] : []),
    {
      kind: "new", eyebrow: "New season",
      title: "Fresh arrivals, just landed.",
      text: "Be the first to wear the newest collection from our brands.",
      ctas: [{ label: "See what’s new", href: "/shop" }],
    },
  ];

  return (
    <>
      <HeroSlider slides={slides} />
      <BrandMarquee brands={brands} />

      <section className="border-b border-ink/10 bg-cream-dark">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold text-gold">{p.icon}</span>
              <div>
                <p className="font-display text-lg leading-tight">{p.title}</p>
                <p className="mt-1 text-sm text-ink/60">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-gold">Shop by label</p>
            <h2 className="mt-2 text-4xl md:text-5xl">Top Brands</h2>
          </div>
          <Carousel itemClass="w-[46%] md:w-[19%]">
            {brands.map((b) => <BrandTile key={b.id} b={b} />)}
          </Carousel>
          <div className="mt-8 text-center"><Link href="/brands" className="btn-outline">View all brands</Link></div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-gold">Just in</p>
              <h2 className="mt-2 text-4xl md:text-5xl">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">View all</Link>
          </div>
          <Carousel>{latest.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel>
        </section>
      )}

      {maxDiscount > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-5">
          <div className="pattern-star relative overflow-hidden bg-emerald px-8 py-14 text-center text-cream md:py-20">
            <p className="text-xs uppercase tracking-[0.5em] text-gold-light">Sale is on</p>
            <h2 className="mt-3 text-4xl md:text-6xl">Up to <span className="italic text-gold-light">{maxDiscount}% off</span> top brands</h2>
            <Link href="/shop?sale=1" className="btn-gold mt-8">Shop the sale</Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <h2 className="text-center text-4xl md:text-5xl">Shop by category</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`}
              className={`group relative flex aspect-[4/3] items-center justify-center overflow-hidden p-4 text-center transition ${i % 2 ? "bg-cream-dark" : "bg-emerald text-cream"}`}>
              <span className="pattern-star absolute inset-0 opacity-70 transition group-hover:scale-110" />
              <span className="relative font-display text-2xl">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-gold">Hand-picked</p>
            <h2 className="mt-2 text-4xl md:text-5xl">Featured</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {sale.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl md:text-5xl">On Sale</h2>
            <Link href="/shop?sale=1" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">All offers</Link>
          </div>
          <Carousel>{sale.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel>
        </section>
      )}

      <section className="pattern-star mt-24 bg-emerald-dark py-20 text-center text-cream">
        <p className="mx-auto max-w-3xl px-5 font-display text-3xl leading-snug md:text-4xl">
          “Sakeena” means <span className="text-gold-light">inner peace</span>. Shopping should feel the same — easy, trusted and calm.
        </p>
        <Link href="/about" className="mt-8 inline-block text-sm uppercase tracking-widest text-gold-light underline underline-offset-8">Our story</Link>
      </section>
    </>
  );
}
