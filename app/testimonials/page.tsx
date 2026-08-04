import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What People Are Saying | The Human Experience Podcast",
  description: "Listener correspondence from The Human Experience Podcast archive.",
};

const notes = [
  { text: "So good it brings tears to my eyes sometimes.", kind: "Listener note", size: "feature" },
  { text: "…content, and I love how you never flood my timeline with ads. Very rare today. You guys always seem to brighten my day. I’m rather crunched for money, so donating isn’t possible right now—but please let me know of any way I can help out. ❤️", kind: "Recovered fragment", size: "wide" },
  { text: "…on iTunes Podcasts. Content is fire and is literally the real soul food. Keep fighting the good fight. Mad respect.", kind: "Recovered fragment", size: "narrow" },
  { text: "I have listened to The Human Experience. I love it. Thank you for your wisdom and work.", kind: "Listener note", size: "narrow" },
  { text: "I’ve been listening to your podcasts for hours now and I’m absolutely obsessed. Godspeed to all of you! 🧡", kind: "Listener note", size: "wide" },
  { text: "…and they’re each awesome. Thank you for your amazing work. I’ll be watching more frequently. Have a blessed…", kind: "Recovered fragment", author: "Joanna", size: "wide" },
  { text: "Yes, I’m already a fan of the podcast!", kind: "Recovered fragment", size: "narrow" },
  { text: "Amazing. Extraordinary. I like…", kind: "Recovered fragment", size: "narrow" },
  { text: "Beautiful podcast. Love the overall aesthetic and organic theme—the content really earns the title you gave it. Can’t wait to listen to more!", kind: "Listener note", size: "wide" },
  { text: "Content is great. Keep it going.", kind: "Listener note", size: "narrow" },
  { text: "…but I feel compelled to answer. At only five minutes into browsing your posts, I’m sure the pleasure of the follow is mine. I’ll be sure to check the podcast—thanks.", kind: "Recovered fragment", size: "wide" },
  { text: "I most definitely will give that a listen. Blessings to you…", kind: "Recovered fragment", size: "narrow" },
  { text: "I just finished Elizabeth Lesser and wow—what an amazing soul and wonderful questions. I really enjoyed that. Thank you for reaching out to me. Very great podcast! I will recommend it and will absolutely listen to episode 105. Wishes your way. ✨", kind: "Listener note", size: "wide" },
] as const;

export default function TestimonialsPage() {
  const [feature, ...correspondence] = notes;

  return (
    <main className="testimonials-page testimonials-editorial">
      <header className="testimonials-nav">
        <Link href="/"><ArrowLeft /> The Human Experience</Link>
        <span>Listener correspondence · Vol. I</span>
      </header>

      <section className="testimonials-hero">
        <div className="testimonials-issue">
          <span>HXP · 2013—Present</span>
          <span>Messages from the other side of the conversation</span>
        </div>
        <p className="testimonials-kicker">What people are saying</p>
        <h1>Some conversations<br /><em>stay with us.</em></h1>
        <div className="testimonials-hero-note">
          <span>01 / Listener archive</span>
          <p>Unsolicited notes, sent across the years by people who found something human in the work.</p>
        </div>
      </section>

      <section className="testimonials-feature" aria-label="Featured listener message">
        <div className="testimonials-feature-number">01</div>
        <blockquote>“{feature.text}”</blockquote>
        <footer>{feature.kind} · received by HXP</footer>
      </section>

      <section className="testimonials-index">
        <header className="testimonials-index-heading">
          <div>
            <p>Listener correspondence</p>
            <span>12 notes · preserved with gratitude</span>
          </div>
          <h2>Words sent back<br /><em>across the distance.</em></h2>
        </header>

        <div className="testimonials-ledger">
          {correspondence.map((note, index) => (
            <article className={`testimonial-entry is-${note.size}`} key={`${note.text}-${index}`}>
              <header>
                <span>{String(index + 2).padStart(2, "0")}</span>
                <small>{note.kind}</small>
              </header>
              <blockquote>“{note.text}”</blockquote>
              {"author" in note && note.author ? <cite>— {note.author}</cite> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials-provenance">
        <div className="testimonials-provenance-copy">
          <p>Source material · Archive plate 01</p>
          <h2>Preserved<br /><em>as received.</em></h2>
          <p>The original collage remains part of the record. Cropped or obscured messages above are identified as recovered fragments; only light punctuation and spelling edits were made for clarity.</p>
        </div>
        <figure>
          <div><img src="/testimonials.jpeg" alt="The original collage of messages sent by Human Experience Podcast listeners" /></div>
          <figcaption>Original listener collage · Personal details remain secondary to the words.</figcaption>
        </figure>
      </section>

      <footer className="testimonials-footer testimonials-editorial-footer">
        <p>Thank you for listening deeply.</p>
        <Link href="/universe">Continue into the archive <ArrowRight /></Link>
      </footer>
    </main>
  );
}
