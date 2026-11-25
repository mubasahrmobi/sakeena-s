import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const cats = ["Lawn", "Kurta & Co-ords", "Formal Wear", "Winter Shawls"];
const products = [
  { name: "Noor Embroidered Lawn 3-Piece", cat: "Lawn", price: 7900, d: 20, f: true, colors: "Mint,Ivory" },
  { name: "Gul Printed Lawn 2-Piece", cat: "Lawn", price: 4500, d: 0, f: true, colors: "Rose,Sky" },
  { name: "Zarina Chiffon Formal", cat: "Formal Wear", price: 18500, d: 15, f: true, colors: "Emerald,Maroon" },
  { name: "Mehr Silk Kurta", cat: "Kurta & Co-ords", price: 6200, d: 0, f: false, colors: "Sand,Black" },
  { name: "Sahar Co-ord Set", cat: "Kurta & Co-ords", price: 8400, d: 10, f: true, colors: "Sage,Cream" },
  { name: "Inaya Pashmina Shawl", cat: "Winter Shawls", price: 9800, d: 25, f: false, colors: "Camel,Charcoal" },
  { name: "Layla Organza Dupatta Set", cat: "Formal Wear", price: 14200, d: 0, f: false, colors: "Blush,Gold" },
  { name: "Amal Cotton Kurta", cat: "Kurta & Co-ords", price: 3600, d: 30, f: false, colors: "White,Teal" },
];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: slug(c) }, update: {}, create: { name: c, slug: slug(c) } });
  }
  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: slug(p.cat) } });
    await prisma.product.upsert({
      where: { slug: slug(p.name) },
      update: {},
      create: {
        name: p.name, slug: slug(p.name), price: p.price, discountPercent: p.d, featured: p.f,
        colors: p.colors, stock: 25, categoryId: category!.id,
        description: "Crafted with care from premium fabric, tailored for comfort and timeless elegance. Machine-washable on gentle cycle.",
      },
    });
  }
  await prisma.coupon.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", percent: 10 } });
  console.log("Seeded.");
}
main().finally(() => prisma.$disconnect());
