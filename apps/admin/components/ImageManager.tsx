"use client";
import { useState } from "react";

/** Resize big phone/camera photos in the browser so uploads stay fast and small. */
async function shrink(file: File, max = 1600): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.85));
  return blob ? new File([blob], "photo.webp", { type: "image/webp" }) : file;
}

export function ImageManager({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", await shrink(f));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        added.push(json.url);
      } catch (e) {
        setError(`${f.name}: ${(e as Error).message}`);
      }
    }
    setUrls((u) => [...u, ...added]);
    setBusy(false);
  }
  const move = (i: number, d: number) =>
    setUrls((u) => { const a = [...u]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  return (
    <div>
      <input type="hidden" name="images" value={urls.join("\n")} />
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {urls.map((u, i) => (
          <div key={u} className="relative border border-ink/10 bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="aspect-[3/4] w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 bg-gold px-2 py-0.5 text-[10px] uppercase tracking-widest text-white">Cover</span>}
            <div className="flex justify-between bg-white px-2 py-1 text-xs">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>←</button>
              <button type="button" onClick={() => setUrls(urls.filter((x) => x !== u))} className="text-red-700">Remove</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === urls.length - 1}>→</button>
            </div>
          </div>
        ))}
        <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center border border-dashed border-emerald/50 text-center text-xs uppercase tracking-widest text-emerald hover:bg-cream">
          {busy ? "Uploading…" : "+ Upload photos"}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={busy}
            onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <p className="mt-2 text-xs text-ink/50">The first photo is the cover. Large photos are resized automatically. JPG, PNG or WebP.</p>
    </div>
  );
}
