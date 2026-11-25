import { prisma, finalPrice, parseLines } from "@sakeena/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json([]);
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [{ brandId: null }, { brand: { active: true } }],
      AND: [{ OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ] }],
    },
    include: { brand: true },
    take: 6,
  });
  return Response.json(
    products.map((p) => ({
      slug: p.slug, name: p.name, brand: p.brand?.name ?? null,
      price: finalPrice(p.price, p.discountPercent), image: parseLines(p.images)[0] ?? null,
    }))
  );
}
