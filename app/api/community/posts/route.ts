import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const postSchema = z.object({ body: z.string().trim().min(1).max(2000), topic: z.string().trim().max(60).optional(), episode: z.number().int().positive().optional(), linkUrl: z.string().url().optional().or(z.literal("")) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const episode = Number(url.searchParams.get("episode")) || undefined;
  const posts = await db.post.findMany({
    where: { ...(topic ? { topic } : {}), ...(episode ? { episode } : {}) },
    include: { author: { select: { name: true, handle: true, membership: true } }, likes: true, bookmarks: true, comments: { include: { author: { select: { name: true, handle: true } } }, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" }, take: 30,
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to join the conversation." }, { status: 401 });
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const recent = await db.post.count({ where: { authorId: user.id, createdAt: { gte: new Date(Date.now() - 60_000) } } });
  if (recent >= 4) return NextResponse.json({ error: "Please pause before posting again." }, { status: 429 });
  const post = await db.post.create({ data: { ...parsed.data, linkUrl: parsed.data.linkUrl || null, authorId: user.id } });
  return NextResponse.json({ post }, { status: 201 });
}
