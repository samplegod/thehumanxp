import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getMemberItem } from "@/lib/member-content";
import { getStripeMembership } from "@/lib/stripe-membership";

import "../members.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = getMemberItem((await params).slug);
  return { title: item ? `${item.title} | HXP Members` : "Private Release | HXP Members", robots: { index: false, follow: false } };
}

export default async function MemberReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/community/login?next=/members/${encodeURIComponent((await params).slug)}`);
  const membership = await getStripeMembership(user.email).catch(() => null);
  if (!membership?.active) redirect("/members");

  const item = getMemberItem((await params).slug);
  if (!item) notFound();

  return <main className="member-entry">
    <header><Link href="/members"><ArrowLeft /> Private archive</Link><span><LockKeyhole /> Members only</span></header>
    <article>
      <p className="members-kicker">{item.eyebrow}</p>
      <h1>{item.title}</h1>
      <p className="member-entry-deck">{item.description}</p>
      <div className="member-entry-meta"><span>{item.format}</span><span>{item.duration ?? "Member edition"}</span><span>{item.date}</span></div>
      <div className="member-entry-body">{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <aside><span>This is sample launch content.</span><p>Replace the body, links, and release metadata in <code>content/members/library.json</code>—the library updates without component changes.</p></aside>
      <Link className="member-entry-next" href="/members">Return to the library <ArrowRight /></Link>
    </article>
  </main>;
}
