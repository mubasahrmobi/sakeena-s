"use client";
import { useWishlist } from "@/lib/wishlist";

export function WishlistButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const on = has(slug);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110 ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${on ? "fill-red-600 stroke-red-600" : "fill-none stroke-ink"}`} strokeWidth="1.8">
        <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.5 3 5 6.5 5c2 0 3.6 1.1 5.5 3 1.9-1.9 3.5-3 5.5-3C21 5 22.800 8.500 21.500 11.800 19.500 16.400 12 21 12 21z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
