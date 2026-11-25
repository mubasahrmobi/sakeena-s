import { saveBanner } from "@/lib/actions";
import { ImageManager } from "./ImageManager";

type B = { id?: string; title?: string; subtitle?: string; image?: string; href?: string; sort?: number; active?: boolean };

export function BannerForm({ b = {} }: { b?: B }) {
  return (
    <form action={saveBanner} className="grid max-w-2xl gap-5 bg-white p-6">
      {b.id && <input type="hidden" name="id" value={b.id} />}
      <div>
        <label className="label">Photo (portrait works best, e.g. 4:5)</label>
        <div className="max-w-[200px]"><ImageManager name="image" single initial={b.image ? [b.image] : []} /></div>
      </div>
      <div><label className="label">Title (large text on the photo)</label><input name="title" required defaultValue={b.title} placeholder="Embroidered Lawn" className="input" /></div>
      <div><label className="label">Small text above the title</label><input name="subtitle" defaultValue={b.subtitle} placeholder="Everyday elegance" className="input" /></div>
      <div><label className="label">Link when clicked</label><input name="href" defaultValue={b.href ?? "/shop"} placeholder="/shop?sale=1 or /brand/sapphire" className="input" /></div>
      <div><label className="label">Order (1 shows first)</label><input name="sort" type="number" min={0} defaultValue={b.sort ?? 1} className="input !w-28" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={b.active ?? true} className="accent-emerald" /> Show on homepage</label>
      <div><button className="btn-primary">Save banner</button></div>
    </form>
  );
}
