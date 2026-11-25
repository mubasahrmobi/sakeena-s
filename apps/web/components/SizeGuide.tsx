"use client";
import { useState } from "react";

// Typical women's sizing in inches. Brands differ slightly — always check the product description.
const ROWS = [
  ["XS", "32", "26", "35"],
  ["S", "34", "28", "37"],
  ["M", "36", "30", "39"],
  ["L", "38", "32", "41"],
  ["XL", "40", "34", "43"],
  ["XXL", "42", "36", "45"],
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs uppercase tracking-widest text-emerald underline underline-offset-4">Size guide</button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl">Size guide</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-2xl">×</button>
            </div>
            <p className="mt-1 text-sm text-ink/60">Body measurements in inches.</p>
            <table className="mt-4 w-full text-center text-sm">
              <thead className="border-b border-ink/20 text-xs uppercase tracking-widest text-ink/50">
                <tr><th className="py-2">Size</th><th>Bust</th><th>Waist</th><th>Hip</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {ROWS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`py-2 ${i === 0 ? "font-medium" : ""}`}>{c}</td>)}</tr>)}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-ink/60">Between sizes? Choose the larger one. Fit can differ by brand — if unsure, message us on WhatsApp.</p>
          </div>
        </div>
      )}
    </>
  );
}
