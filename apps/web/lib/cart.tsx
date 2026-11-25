"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string; slug: string; name: string; price: number;
  size: string; color: string; qty: number;
};
type Ctx = {
  items: CartItem[]; count: number; subtotal: number;
  add: (i: CartItem) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};
export const keyOf = (i: Pick<CartItem, "productId" | "size" | "color">) => `${i.productId}|${i.size}|${i.color}`;

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("sakeena-cart") || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem("sakeena-cart", JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add = (i: CartItem) =>
    setItems((cur) => {
      const k = keyOf(i);
      const found = cur.find((c) => keyOf(c) === k);
      return found ? cur.map((c) => (keyOf(c) === k ? { ...c, qty: c.qty + i.qty } : c)) : [...cur, i];
    });
  const setQty = (k: string, qty: number) =>
    setItems((cur) => cur.map((c) => (keyOf(c) === k ? { ...c, qty: Math.max(1, qty) } : c)));
  const remove = (k: string) => setItems((cur) => cur.filter((c) => keyOf(c) !== k));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
  return <CartCtx.Provider value={{ items, count, subtotal, add, setQty, remove, clear }}>{children}</CartCtx.Provider>;
}
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("CartProvider missing");
  return c;
};
