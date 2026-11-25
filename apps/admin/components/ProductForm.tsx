import { saveProduct } from "@/lib/actions";

type P = {
  id?: string; name?: string; description?: string; price?: number; discountPercent?: number;
  images?: string; sizes?: string; colors?: string; stock?: number; featured?: boolean; active?: boolean; categoryId?: string;
};

export function ProductForm({ p = {}, categories }: { p?: P; categories: { id: string; name: string }[] }) {
  return (
    <form action={saveProduct} className="grid max-w-3xl gap-5 bg-white p-6 md:grid-cols-2">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div className="md:col-span-2"><label className="label">Name</label><input name="name" required defaultValue={p.name} className="input" /></div>
      <div className="md:col-span-2"><label className="label">Description</label><textarea name="description" required rows={4} defaultValue={p.description} className="input" /></div>
      <div><label className="label">Price (PKR)</label><input name="price" type="number" min={0} required defaultValue={p.price} className="input" /></div>
      <div><label className="label">Discount (%)</label><input name="discountPercent" type="number" min={0} max={90} defaultValue={p.discountPercent ?? 0} className="input" /></div>
      <div><label className="label">Stock</label><input name="stock" type="number" min={0} defaultValue={p.stock ?? 0} className="input" /></div>
      <div>
        <label className="label">Category</label>
        <select name="categoryId" required defaultValue={p.categoryId} className="input">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label className="label">Sizes (comma separated)</label><input name="sizes" defaultValue={p.sizes ?? "S,M,L,XL"} className="input" /></div>
      <div><label className="label">Colours (comma separated)</label><input name="colors" defaultValue={p.colors} className="input" /></div>
      <div className="md:col-span-2">
        <label className="label">Image URLs (one per line)</label>
        <textarea name="images" rows={3} defaultValue={p.images} placeholder="https://…" className="input" />
        <p className="mt-1 text-xs text-ink/50">Upload photos to Cloudinary / Imgbb / your CDN and paste the links. Without images a styled illustration is shown.</p>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={p.featured} className="accent-emerald" /> Featured on homepage</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={p.active ?? true} className="accent-emerald" /> Visible in shop</label>
      <div className="md:col-span-2"><button className="btn-primary">Save product</button></div>
    </form>
  );
}
