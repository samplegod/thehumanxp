import Link from "next/link";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

async function sendMessage(formData: FormData) {
  "use server";
  const user = await requireUser();
  const recipientId = String(formData.get("recipientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!recipientId || !body || body.length > 1000 || recipientId === user.id) return;
  const blocked = await db.block.findFirst({ where: { OR: [{ blockerId: user.id, blockedId: recipientId }, { blockerId: recipientId, blockedId: user.id }] } });
  if (!blocked) await db.message.create({ data: { senderId: user.id, recipientId, body } });
  revalidatePath("/community/messages");
}

export default async function MessagesPage() {
  const user = await requireUser();
  const [members, messages] = await Promise.all([
    db.user.findMany({ where: { id: { not: user.id } }, select: { id: true, name: true, handle: true }, take: 30 }),
    db.message.findMany({ where: { OR: [{ senderId: user.id }, { recipientId: user.id }] }, include: { sender: true, recipient: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return <main className="community-subpage narrow"><header><Link href="/community"><ArrowLeft /> Community</Link><span>Private messages</span></header><section className="subpage-heading"><MessageCircle /><p className="conversion-kicker">One-to-one connection</p><h1>Messages</h1><p>Private conversations between HXP listeners. Blocking either participant immediately disables messaging.</p></section><form action={sendMessage} className="message-compose"><select name="recipientId" required aria-label="Message recipient"><option value="">Choose a listener</option>{members.map(m => <option value={m.id} key={m.id}>{m.name} (@{m.handle})</option>)}</select><textarea name="body" required maxLength={1000} placeholder="Write with care…" /><button className="radiant-button">Send privately <Send /></button></form><section className="message-list">{messages.length ? messages.map(m => <article key={m.id}><b>{m.senderId === user.id ? `To ${m.recipient.name}` : `From ${m.sender.name}`}</b><time>{m.createdAt.toLocaleDateString()}</time><p>{m.body}</p></article>) : <div className="empty-state"><MessageCircle /><h2>No messages yet.</h2><p>Connection can begin quietly.</p></div>}</section></main>;
}
