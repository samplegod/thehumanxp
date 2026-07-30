"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  Compass,
  Headphones,
  Menu,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  FavoriteButton,
  NewsletterForm,
  TrackedLink,
} from "@/components/conversion/conversion-ui";
import { episodes } from "@/lib/episodes";

const featured = episodes[0];
const trustedGuests = [
  { name: "Wim Hof", href: "https://www.youtube.com/watch?v=GJPdd2nJP8k" },
  { name: "Graham Hancock", href: "https://www.youtube.com/watch?v=1mcl_v3H4sA" },
  { name: "James Clear", href: "https://www.youtube.com/watch?v=SJLw02QjoQQ" },
  { name: "Rupert Sheldrake", href: "https://www.youtube.com/watch?v=H9gxrkQXRGU" },
  { name: "Mark Manson", href: "https://www.youtube.com/watch?v=nqbxGhoe_jo" },
  { name: "Dr. Bruce Lipton", href: "https://www.youtube.com/watch?v=r-xfE1mEwk4" },
];
const threads = [
  {
    name: "Consciousness",
    copy: "What is the mind—and where does it end?",
    color: "#f0d69f",
    episodes: [192, 191, 172],
  },
  {
    name: "Human Potential",
    copy: "How much of our capacity remains untrained?",
    color: "#dca4ff",
    episodes: [181, 180, 177],
  },
  {
    name: "Science",
    copy: "Where evidence meets the edge of the known.",
    color: "#83d8ee",
    episodes: [174, 176, 184],
  },
  {
    name: "Ancient Worlds",
    copy: "Memory, origins, and civilizations beneath history.",
    color: "#eda978",
    episodes: [185, 179, 188],
  },
];
const principles = [
  ["Explore without the algorithm", "Follow ideas, guests, and questions—not a feed designed to keep you scrolling.", Compass],
  ["Return to the full conversation", "A 192-episode independent archive of patient, long-form inquiry.", Headphones],
  ["Support work with depth", "Membership directly supports the care, research, and production behind future conversations.", Sparkles],
];

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
} as const;

export default function Home() {
  return (
    <main className="conversion-site">
      <Radiance />
      <Header />
      <Hero />
      <TrustBand />
      <Purpose />
      <Featured />
      <KnowledgePortal />
      <EpisodeGrid />
      <MembershipInvitation />
      <Dispatch />
      <Footer />
    </main>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="conversion-header">
      <Link href="/" className="conversion-logo"><span>HXP</span><b>The Human Experience<small>Podcast · Est. 2013</small></b></Link>
      <nav className={open ? "is-open" : ""} aria-label="Primary navigation">
        <Link href="#episodes" onClick={() => setOpen(false)}>Episodes</Link>
        <Link href="/universe" onClick={() => setOpen(false)}>Knowledge Universe</Link>
        <Link href="/top-episodes" onClick={() => setOpen(false)}>Start here</Link>
        <Link href="/quotes" onClick={() => setOpen(false)}>Quotes</Link>
        <Link href="/community" onClick={() => setOpen(false)}>Community</Link>
        <Link href="/membership" onClick={() => setOpen(false)}>Membership</Link>
      </nav>
      <div className="conversion-header-actions">
        <Link href="/membership" className="header-membership">Enter the membership <ArrowRight className="size-3.5" /></Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="conversion-hero">
      <div className="hero-orbit" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }} className="hero-copy">
        <p className="conversion-kicker"><span /> Long-form inquiry for the deeply curious</p>
        <h1>Go beyond the episode.<br /><em>Enter the inquiry.</em></h1>
        <p className="hero-lede">Independent conversations with scientists, mystics, authors, and cultural outliers—mapped into a living archive for people who refuse shallow answers.</p>
        <div className="conversion-actions">
          <TrackedLink href="/membership" event="membership_cta_clicked" label="hero" className="radiant-button">Enter the membership <ArrowRight className="size-4" /></TrackedLink>
          <TrackedLink href="/universe" event="universe_engaged" label="hero" className="ghost-button">Explore the Knowledge Universe <Sparkles className="size-4" /></TrackedLink>
        </div>
        <p className="hero-proof"><span>{episodes.length}</span> conversations across consciousness, science, healing, philosophy, and human potential.</p>
      </motion.div>
      <div className="hero-transmission">
        <div className="transmission-art">{featured.image && <img src={featured.image} alt="" />}<span>Latest transmission</span><button aria-label={`Play episode ${featured.number}`}><Play fill="currentColor" /></button></div>
        <div className="transmission-meta"><small>Episode {featured.number} · {featured.date?.slice(0, 4)}</small><h2>{cleanTitle(featured.title)}</h2><a href={featured.audio ?? featured.url ?? "#"} target="_blank" rel="noreferrer">Listen now <ArrowRight className="size-4" /></a></div>
      </div>
      <a href="#purpose" className="scroll-cue">Scroll to explore <span /></a>
    </section>
  );
}

function TrustBand() {
  return (
    <section className="trust-band" aria-label="Notable podcast guests">
      <p>Conversations with</p>
      <div>
        {trustedGuests.map((guest) => (
          <a
            key={guest.name}
            href={guest.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Watch the ${guest.name} episode on YouTube`}
          >
            {guest.name}
          </a>
        ))}
      </div>
    </section>
  );
}

function Purpose() {
  return (
    <section id="purpose" className="conversion-section purpose-section">
      <motion.div {...fade}>
        <p className="conversion-kicker">For listeners who stay with the question</p>
        <h2>A place for ideas that need more than a sound bite.</h2>
      </motion.div>
      <div className="purpose-grid">
        {principles.map(([title, copy, Icon], index) => (
          <motion.div {...fade} transition={{ ...fade.transition, delay: index * .1 }} key={String(title)}>
            <article>
              <span>0{index + 1}</span><Icon className="size-5" />
              <h3>{String(title)}</h3><p>{String(copy)}</p>
            </article>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section className="featured-conversation">
      <div className="featured-image">{featured.image && <img src={featured.image} alt={`Portrait for ${featured.guest}`} />}<div /><span>Episode {featured.number}</span></div>
      <motion.div {...fade} className="featured-copy">
        <p className="conversion-kicker">Featured conversation</p>
        <h2>{cleanTitle(featured.title)}</h2>
        <p>{featured.description}</p>
        <div className="topic-pills">{featured.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        <div className="conversion-actions">
          <a href={featured.audio ?? featured.url ?? "#"} target="_blank" rel="noreferrer" className="radiant-button"><Play className="size-4" fill="currentColor" /> Play the episode</a>
          <Link href="/universe" className="text-link">Follow this thread <ArrowRight className="size-4" /></Link>
        </div>
      </motion.div>
    </section>
  );
}

function KnowledgePortal() {
  return (
    <section className="knowledge-portal">
      <div className="portal-stars" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ "--x": `${(i * 37) % 97}%`, "--y": `${(i * 61) % 91}%`, "--d": `${1 + (i % 4)}s` } as React.CSSProperties} />)}</div>
      <motion.div {...fade}>
        <p className="conversion-kicker"><Sparkles className="size-4" /> The signature experience</p>
        <h2>One archive.<br />A universe of connections.</h2>
        <p>Every glowing point is an episode. Every line traces a shared guest, theme, or question. Move through the work by curiosity rather than chronology.</p>
        <TrackedLink href="/universe" event="universe_engaged" label="knowledge_portal" className="radiant-button">Enter the Knowledge Universe <ArrowRight className="size-4" /></TrackedLink>
      </motion.div>
      <div className="thread-list">
        {threads.map((thread) => (
          <article key={thread.name}>
            <header>
              <i style={{ background: thread.color, boxShadow: `0 0 22px ${thread.color}` }} />
              <span><b>{thread.name}</b><small>{thread.copy}</small></span>
            </header>
            <div className="thread-episodes">
              {thread.episodes.map((number) => {
                const episode = episodes.find((item) => item.number === number);
                if (!episode) return null;
                return (
                  <a key={number} href={episode.audio ?? episode.url ?? "#"} target="_blank" rel="noreferrer">
                    <span>EP {number}</span>
                    <b>{cleanTitle(episode.title)}</b>
                    <Play className="size-3" fill="currentColor" />
                  </a>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EpisodeGrid() {
  return (
    <section id="episodes" className="conversion-section">
      <div className="section-heading"><div><p className="conversion-kicker">Continue your journey</p><h2>Signals from the archive.</h2></div><Link href="/top-episodes">View the essential episodes <ArrowRight className="size-4" /></Link></div>
      <div className="conversion-episodes">
        {episodes.slice(0, 6).map((episode, index) => (
          <article key={episode.number} className={index === 0 ? "is-featured" : ""}>
            <a href={episode.audio ?? episode.url ?? "#"} target="_blank" rel="noreferrer">
              <div className="episode-art">{episode.image && <img src={episode.image} alt="" />}<span>EP {episode.number}</span><i><Play className="size-4" fill="currentColor" /></i></div>
              <p>{episode.topics.slice(0, 2).join(" · ")}</p><h3>{cleanTitle(episode.title)}</h3><small>{episode.guest}</small>
            </a>
            <FavoriteButton episodeNumber={episode.number} title={episode.title} />
          </article>
        ))}
      </div>
    </section>
  );
}

function MembershipInvitation() {
  return (
    <section className="membership-invitation">
      <div className="membership-halo" aria-hidden="true" />
      <motion.div {...fade}>
        <p className="conversion-kicker">Keep independent inquiry alive</p>
        <h2>The next chapter is built with its listeners.</h2>
        <p>Membership is for people who want to directly support thoughtful, independent conversation—and help this archive continue to grow with care.</p>
        <ul>
          <li><Check className="size-4" /> Support future long-form conversations</li>
          <li><Check className="size-4" /> Explore the complete 192-episode archive</li>
          <li><Check className="size-4" /> Navigate curated paths through the Knowledge Universe</li>
        </ul>
        <div className="conversion-actions">
          <TrackedLink href="/membership" event="membership_cta_clicked" label="homepage_invitation" className="radiant-button">See membership options <ArrowRight className="size-4" /></TrackedLink>
          <span>Monthly or annual · Secure subscription billing by Stripe</span>
        </div>
      </motion.div>
      <aside><BookOpen className="size-7" /><small>Membership principle</small><blockquote>“Support the questions you want to remain alive in the world.”</blockquote><p>No manufactured urgency. No algorithmic noise. Just a direct relationship between listeners and the work.</p></aside>
    </section>
  );
}

function Dispatch() {
  return (
    <section className="dispatch-section">
      <div><p className="conversion-kicker">Not ready to join?</p><h2>Begin with one thoughtful dispatch.</h2><p>New conversations, archive notes, and membership updates—sent with restraint.</p></div>
      <NewsletterForm />
    </section>
  );
}

function Footer() {
  return (
    <footer className="conversion-footer">
      <div className="footer-mark"><span>HXP</span><p>The Human Experience Podcast<small>Independent conversations since 2013</small></p></div>
      <div><b>Explore</b><Link href="/universe">Knowledge Universe</Link><Link href="/top-episodes">Essential episodes</Link><Link href="/quotes">Quotes</Link><Link href="/membership">Membership</Link></div>
      <div><b>Listen</b><a href={featured.audio ?? "#"}>Latest episode</a><a href="https://open.spotify.com/show/40OXBmEF70PZQ9xeVz3515">Spotify</a><a href="https://www.youtube.com/channel/UCkr2vordfEQw9_sB8pvrGyA">YouTube</a></div>
      <div><b>Information</b><a href="https://fev.laz.mybluehost.me/contact-2/">Contact</a><span>Secure checkout by Stripe</span><span>© 2026 HXP</span></div>
    </footer>
  );
}

function Radiance() {
  return <div className="site-radiance" aria-hidden="true"><i /><i /><i /></div>;
}

function cleanTitle(title: string) {
  return title.replace(/^(Episode|Ep)\s*#?\s*\d+\s*[-–—:]?\s*/i, "");
}
