import Link from "next/link";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { episodes } from "@/lib/episodes";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

async function addReflection(formData: FormData) {
  "use server";
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  const episode = Number(formData.get("episode"));
  if (body.length < 1 || body.length > 2000) return;
  await db.post.create({ data: { body, episode, topic: String(formData.get("topic") ?? "Episode discussion"), authorId: user.id } });
  revalidatePath(`/community/episodes/${episode}`);
}

export default async function EpisodeRoom({ params }: { params: Promise<{ number: string }> }) {
  const number = Number((await params).number);
  const episode = episodes.find(item => item.number === number);
  if (!episode) notFound();
  const user = await requireUser();
  const posts = await db.post.findMany({ where: { episode: number }, include: { author: true, comments: true, likes: true }, orderBy: { createdAt: "desc" } });
  return <main className="community-subpage"><header><Link href="/community"><ArrowLeft /> Community</Link><span>HXP · Episode room</span></header><section className="episode-room-hero"><div>{episode.image && <img src={episode.image} alt="" />}</div><article><p className="conversion-kicker"><Sparkles /> Episode {number}</p><h1>{episode.title}</h1><p>{episode.description}</p><div className="topic-pills">{episode.topics.map(t => <span key={t}>{t}</span>)}</div><a href={episode.audio ?? episode.url ?? "#"} target="_blank" rel="noreferrer"><Play /> Listen to episode</a></article></section><section className="room-conversation"><h2>Continue the inquiry</h2><form action={addReflection}><input type="hidden" name="episode" value={number} /><input type="hidden" name="topic" value={episode.topics[0] ?? "Episode discussion"} /><label><span className="sr-only">Your reflection</span><textarea name="body" required maxLength={2000} placeholder={`What stayed with you after episode ${number}, ${user.name}?`} /></label><button className="radiant-button">Share with the room</button></form>{posts.length ? posts.map(post => <article key={post.id}><b>{post.author.name}</b><span>@{post.author.handle}</span><p>{post.body}</p><small>{post.likes.length} appreciations · {post.comments.length} replies</small></article>) : <div className="empty-state"><Sparkles /><h2>Open the circle.</h2><p>Be the first listener to reflect on this episode.</p></div>}</section></main>;
}
