import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = { title: "Sakeena’s Admin" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
