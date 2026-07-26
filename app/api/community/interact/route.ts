import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ action: z.enum(["like", "bookmark", "comment", "follow", "block", "report", "message"]), postId: z.string().optional(), targetId: z.string().optional(), body: z.string().trim().max(1000).optional(), reason: z.string().trim().max(300).optional() });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { action, postId, targetId, body, reason } = parsed.data;
  if ((action === "like" || action === "bookmark") && postId) {
    const key = { userId_postId: { userId: user.id, postId } };
    if (action === "like") {
      const existing = await db.like.findUnique({ where: key });
      if (existing) await db.like.delete({ where: key }); else await db.like.create({ data: { userId: user.id, postId } });
    } else {
      const existing = await db.bookmark.findUnique({ where: key });
      if (existing) await db.bookmark.delete({ where: key }); else await db.bookmark.create({ data: { userId: user.id, postId } });
    }
  } else if (action === "comment" && postId && body) {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    await db.comment.create({ data: { body, postId, authorId: user.id } });
    if (post.authorId !== user.id) await db.notification.create({ data: { type: "reply", text: `${user.name} replied to your reflection.`, recipientId: post.authorId, actorId: user.id, href: "/community" } });
  } else if (action === "follow" && targetId && targetId !== user.id) {
    await db.follow.upsert({ where: { followerId_followingId: { followerId: user.id, followingId: targetId } }, create: { followerId: user.id, followingId: targetId }, update: {} });
    await db.notification.create({ data: { type: "follow", text: `${user.name} connected with you.`, recipientId: targetId, actorId: user.id, href: `/community/members/${user.handle}` } });
  } else if (action === "block" && targetId && targetId !== user.id) {
    await db.block.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetId } }, create: { blockerId: user.id, blockedId: targetId }, update: {} });
  } else if (action === "report" && postId && reason) {
    await db.report.create({ data: { postId, reason, reporterId: user.id } });
  } else if (action === "message" && targetId && body && targetId !== user.id) {
    const blocked = await db.block.findFirst({ where: { OR: [{ blockerId: user.id, blockedId: targetId }, { blockerId: targetId, blockedId: user.id }] } });
    if (blocked) return NextResponse.json({ error: "Messaging is unavailable." }, { status: 403 });
    await db.message.create({ data: { body, senderId: user.id, recipientId: targetId } });
    await db.notification.create({ data: { type: "message", text: `${user.name} sent you a message.`, recipientId: targetId, actorId: user.id, href: "/community/messages" } });
  } else return NextResponse.json({ error: "Missing required information." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
