export type SP = Record<string, string | undefined>;

export function tableParams(
  sp: SP,
  opts: { sorts: string[]; defaultSort: string; defaultDir?: "asc" | "desc" }
) {
  const q = (sp.q ?? "").trim();
  const sort = opts.sorts.includes(sp.sort ?? "") ? sp.sort! : opts.defaultSort;
  const dir: "asc" | "desc" = sp.dir === "asc" || sp.dir === "desc" ? sp.dir : opts.defaultDir ?? "desc";
  const size = [10, 25, 50, 100].includes(Number(sp.size)) ? Number(sp.size) : 10;
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  return { q, sort, dir, size, page, skip: (page - 1) * size, take: size };
}

/** Build a link that keeps the current search/filter/sort and changes only what you pass. */
export function makeHref(path: string, sp: SP, overrides: SP) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...overrides })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${path}?${s}` : path;
}
