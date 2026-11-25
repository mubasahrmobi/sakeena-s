import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@sakeena/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your wishlist" };

export default async function Wishlist() {
  const raw = decodeURIComponent((await cookies()).get("sk_wish")?.value ?? "");
  const slugs = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 60);
  const products = slugs.length
    ? await prisma.product.findMany({ where: { slug: { in: slugs }, active: true }, include: { brand: true } })
    : [];
  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="text-center text-5xl">Your wishlist</h1>
      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-ink/60">Tap the heart on any piece to save it here.</p>
          <Link href="/shop" className="btn-primary mt-6">Browse the shop</Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
