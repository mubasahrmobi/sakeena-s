import { prisma } from "@sakeena/db";
import { isAuthed } from "@/lib/auth";

const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthed())) return Response.json({ error: "Not signed in" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return Response.json({ error: "Use a JPG, PNG or WebP image" }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "Image is larger than 4 MB" }, { status: 400 });
  const img = await prisma.image.create({ data: { data: Buffer.from(await file.arrayBuffer()), mime: file.type } });
  return Response.json({ url: `/img/${img.id}` });
}
