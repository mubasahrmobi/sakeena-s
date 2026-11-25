import Link from "next/link";
import { makeHref, type SP } from "@/lib/table";

export type Column<T> = {
  key: string;
  label: string;
  sortKey?: string; // set to make the column sortable
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  path, sp, columns, rows, total, page, size, sort, dir, placeholder = "Search…", filters, empty = "Nothing found.",
}: {
  path: string; sp: SP; columns: Column<T>[]; rows: T[]; total: number;
  page: number; size: number; sort: string; dir: "asc" | "desc";
  placeholder?: string; filters?: React.ReactNode; empty?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(total, page * size);

  // numbered page links: first, last, and a window around the current page
  const nums = Array.from(new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))).sort((a, b) => a - b);

  const hidden = Object.entries(sp).filter(([k, v]) => v && k !== "q" && k !== "page");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form action={path} className="flex gap-2">
          {hidden.map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <input name="q" defaultValue={sp.q} placeholder={placeholder} className="input !w-64 !py-2" />
          <button className="btn-primary !px-4 !py-2">Search</button>
          {sp.q && <Link href={makeHref(path, sp, { q: undefined, page: undefined })} className="btn-outline !px-4 !py-2">Clear</Link>}
        </form>
        {filters}
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
            <tr>
              {columns.map((c) => {
                const active = c.sortKey === sort;
                return (
                  <th key={c.key} className={`whitespace-nowrap p-4 font-normal ${c.className ?? ""}`}>
                    {c.sortKey ? (
                      <Link
                        href={makeHref(path, sp, { sort: c.sortKey, dir: active && dir === "asc" ? "desc" : "asc", page: undefined })}
                        className={active ? "text-emerald" : "hover:text-emerald"}
                      >
                        {c.label} {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
                      </Link>
                    ) : c.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {rows.map((r) => (
              <tr key={r.id} className="align-middle hover:bg-cream/60">
                {columns.map((c) => <td key={c.key} className={`p-4 ${c.className ?? ""}`}>{c.render(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-ink/50">{empty}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-ink/60">Showing {from}–{to} of {total}</p>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-ink/50">Rows:</span>
          {[10, 25, 50, 100].map((n) => (
            <Link key={n} href={makeHref(path, sp, { size: String(n), page: undefined })}
              className={`px-2 py-1 ${n === size ? "bg-emerald text-cream" : "hover:bg-white"}`}>{n}</Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {page > 1 && <Link href={makeHref(path, sp, { page: String(page - 1) })} className="bg-white px-3 py-1">‹ Prev</Link>}
          {nums.map((n, i) => (
            <span key={n} className="flex items-center gap-1">
              {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-ink/40">…</span>}
              <Link href={makeHref(path, sp, { page: String(n) })} className={`px-3 py-1 ${n === page ? "bg-emerald text-cream" : "bg-white"}`}>{n}</Link>
            </span>
          ))}
          {page < pages && <Link href={makeHref(path, sp, { page: String(page + 1) })} className="bg-white px-3 py-1">Next ›</Link>}
        </div>
      </div>
    </div>
  );
}

export function FilterPills({ path, sp, param, options }: { path: string; sp: SP; param: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = (sp[param] ?? "") === o.value;
        return (
          <Link key={o.value} href={makeHref(path, sp, { [param]: o.value || undefined, page: undefined })}
            className={`border px-3 py-1.5 text-xs uppercase tracking-widest ${on ? "border-emerald bg-emerald text-cream" : "border-ink/20 bg-white hover:border-emerald"}`}>
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
