import { notFound } from "next/navigation";
import { prisma, finalPrice, formatPKR, parseLines, parseList } from "@sakeena/db";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { AddToCart } from "@/components/AddToCart";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
  if (!p || !p.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, categoryId: p.categoryId, NOT: { id: p.id } },
    take: 4,
  });
  const images = parseLines(p.images);
  const price = finalPrice(p.price, p.discountPercent);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="grid gap-4">
          {(images.length ? images : [undefined]).map((src, i) => (
            <ProductImage key={i} src={src} name={p.name} className="aspect-[3/4]" />
          ))}
        </div>
        <div className="md:sticky md:top-32 md:self-start">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">{p.category.name}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{p.name}</h1>
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
            sizes={parseList(p.sizes)} colors={parseList(p.colors)} stock={p.stock}
          />
          <ul className="mt-8 space-y-2 border-t border-ink/10 pt-6 text-sm text-ink/70">
            <li>Delivery across Pakistan in 3–5 working days</li>
            <li>Cash on Delivery · JazzCash · Easypaisa · Bank transfer</li>
            <li>7-day easy exchange</li>
          </ul>
        </div>
      </div>
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
