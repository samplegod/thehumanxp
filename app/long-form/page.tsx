import { ArrowLeft, ArrowRight, Clock3, Play } from "lucide-react";
import Link from "next/link";

import { EpisodePlayButton } from "@/components/player/episode-player";
import { episodes } from "@/lib/episodes";

const selections = [191, 189, 184, 181, 179].map((number) => episodes.find((episode) => episode.number === number)!);
const cleanTitle = (title: string) => title.replace(/^Episode\s*#?\d+\s*[–—-]\s*/i, "").replace(/\s*\*[^*]+\*\s*/g, " ").trim();

export default function LongFormPage() {
  const featured = selections[0];
  return (
    <main className="path-page longform-page">
      <header className="path-nav"><Link href="/"><ArrowLeft /> The Human Experience</Link><span>Long-form listening room</span></header>
      <section className="path-hero longform-hero">
        <p>Return to the full conversation</p>
        <h1>Make room<br /><em>for the whole thought.</em></h1>
        <div><span><Clock3 /> Unhurried by design</span><p>These conversations reward attention. Put down the scroll, press play, and stay long enough for certainty to loosen its grip.</p></div>
      </section>
      <section className="listening-feature">
        <div className="listening-art">{featured.image && <img src={featured.image} alt={`Portrait of ${featured.guest}`} />}<span>Editor&apos;s selection · Episode {featured.number}</span></div>
        <div className="listening-copy"><p>Begin here</p><h2>{cleanTitle(featured.title)}</h2><h3>{featured.guest}</h3><blockquote>“A conversation about consciousness that keeps widening the frame—moving from the laboratory to lived experience without rushing the mystery.”</blockquote><EpisodePlayButton episode={featured} className="listening-button"><Play fill="currentColor" /> Play the full episode</EpisodePlayButton></div>
      </section>
      <section className="listening-program"><header><span>The listening program</span><p>Four more conversations chosen for depth, range, and the places they refuse easy answers.</p></header>{selections.slice(1).map((episode, index) => <article key={episode.number}><span>0{index + 2}</span><div><small>Episode {episode.number} · {episode.guest}</small><h2>{cleanTitle(episode.title)}</h2></div><EpisodePlayButton episode={episode}>Listen in full <ArrowRight /></EpisodePlayButton></article>)}</section>
      <footer className="path-footer"><p>The archive contains {episodes.length} complete conversations.</p><Link href="/universe">Explore every path <ArrowRight /></Link></footer>
    </main>
  );
}
