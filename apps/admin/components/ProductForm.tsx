import { saveProduct } from "@/lib/actions";
import { ImageManager } from "./ImageManager";
import { SizeStockEditor } from "./SizeStockEditor";

type P = {
  id?: string; name?: string; description?: string; price?: number; discountPercent?: number;
  images?: string; sizes?: string; colors?: string; stock?: number; featured?: boolean; active?: boolean; categoryId?: string; brandId?: string | null;
};

export function ProductForm({
  p = {}, categories, brands, sizeStocks = {},
}: { p?: P; categories: { id: string; name: string }[]; brands: { id: string; name: string }[]; sizeStocks?: Record<string, number> }) {
  return (
    <form action={saveProduct} className="grid max-w-3xl gap-5 bg-white p-6 md:grid-cols-2">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div className="md:col-span-2"><label className="label">Name</label><input name="name" required defaultValue={p.name} className="input" /></div>
      <div className="md:col-span-2"><label className="label">Description</label><textarea name="description" required rows={4} defaultValue={p.description} className="input" /></div>
      <div><label className="label">Price (PKR)</label><input name="price" type="number" min={0} required defaultValue={p.price} className="input" /></div>
      <div><label className="label">Discount (%)</label><input name="discountPercent" type="number" min={0} max={90} defaultValue={p.discountPercent ?? 0} className="input" /></div>
      <div>
        <label className="label">Category</label>
        <select name="categoryId" required defaultValue={p.categoryId} className="input">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Brand</label>
        <select name="brandId" defaultValue={p.brandId ?? ""} className="input">
          <option value="">— No brand —</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2"><label className="label">Colours (comma separated)</label><input name="colors" defaultValue={p.colors} className="input" /></div>
      <SizeStockEditor initialSizes={p.sizes ?? "S,M,L,XL"} stocks={sizeStocks} />
      <div className="md:col-span-2">
        <label className="label">Photos</label>
        <ImageManager initial={(p.images ?? "").split("\n").map((s) => s.trim()).filter(Boolean)} />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={p.featured} className="accent-emerald" /> Featured on homepage</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={p.active ?? true} className="accent-emerald" /> Visible in shop</label>
      <div className="md:col-span-2"><button className="btn-primary">Save product</button></div>
    </form>
  );
}
