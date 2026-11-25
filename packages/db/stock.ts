import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Take `qty` units out of stock for one size. Returns false if there isn't enough.
 * Products with per-size rows are tracked per size (and in the product total);
 * older products without size rows fall back to the single product total.
 */
export async function takeStock(tx: Tx, productId: string, size: string, qty: number): Promise<boolean> {
  const hasSizes = (await tx.productSize.count({ where: { productId } })) > 0;
  if (hasSizes) {
    const ok = await tx.productSize.updateMany({
      where: { productId, size, stock: { gte: qty } },
      data: { stock: { decrement: qty } },
    });
    if (ok.count === 0) return false;
    await tx.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } });
    return true;
  }
  const ok = await tx.product.updateMany({ where: { id: productId, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
  return ok.count > 0;
}

/** Put units back into stock (cancelled orders). */
export async function returnStock(tx: Tx, productId: string, size: string, qty: number) {
  await tx.productSize.updateMany({ where: { productId, size }, data: { stock: { increment: qty } } });
  await tx.product.update({ where: { id: productId }, data: { stock: { increment: qty } } });
}

/** Write a line to the stock history, recording the new total. */
export async function logMovement(
  tx: Tx,
  m: { productId: string; size?: string | null; change: number; reason: string; ref?: string | null }
) {
  const p = await tx.product.findUnique({ where: { id: m.productId }, select: { stock: true } });
  await tx.stockMovement.create({
    data: { productId: m.productId, size: m.size ?? null, change: m.change, after: p?.stock ?? 0, reason: m.reason, ref: m.ref ?? null },
  });
}
