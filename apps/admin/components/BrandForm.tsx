import { saveBrand } from "@/lib/actions";
import { ImageManager } from "./ImageManager";

type B = { id?: string; name?: string; description?: string; logo?: string; active?: boolean };

export function BrandForm({ b = {} }: { b?: B }) {
  return (
    <form action={saveBrand} className="grid max-w-2xl gap-5 bg-white p-6">
      {b.id && <input type="hidden" name="id" value={b.id} />}
      <div><label className="label">Brand name</label><input name="name" required defaultValue={b.name} placeholder="e.g. Sapphire" className="input" /></div>
      <div><label className="label">About the brand</label><textarea name="description" rows={3} defaultValue={b.description} className="input" /></div>
      <div>
        <label className="label">Logo</label>
        <div className="max-w-[160px]"><ImageManager name="logo" single initial={b.logo ? [b.logo] : []} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={b.active ?? true} className="accent-emerald" /> Visible in shop</label>
      <div><button className="btn-primary">Save brand</button></div>
    </form>
  );
}
