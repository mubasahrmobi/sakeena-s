import Link from "next/link";
import { prisma } from "@sakeena/db";
import { ProductCard } from "@/components/ProductCard";
import { LogoMark } from "@/components/Logo";
import { BrandTile } from "@/components/BrandTile";

export const dynamic = "force-dynamic";

export default async function Home() {
  const visible = { active: true, OR: [{ brandId: null }, { brand: { active: true } }] };
  const [featured, sale, categories, brands] = await Promise.all([
    prisma.product.findMany({ where: { ...visible, featured: true }, include: { brand: true }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { ...visible, discountPercent: { gt: 0 } }, include: { brand: true }, take: 4, orderBy: { discountPercent: "desc" } }),
    prisma.category.findMany(),
    prisma.brand.findMany({
      where: { active: true, products: { some: { active: true } } }, orderBy: { name: "asc" }, take: 8,
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
  ]);
  return (
    <>
      <section className="relative overflow-hidden bg-emerald text-cream">
        <div className="absolute -right-24 -top-24 text-gold opacity-20"><LogoMark size={560} /></div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-24 md:grid-cols-2 md:py-36">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold-light">New Season · Winter ’26</p>
            <h1 className="text-5xl leading-[1.1] md:text-7xl">Dressed in <em className="text-gold-light">stillness</em>, made to be remembered.</h1>
            <p className="mt-6 max-w-md text-cream/80">Heirloom-quality lawn, formal wear and everyday kurtas — designed in Pakistan, delivered to your door.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-gold">Shop the collection</Link>
              <Link href="/shop?sale=1" className="btn border border-cream/50 text-cream hover:bg-cream hover:text-emerald">View sale</Link>
            </div>
          </div>
          <div className="relative hidden aspect-[4/5] md:block">
            <div className="absolute inset-0 rotate-3 border border-gold/60" />
            <div className="absolute inset-4 flex items-center justify-center bg-emerald-dark">
              <div className="text-center text-gold-light">
                <LogoMark size={140} />
                <p className="mt-6 font-display text-3xl tracking-[0.3em]">SAKEENA’S</p>
                <p className="mt-2 text-xs uppercase tracking-[0.5em] text-cream/60">Tranquil Elegance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-cream-dark">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 text-center text-xs uppercase tracking-[0.2em] md:grid-cols-4">
          <span>Cash on Delivery</span><span>JazzCash · Easypaisa</span><span>Nationwide delivery</span><span>7-day exchange</span>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-20">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl">Shop by brand</h2>
            <Link href="/brands" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">All brands</Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {brands.map((b) => <BrandTile key={b.id} b={b} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pt-20">
        <h2 className="text-center text-4xl">Shop by category</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`}
              className="flex aspect-[4/3] items-center justify-center border border-emerald/30 bg-white p-4 text-center transition hover:bg-emerald hover:text-cream">
              <span className="font-display text-2xl">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl">Featured</h2>
            <Link href="/shop" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <section className="mt-24 bg-emerald-dark py-20 text-center text-cream">
        <p className="mx-auto max-w-3xl px-5 font-display text-3xl leading-snug md:text-4xl">
          “Sakeena” means <span className="text-gold-light">inner peace</span>. Every piece is cut, stitched and finished to bring a little of it to your day.
        </p>
        <Link href="/about" className="mt-8 inline-block text-sm uppercase tracking-widest text-gold-light underline underline-offset-8">Our story</Link>
      </section>

      {sale.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl">On sale</h2>
            <Link href="/shop?sale=1" className="text-sm uppercase tracking-widest text-emerald underline underline-offset-8">All offers</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {sale.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
