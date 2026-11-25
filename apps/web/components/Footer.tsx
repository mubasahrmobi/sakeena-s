import Link from "next/link";
import { Logo } from "./Logo";
import { SOCIALS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-emerald-dark text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Top Pakistani brands and our own label, together in one store. Delivered across Pakistan.
          </p>
          {SOCIALS.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="border border-cream/30 px-4 py-2 text-xs uppercase tracking-widest hover:border-gold hover:text-gold-light">{s.name}</a>
              ))}
            </div>
          )}
        </div>
        <div className="text-sm">
          <h4 className="mb-4 font-display text-lg text-gold-light">Shop</h4>
          <ul className="space-y-2">
            <li><Link href="/shop">All Collections</Link></li>
            <li><Link href="/brands">Brands</Link></li>
            <li><Link href="/shop?sale=1">Sale</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
            <li><Link href="/cart">Your Bag</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-4 font-display text-lg text-gold-light">Help</h4>
          <ul className="space-y-2">
            <li><Link href="/track">Track your order</Link></li>
            <li><Link href="/policies/delivery">Delivery</Link></li>
            <li><Link href="/policies/returns">Exchange &amp; Returns</Link></li>
            <li><Link href="/policies/privacy">Privacy Policy</Link></li>
            <li><Link href="/policies/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs tracking-widest text-cream/50">
        © {new Date().getFullYear()} SAKEENA’S · MADE IN PAKISTAN · COD · JAZZCASH · EASYPAISA · BANK TRANSFER
      </div>
    </footer>
  );
}
