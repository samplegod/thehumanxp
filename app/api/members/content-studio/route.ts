import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

const categories = ["after-hours", "bonus-episodes", "research-notes", "transcripts", "downloads", "early-access", "behind-the-scenes"] as const;
const itemSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), category: z.enum(categories), title: z.string().min(1), eyebrow: z.string().min(1),
  description: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), duration: z.string().optional(), format: z.string().min(1),
  featured: z.boolean().optional(), available: z.boolean().optional(), href: z.string().url().or(z.literal("")).optional(), topics: z.array(z.string()), body: z.array(z.string().min(1)),
});
const librarySchema = z.object({ updatedAt: z.string(), edition: z.string().min(1), items: z.array(itemSchema) });
const filePath = path.join(process.cwd(), "content", "members", "library.json");

function developmentOnly() {
  return process.env.NODE_ENV !== "production";
}

export async function GET() {
  if (!developmentOnly()) return NextResponse.json({ error: "Content Studio is development-only." }, { status: 404 });
  return NextResponse.json(JSON.parse(await readFile(filePath, "utf8")));
}

export async function PUT(request: Request) {
  if (!developmentOnly()) return NextResponse.json({ error: "Content Studio is development-only." }, { status: 404 });
  const parsed = librarySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid content." }, { status: 400 });
  const slugs = parsed.data.items.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) return NextResponse.json({ error: "Every release needs a unique slug." }, { status: 400 });
  const content = { ...parsed.data, updatedAt: new Date().toISOString().slice(0, 10) };
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  return NextResponse.json({ ok: true, library: content });
}
