"use client";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, Bookmark, Compass, Heart, Home, LogOut, MessageCircle, Search, Send, Shield, Sparkles, UserRound, Users } from "lucide-react";
import { episodes } from "@/lib/episodes";

const topics = ["All", "Consciousness", "Spirituality", "Science", "Psychology", "Psychedelics", "Human Potential", "Health", "Philosophy", "Relationships", "Creativity", "Technology"];
type User = { id: string; name: string; handle: string; membership: string; role?: string; bio?: string; interests?: string };
type Post = { id: string; body: string; topic?: string; episode?: number; createdAt: string; author: User; likes: { userId: string }[]; bookmarks: { userId: string }[]; comments: { id: string; body: string; author: { name: string; handle: string } }[] };

export function CommunityClient({ initialPosts, members, user, notifications }: { initialPosts: Post[]; members: User[]; user: User | null; notifications: { id: string; text: string }[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => posts.filter(p => (topic === "All" || p.topic === topic) && `${p.body} ${p.author.name} ${p.topic ?? ""}`.toLowerCase().includes(query.toLowerCase())), [posts, topic, query]);
  async function refresh() { const r = await fetch("/api/community/posts"); setPosts((await r.json()).posts); }
  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
    const r = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (r.ok) { form.reset(); await refresh(); } else alert((await r.json()).error);
  }
  async function act(action: string, payload: Record<string, string>) {
    const r = await fetch("/api/community/interact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
    if (r.ok) await refresh(); else alert((await r.json()).error);
  }
  return <main className="community-shell">
    <header className="community-header"><Link href="/" className="conversion-logo"><span>HXP</span><b>The Human Experience<small>Community</small></b></Link><div className="community-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, episodes, and ideas" aria-label="Search community" /></div><div>{user ? <><button title="Notifications" className="icon-button"><Bell />{notifications.length > 0 && <i />}</button><Link href="/community/settings" className="member-chip" aria-label="Open membership profile"><span>{user.name.slice(0, 1)}</span><b>{user.name}</b><small>{user.membership === "paid" ? "Supporting member" : "Free profile"}</small></Link><Link href="/community/login?mode=signup" className="community-signup-link">Create profile</Link></> : <><Link href="/community/login" className="community-login-link">Log in</Link><Link href="/community/login?mode=signup" className="radiant-button">Create profile</Link></>}</div></header>
    <div className="community-grid">
      <aside className="community-nav"><nav><Link href="/community" className="active"><Home /> Home</Link><a href="#rooms"><Compass /> Rooms</a><a href="#members"><Users /> People</a><Link href="/community/messages"><MessageCircle /> Messages</Link><Link href="/community/settings"><UserRound /> Profile</Link>{user?.role === "admin" && <Link href="/community/admin"><Shield /> Moderation</Link>}</nav><div className="community-principle"><Sparkles /><b>Stay with the question.</b><p>Meet ideas with curiosity. Disagree with care. Protect the person behind every perspective.</p></div>{user && <button onClick={async () => { await fetch("/api/community/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); location.href = "/"; }}><LogOut /> Sign out</button>}</aside>
      <section className="community-main">
        <div className="community-welcome"><p className="conversion-kicker">The listening room</p><h1>Where the conversation continues.</h1><p>Reflect on an episode, follow a thread, or connect with someone exploring the same questions.</p></div>
        {user ? <form className="composer" onSubmit={publish}><div className="avatar">{user.name.slice(0,1)}</div><div><textarea name="body" required maxLength={2000} placeholder="What stayed with you after listening?" /><div><select name="topic" aria-label="Choose a topic">{topics.slice(1).map(t => <option key={t}>{t}</option>)}</select><button className="radiant-button">Share reflection <Send /></button></div></div></form> : <div className="join-banner"><div><b>Bring your perspective to the circle.</b><p>Create a free profile to respond, save ideas, and meet fellow listeners.</p></div><Link href="/community/login">Create a profile <ArrowRight /></Link></div>}
        <div className="topic-scroll" id="rooms">{topics.map(t => <button key={t} className={topic === t ? "active" : ""} onClick={() => setTopic(t)}>{t}</button>)}</div>
        <div className="community-feed">{filtered.length ? filtered.map(post => <article className="community-post" key={post.id}><header><div className="avatar">{post.author.name.slice(0,1)}</div><div><b>{post.author.name}{post.author.membership === "paid" && <Sparkles />}</b><span>@{post.author.handle} · {new Date(post.createdAt).toLocaleDateString()}</span></div>{post.topic && <em>{post.topic}</em>}</header><p>{post.body}</p>{post.episode && <Link className="episode-context" href={`/community/episodes/${post.episode}`}><span>EP {post.episode}</span>{episodes.find(e => e.number === post.episode)?.title}<ArrowRight /></Link>}<footer><button onClick={() => act("like", { postId: post.id })}><Heart className={user && post.likes.some(l => l.userId === user.id) ? "is-filled" : ""} /> {post.likes.length}</button><button onClick={() => { const body = prompt("Add a thoughtful reply"); if (body) act("comment", { postId: post.id, body }); }}><MessageCircle /> {post.comments.length}</button><button onClick={() => act("bookmark", { postId: post.id })}><Bookmark /> Save</button><button onClick={() => navigator.share?.({ title: "HXP Community", url: location.href })}>Share</button></footer>{post.comments.length > 0 && <div className="post-replies">{post.comments.map(c => <p key={c.id}><b>{c.author.name}</b>{c.body}</p>)}</div>}</article>) : <div className="empty-state"><Sparkles /><h2>Quiet can be an invitation.</h2><p>No reflections match this view yet. Begin the conversation when you’re ready.</p></div>}</div>
      </section>
      <aside className="community-rail"><section id="members"><p className="rail-label">Kindred explorers</p>{members.filter(m => m.id !== user?.id).slice(0,4).map(m => <article key={m.id}><div className="avatar">{m.name.slice(0,1)}</div><div><b>{m.name}</b><span>@{m.handle}</span></div><button aria-label={`Connect with ${m.name}`} onClick={() => act("follow", { targetId: m.id })}>+</button></article>)}</section><section><p className="rail-label">Continue listening</p>{episodes.slice(0,3).map(e => <Link href={`/community/episodes/${e.number}`} key={e.number}><span>EP {e.number}</span><b>{e.title}</b></Link>)}</section><section className="member-upgrade"><Sparkles /><b>Go deeper with HXP</b><p>Paid members help sustain the archive and receive a luminous supporter badge.</p><Link href="/membership">Explore membership <ArrowRight /></Link></section></aside>
    </div>
  </main>;
}
