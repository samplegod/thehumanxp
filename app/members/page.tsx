import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Download,
  FileText,
  Headphones,
  LockKeyhole,
  Radio,
  Sparkles,
} from "lucide-react";

import { getMemberEmail } from "@/lib/member-auth";
import { getMemberLibrary, getMemberSections, type MemberCategory, type MemberItem } from "@/lib/member-content";
import { getStripeMembership } from "@/lib/stripe-membership";

import "./members.css";

export const metadata: Metadata = {
  title: "The Private Archive | HXP Members",
  description: "Private conversations, research notes, transcripts, downloads, and early access for members of The Human Experience Podcast.",
};

export const dynamic = "force-dynamic";

const categoryMeta: Record<MemberCategory, { label: string; note: string }> = {
  "after-hours": { label: "After Hours", note: "The conversation after the conversation." },
  "bonus-episodes": { label: "Bonus Episodes", note: "Original audio made only for this room." },
  "research-notes": { label: "Research Notes", note: "Sources, marginalia, and unresolved questions." },
  transcripts: { label: "Transcripts", note: "Searchable, annotated, and made to keep." },
  downloads: { label: "Downloads", note: "Field guides and artifacts for offline reflection." },
  "early-access": { label: "Early Access", note: "The next conversation, before the wider world." },
  "behind-the-scenes": { label: "Behind the Scenes", note: "How patient conversations are assembled." },
};

const icons: Record<MemberCategory, typeof Headphones> = {
  "after-hours": Radio,
  "bonus-episodes": Headphones,
  "research-notes": BookOpen,
  transcripts: FileText,
  downloads: Download,
  "early-access": Clock3,
  "behind-the-scenes": Sparkles,
};

export default async function MembersPage() {
  const email = await getMemberEmail();
  if (!email) redirect("/members/access");

  let membership;
  try {
    membership = await getStripeMembership(email);
  } catch (error) {
    console.error("Members access verification failed", error);
    return <AccessUnavailable />;
  }

  if (!membership.active) return <MembershipRequired />;

  const library = getMemberLibrary();
  const featured = library.items.find((item) => item.featured) ?? library.items[0];
  const sections = getMemberSections(library.items);

  return (
    <main className="members-page">
      <div className="members-atmosphere" aria-hidden="true" />
      <header className="members-header">
        <Link href="/" className="members-back"><ArrowLeft /> HXP</Link>
        <Link href="/members" className="members-mark"><span>HXP</span><b>The Private Archive<small>Members library</small></b></Link>
        <div className="members-identity"><span className="members-live" /> Active member <b>{email}</b></div>
      </header>

      <section className="members-hero">
        <div>
          <p className="members-kicker"><LockKeyhole /> The members room · {library.edition}</p>
          <h1>Go beyond<br /><em>the episode.</em></h1>
          <p>A private library for the questions that keep unfolding—unreleased conversations, working notes, annotated transcripts, and artifacts from inside HXP.</p>
        </div>
        <aside>
          <span>Library index</span>
          <strong>{String(library.items.length).padStart(2, "0")}</strong>
          <p>private releases across seven evolving collections</p>
          <small>Updated {formatDate(library.updatedAt)}</small>
        </aside>
      </section>

      {featured && <FeaturedItem item={featured} />}

      <nav className="members-index" aria-label="Members library sections">
        {sections.map(({ category, items }) => {
          const Icon = icons[category];
          return <a key={category} href={`#${category}`}><Icon /><span>{categoryMeta[category].label}<small>{items.length} release</small></span></a>;
        })}
      </nav>

      <section className="members-library">
        {sections.map(({ category, items }, index) => {
          const Icon = icons[category];
          return (
            <section id={category} className="members-shelf" key={category}>
              <header>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon />
                <div><h2>{categoryMeta[category].label}</h2><p>{categoryMeta[category].note}</p></div>
              </header>
              <div className="members-shelf-grid">
                {items.map((item) => <MemberCard item={item} key={item.slug} />)}
              </div>
            </section>
          );
        })}
      </section>

      <footer className="members-footer">
        <div><span>HXP</span><p>The Human Experience<small>Private archive · for members</small></p></div>
        <p>New transmissions arrive quietly. Return often.</p>
        <Link href="/community">Enter the listening room <ArrowRight /></Link>
      </footer>
    </main>
  );
}

function FeaturedItem({ item }: { item: MemberItem }) {
  return <section className="members-featured">
    <div className="members-orbit" aria-hidden="true"><i /><i /><i /></div>
    <div><p className="members-kicker"><Radio /> Latest private transmission</p><h2>{item.title}</h2><p>{item.description}</p><div className="member-tags">{item.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
    <aside><span>{item.format}</span><strong>{item.duration}</strong><small>{formatDate(item.date)}</small><Link href={item.href ?? `/members/${item.slug}`}>Open release <ArrowRight /></Link></aside>
  </section>;
}

function MemberCard({ item }: { item: MemberItem }) {
  return <article className="member-release">
    <div className="member-release-art"><span>{item.eyebrow}</span><i /><b>{item.available === false ? "Arriving soon" : item.format}</b></div>
    <div className="member-release-copy"><p>{formatDate(item.date)} {item.duration && <>· {item.duration}</>}</p><h3>{item.title}</h3><p>{item.description}</p><div className="member-tags">{item.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>{item.available === false ? <span className="member-release-status">Scheduled release</span> : <Link href={item.href ?? `/members/${item.slug}`}>Open release <ArrowRight /></Link>}</div>
  </article>;
}

function MembershipRequired() {
  return <main className="members-gate"><div className="members-gate-glow" /><Link href="/"><ArrowLeft /> Back to HXP</Link><section><LockKeyhole /><p className="members-kicker">The private archive</p><h1>The door opens<br />for active members.</h1><p>This access link is valid, but its Stripe subscription is no longer active or trialing.</p><Link className="members-gate-button" href="/membership">Choose a membership <ArrowRight /></Link><small>Already active under another email? Request a new access link.</small></section></main>;
}

function AccessUnavailable() {
  return <main className="members-gate"><div className="members-gate-glow" /><Link href="/"><ArrowLeft /> Back to HXP</Link><section><LockKeyhole /><p className="members-kicker">Access check unavailable</p><h1>The archive is<br />temporarily quiet.</h1><p>We could not securely verify membership. Nothing has been charged or changed. Please try again shortly.</p><Link className="members-gate-button" href="/members">Try again <ArrowRight /></Link></section></main>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
