import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { EpisodePlayButton } from "@/components/player/episode-player";
import { episodes } from "@/lib/episodes";

const paths = [
  { name: "Consciousness", question: "What remains when mind is no longer reduced to matter?", numbers: [191, 184, 172] },
  { name: "The capable body", question: "How much of human potential is trainable, remembered, or waiting?", numbers: [181, 180, 177] },
  { name: "Meaning & mystery", question: "Where do coincidence, intuition, and lived meaning meet evidence?", numbers: [189, 188, 183] },
  { name: "Ancient worlds", question: "What changes when the past is stranger than the story we inherited?", numbers: [185, 179, 174] },
];

const byNumber = (number: number) => episodes.find((episode) => episode.number === number)!;
const cleanTitle = (title: string) => title.replace(/^Episode\s*#?\d+\s*[–—-]\s*/i, "").replace(/\s*\*[^*]+\*\s*/g, " ").trim();

export default function DiscoverPage() {
  return (
    <main className="path-page">
      <header className="path-nav"><Link href="/"><ArrowLeft /> The Human Experience</Link><span>Curated discovery</span></header>
      <section className="path-hero">
        <p>Explore without the algorithm</p>
        <h1>Begin with a question,<br /><em>not a ranking.</em></h1>
        <div><span>Four paths through the archive</span><p>No trending list. No chronology. Each path is an editorial sequence designed to let one question open naturally into the next.</p></div>
      </section>
      <section className="theme-index" aria-label="Curated listening paths">
        {paths.map((path, pathIndex) => (
          <article key={path.name} className="theme-path">
            <div className="theme-intro"><span>Path 0{pathIndex + 1}</span><h2>{path.name}</h2><p>{path.question}</p></div>
            <ol>
              {path.numbers.map((number, episodeIndex) => {
                const episode = byNumber(number);
                return <li key={number}><span>{episodeIndex + 1}</span><div><small>Episode {episode.number} · {episode.guest}</small><h3>{cleanTitle(episode.title)}</h3></div><EpisodePlayButton episode={episode}>Listen <ArrowRight /></EpisodePlayButton></li>;
              })}
            </ol>
          </article>
        ))}
      </section>
      <footer className="path-footer"><p>Curiosity is a better guide than popularity.</p><Link href="/universe">Enter the living map <ArrowRight /></Link></footer>
    </main>
  );
}
