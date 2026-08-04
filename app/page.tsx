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
  NewsletterForm,
  TrackedLink,
} from "@/components/conversion/conversion-ui";
import {
  EpisodePlayButton,
} from "@/components/player/episode-player";
import { episodes } from "@/lib/episodes";

const featured = episodes[0];
const trustedGuests = [
  { name: "Wim Hof", note: "Resilience & the nervous system", href: "https://www.youtube.com/watch?v=GJPdd2nJP8k" },
  { name: "Graham Hancock", note: "Lost history & ancient worlds", href: "https://www.youtube.com/watch?v=1mcl_v3H4sA" },
  { name: "James Clear", note: "Habits & human potential", href: "https://www.youtube.com/watch?v=SJLw02QjoQQ" },
  { name: "Rupert Sheldrake", note: "Biology beyond convention", href: "https://www.youtube.com/watch?v=H9gxrkQXRGU" },
  { name: "Mark Manson", note: "Meaning in modern life", href: "https://www.youtube.com/watch?v=nqbxGhoe_jo" },
  { name: "Dr. Bruce Lipton", note: "Belief, biology & perception", href: "https://www.youtube.com/watch?v=r-xfE1mEwk4" },
];
const threads = [
  {
    name: "Consciousness",
    copy: "Mind, awareness, near-death experience, and the nature of reality.",
    color: "#f0d69f",
    episodes: [192, 191, 172],
  },
  {
    name: "Human Potential",
    copy: "Habit, resilience, creativity, and the edges of what we can become.",
    color: "#dca4ff",
    episodes: [181, 180, 177],
  },
  {
    name: "Science",
    copy: "Physics, biology, cosmology, and evidence at the edge of the known.",
    color: "#83d8ee",
    episodes: [174, 176, 184],
  },
  {
    name: "Ancient Worlds",
    copy: "Origins, archaeology, myth, and civilizations beneath recorded history.",
    color: "#eda978",
    episodes: [185, 179, 188],
  },
];
const principles = [
  { title: "Explore without the algorithm", copy: "Follow themes, questions, and unexpected connections—not chronology, popularity, or a feed designed to keep you scrolling.", cta: "Choose a theme", href: "/discover", icon: Compass },
  { title: "Return to the full conversation", copy: "Settle into featured, unhurried episodes selected for the depth of the exchange—not the speed of the takeaway.", cta: "Listen in full", href: "/long-form", icon: Headphones },
  { title: "Support the work", copy: "Sustain independent conversations shaped by patience, research, and curiosity rather than an algorithm.", cta: "Become a member", href: "/membership", icon: Sparkles },
];
const editorialPath = [
  { episode: episodes.find((item) => item.number === 191)!, chapter: "I", title: "Begin with the mind", note: "A neuroscientist follows the evidence beyond the boundaries of biology—and asks what awareness might be when the brain is no longer the whole story." },
  { episode: episodes.find((item) => item.number === 189)!, chapter: "II", title: "Then question coincidence", note: "A psychiatrist treats synchronicity as a subject worthy of rigor, revealing how meaning enters the places where probability and lived experience meet." },
  { episode: episodes.find((item) => item.number === 181)!, chapter: "III", title: "Return to the body", note: "A radical experiment in cold, breath, and attention becomes a study of resilience—and of capacities the modern world taught us to forget." },
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
      <FeaturedTransmission />
      <TrustBand />
      <Purpose />
      <KnowledgePortal />
      <EditorialFeature />
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
        <Link href="/universe" className="header-membership">Explore the archive <ArrowRight className="size-3.5" /></Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="conversion-hero">
      <div className="hero-poster-image" aria-hidden="true">{featured.image && <img src={featured.image} alt="" />}<i /></div>
      <div className="hero-film" aria-hidden="true"><span>HXP</span><span>192 conversations</span><span>Est. 2013</span></div>
      <div className="hero-orbit" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }} className="hero-copy">
        <p className="conversion-kicker"><span /> The Human Experience Podcast</p>
        <h1>Follow the question.<br /><em>Discover the unexpected.</em></h1>
        <p className="hero-lede">Unhurried conversations at the edge of consciousness, science, ancient history, and human potential—made for listeners willing to stay with the mystery.</p>
        <div className="conversion-actions">
          <TrackedLink href="/universe" event="universe_engaged" label="hero" className="radiant-button">Explore the Archive <ArrowRight className="size-4" /></TrackedLink>
          <EpisodePlayButton episode={featured} className="ghost-button"><Play className="size-4" fill="currentColor" /> Play the latest episode</EpisodePlayButton>
        </div>
      </motion.div>
      <div className="hero-proof"><span><b>{episodes.length}</b> conversations</span><span><b>12</b> years independent</span><span><b>∞</b> paths through the archive</span></div>
      <a href="#purpose" className="scroll-cue">Scroll to explore <span /></a>
    </section>
  );
}

function FeaturedTransmission() {
  return (
    <section className="hero-transmission-section" aria-label="Latest episode">
      <div className="hero-transmission">
        <div className="transmission-art">{featured.image && <img src={featured.image} alt="" />}<span>Latest transmission</span><EpisodePlayButton episode={featured}><Play fill="currentColor" /></EpisodePlayButton></div>
        <div className="transmission-meta"><small>Now playing · Episode {featured.number}</small><h2>{cleanTitle(featured.title)}</h2><p>{featured.guest}</p><EpisodePlayButton episode={featured}>Listen <ArrowRight className="size-4" /></EpisodePlayButton></div>
      </div>
    </section>
  );
}

function TrustBand() {
  return (
    <section className="trust-band" aria-label="Notable podcast guests">
      <p>192 conversations, including</p>
      <div>
        {trustedGuests.map((guest) => (
          <a
            key={guest.name}
            href={guest.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Watch the ${guest.name} episode on YouTube`}
          >
            <strong>{guest.name}</strong><small>{guest.note}</small>
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
        <h2>Choose how you&apos;d like to begin.</h2>
        <p className="purpose-subtext">A place for ideas that need more than a soundbite.</p>
      </motion.div>
      <div className="purpose-paths">
        {principles.map(({ title, copy, cta, href, icon: Icon }, index) => (
          <motion.div {...fade} transition={{ ...fade.transition, delay: index * .1 }} key={title}>
            <Link href={href} className="purpose-path">
              <span className="purpose-path-number">0{index + 1}</span>
              <Icon className="purpose-path-icon" aria-hidden="true" />
              <div className="purpose-path-copy">
                <h3>{title}</h3>
                <span className="purpose-path-line" aria-hidden="true" />
                <p>{copy}</p>
              </div>
              <span className="purpose-path-cta">{cta}<ArrowRight aria-hidden="true" /></span>
            </Link>
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
          <EpisodePlayButton episode={featured} className="radiant-button"><Play className="size-4" fill="currentColor" /> Play the episode</EpisodePlayButton>
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
        <p className="conversion-kicker"><Sparkles className="size-4" /> The living archive</p>
        <h2>One archive.<br />A universe of connections.</h2>
        <p>Every point is a conversation. Every line reveals a shared idea, guest, or question. Choose a path below—or enter the map and let curiosity decide what comes next.</p>
        <div className="archive-tally" aria-label="Archive overview"><span><b>{episodes.length}</b> episodes</span><span><b>4</b> paths to begin</span><span><b>12</b> years of inquiry</span></div>
        <TrackedLink href="/universe" event="universe_engaged" label="knowledge_portal" className="radiant-button">Explore the complete map <ArrowRight className="size-4" /></TrackedLink>
      </motion.div>
      <div className="archive-artifact">
        <Link href="/universe" className="archive-core" aria-label="Enter the complete HXP archive">
          <span>HXP</span><b>{episodes.length}</b><small>recorded<br />encounters</small><i />
        </Link>
        <div className="artifact-orbits" aria-hidden="true"><i /><i /><i /></div>
        <div className="thread-list">
        {threads.map((thread, index) => (
          <article key={thread.name} style={{ "--thread-color": thread.color } as React.CSSProperties}>
            <header>
              <span className="thread-number">0{index + 1}</span>
              <i style={{ background: thread.color, boxShadow: `0 0 22px ${thread.color}` }} />
              <span><b>{thread.name}</b><small>{thread.copy}</small></span>
            </header>
            <div className="thread-episodes">
              {thread.episodes.map((number) => {
                const episode = episodes.find((item) => item.number === number);
                if (!episode) return null;
                return (
                  <EpisodePlayButton key={number} episode={episode}>
                    <span>EP {number}</span>
                    <b>{cleanTitle(episode.title)}</b>
                    <Play className="size-3" fill="currentColor" />
                  </EpisodePlayButton>
                );
              })}
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}

function EditorialFeature() {
  const portrait = editorialPath[0].episode;
  return (
    <section id="episodes" className="editorial-dossier">
      <div className="dossier-rule"><span>HXP · Editorial No. 01</span><span>Three entries into the archive</span></div>
      <div className="dossier-opening">
        <motion.div {...fade} className="dossier-title"><p className="conversion-kicker">A considered place to begin</p><h2>Three conversations.<br /><em>One human question.</em></h2></motion.div>
        <div className="dossier-portrait">{portrait.image && <img src={portrait.image} alt={`Portrait of ${portrait.guest}`} />}<span>Plate 01</span></div>
        <div className="dossier-essay"><span className="dossier-dropcap">W</span><p>What are we, beneath the explanations we inherit? The HXP archive has never offered one answer. It has made room for a more useful practice: moving between mind, meaning, and the intelligence of the body without forcing the mystery closed.</p><p>This short sequence is not a ranking. It is an editorial path—three encounters chosen because each changes the terms of the question that follows.</p><small>Selected from {episodes.length} independent conversations</small></div>
      </div>
      <div className="dossier-chapters">
        {editorialPath.map(({ episode, chapter, title, note }, index) => <motion.article {...fade} transition={{ ...fade.transition, delay: index * .08 }} key={episode.number}><div className="dossier-chapter-mark"><span>{chapter}</span><small>Episode {episode.number}</small></div><div className="dossier-chapter-copy"><p>{title}</p><h3>{cleanTitle(episode.title)}</h3><span>With {episode.guest}</span></div><p className="dossier-note">{note}</p><EpisodePlayButton episode={episode} className="dossier-listen"><Play fill="currentColor" /> Listen</EpisodePlayButton></motion.article>)}
      </div>
      <footer className="dossier-footer"><p><span>Further reading</span> Follow another question through the complete editorial index.</p><Link href="/top-episodes">Open the essential episodes <ArrowRight className="size-4" /></Link></footer>
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
      <div><p className="conversion-kicker">A quieter kind of inbox</p><h2>Keep the question open.</h2><p>Receive a new conversation, one resurfaced idea from the archive, and a question worth carrying into your week.</p><small>No feed. No daily noise. Just the best of HXP, sent with restraint.</small></div>
      <aside className="dispatch-invitation"><span>Join the HXP dispatch</span><p>A private note for the deeply curious.</p><NewsletterForm /><small>Occasional emails · Unsubscribe whenever you like</small></aside>
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
