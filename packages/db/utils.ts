export const SHIPPING_FLAT = 250;
export const FREE_SHIPPING_OVER = 5000;

export function finalPrice(price: number, discountPercent: number) {
  return Math.round((price * (100 - discountPercent)) / 100);
}
export function formatPKR(n: number) {
  return "Rs. " + n.toLocaleString("en-PK");
}
export function parseList(s?: string | null) {
  return (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}
export function parseLines(s?: string | null) {
  return (s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
}
export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_OVER || subtotal === 0 ? 0 : SHIPPING_FLAT;
}

export const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", hint: "Pay in cash when your parcel arrives", manual: false },
  { id: "JAZZCASH", label: "JazzCash", hint: "Send to our JazzCash account, then enter the transaction ID", manual: true },
  { id: "EASYPAISA", label: "Easypaisa", hint: "Send to our Easypaisa account, then enter the transaction ID", manual: true },
  { id: "BANK", label: "Bank Transfer", hint: "Transfer to our bank account, then enter the reference number", manual: true },
] as const;

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["PENDING", "AWAITING_VERIFICATION", "PAID", "FAILED"] as const;
