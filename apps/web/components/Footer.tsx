import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-emerald-dark text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Modern Pakistani clothing, stitched with calm and designed to be loved for years.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="mb-4 font-display text-lg text-gold-light">Shop</h4>
          <ul className="space-y-2">
            <li><Link href="/shop">All Collections</Link></li>
            <li><Link href="/shop?sale=1">Sale</Link></li>
            <li><Link href="/cart">Your Bag</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-4 font-display text-lg text-gold-light">Help</h4>
          <ul className="space-y-2">
            <li>Delivery in 3–5 working days</li>
            <li>7-day exchange policy</li>
            <li>Pay by COD, JazzCash, Easypaisa or bank</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs tracking-widest text-cream/50">
        © {new Date().getFullYear()} SAKEENA’S · MADE IN PAKISTAN
      </div>
    </footer>
  );
}
