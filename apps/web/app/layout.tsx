import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { Analytics } from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "Sakeena’s", type: "website", locale: "en_PK" },
  title: { default: "Sakeena’s — Tranquil Elegance", template: "%s · Sakeena’s" },
  description: "Premium Pakistani women’s clothing: lawn, kurtas, formal wear and shawls. Delivered across Pakistan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </WishlistProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
