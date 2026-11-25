"use server";
import { prisma } from "@sakeena/db";

export type ReviewState = { ok?: boolean; error?: string } | undefined;

export async function submitReview(_: ReviewState, form: FormData): Promise<ReviewState> {
  const slug = String(form.get("slug") ?? "");
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const comment = String(form.get("comment") ?? "").trim().slice(0, 1000);
  const rating = Math.round(Number(form.get("rating")));
  if (String(form.get("website") ?? "")) return { ok: true }; // hidden field: bots fill it in, people don't
  if (name.length < 2) return { error: "Please enter your name." };
  if (!(rating >= 1 && rating <= 5)) return { error: "Please choose a star rating." };
  if (comment.length < 5) return { error: "Please write a few words about the product." };
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { error: "Product not found." };
  // Reviews wait for admin approval before they appear on the site.
  await prisma.review.create({ data: { productId: product.id, name, rating, comment } });
  return { ok: true };
}
