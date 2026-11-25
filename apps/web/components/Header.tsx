"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/shop?sale=1", label: "Sale" },
  { href: "/about", label: "Our Story" },
  { href: "/track", label: "Track Order" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="bg-emerald py-2 text-center text-[11px] uppercase tracking-[0.25em] text-cream">
        Free delivery across Pakistan over Rs. 5,000 · Cash on Delivery available
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className="hidden gap-8 text-sm uppercase tracking-widest md:flex">
          {links.map((l) => <Link key={l.href} href={l.href} className="hover:text-gold">{l.label}</Link>)}
        </nav>
        <Link href="/" aria-label="Sakeena's home"><Logo /></Link>
        <Link href="/cart" className="relative text-sm uppercase tracking-widest hover:text-gold">
          Bag
          {count > 0 && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs text-white">{count}</span>}
        </Link>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-ink/10 px-5 py-4 text-sm uppercase tracking-widest md:hidden">
          {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
