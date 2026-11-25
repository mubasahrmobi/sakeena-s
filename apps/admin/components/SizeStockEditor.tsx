"use client";
import { useState } from "react";

/** Sizes field + one stock box per size. The size boxes update as you type the sizes. */
export function SizeStockEditor({ initialSizes, stocks }: { initialSizes: string; stocks: Record<string, number> }) {
  const [text, setText] = useState(initialSizes);
  const [values, setValues] = useState<Record<string, number>>(stocks);
  const list = Array.from(new Set(text.split(",").map((s) => s.trim()).filter(Boolean)));
  const sizes = list.length ? list : ["One Size"];
  const total = sizes.reduce((n, s) => n + (values[s] ?? 0), 0);

  return (
    <div className="md:col-span-2">
      <label className="label">Sizes (comma separated)</label>
      <input name="sizes" value={text} onChange={(e) => setText(e.target.value)} placeholder="S,M,L,XL" className="input" />
      <p className="label mt-4">Stock for each size</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {sizes.map((s) => (
          <div key={s}>
            <span className="mb-1 block text-xs text-ink/60">{s}</span>
            <input
              type="number" min={0} name={`ss_${s}`} value={values[s] ?? 0}
              onChange={(e) => setValues({ ...values, [s]: Math.max(0, Number(e.target.value) || 0) })}
              className="input !py-2"
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-ink/60">Total in stock: <b>{total}</b></p>
    </div>
  );
}
