"use client";

import { ArrowLeft, ExternalLink, Menu, Quote as QuoteIcon, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  formatTimestamp,
  timestampedYouTubeUrl,
} from "@/lib/quotes";
import { searchQuotes } from "@/lib/quote-search";
import { quoteSearchIndex as quotes } from "@/lib/quote-search-index.generated";

export function QuotesExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [episode, setEpisode] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const episodes = useMemo(
    () =>
      Array.from(
        new Map(
          quotes.map((quote) => [
            String(quote.episodeNumber),
            `Episode ${quote.episodeNumber} · ${quote.episodeTitle}`,
          ]),
        ),
      ),
    [],
  );

  const visibleQuotes = useMemo(() => {
    const episodeQuotes = quotes.filter((quote) => {
      const matchesEpisode =
        episode === "all" || String(quote.episodeNumber) === episode;
      return matchesEpisode;
    });
    return searchQuotes(episodeQuotes, query);
  }, [episode, query]);

  return (
    <main className="quotes-page">
      <div className="quotes-radiance" aria-hidden="true" />
      <header className="conversion-header">
        <Link href="/" className="conversion-logo">
          <span>HXP</span>
          <b>
            The Human Experience<small>Podcast · Est. 2013</small>
          </b>
        </Link>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
          <Link href="/#episodes" onClick={() => setMenuOpen(false)}>Episodes</Link>
          <Link href="/universe" onClick={() => setMenuOpen(false)}>Knowledge Universe</Link>
          <Link href="/top-episodes" onClick={() => setMenuOpen(false)}>Start here</Link>
          <Link href="/quotes" aria-current="page" onClick={() => setMenuOpen(false)}>Quotes</Link>
          <Link href="/membership" onClick={() => setMenuOpen(false)}>Membership</Link>
        </nav>
        <div className="conversion-header-actions">
          <Link href="/" className="header-membership">
            <ArrowLeft className="size-3.5" /> Back home
          </Link>
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="quotes-hero">
        <p className="conversion-kicker"><span /> Ideas worth returning to</p>
        <h1>Signals from<br /><em>the conversation.</em></h1>
        <p>
          A growing collection of memorable ideas from the HXP archive—each
          linked back to its verified source.
        </p>
        <div className="quotes-tally">
          <span><b>{quotes.length}</b> selected passages</span>
          <span><b>{episodes.length}</b> {episodes.length === 1 ? "conversation" : "conversations"}</span>
        </div>
      </section>

      <section className="quotes-library" aria-labelledby="quotes-heading">
        <div className="quotes-library-heading">
          <div>
            <p className="conversion-kicker">The living archive</p>
            <h2 id="quotes-heading">Follow the thought.</h2>
          </div>
          <div className="quotes-controls">
            <label className="quotes-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Search quotes</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ideas, speakers, episodes"
              />
            </label>
            <label>
              <span className="sr-only">Filter by episode</span>
              <select value={episode} onChange={(event) => setEpisode(event.target.value)}>
                <option value="all">All episodes</option>
                {episodes.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="quotes-results" aria-live="polite">
          {visibleQuotes.length} {visibleQuotes.length === 1 ? "passage" : "passages"}
        </p>

        {visibleQuotes.length ? (
          <div className="quotes-grid">
            {visibleQuotes.map((quote, index) => (
              <article
                className={`quote-card ${selectedQuote === quote.id ? "is-selected" : ""}`}
                key={quote.id}
                onClick={() =>
                  setSelectedQuote((selected) =>
                    selected === quote.id ? null : quote.id,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedQuote((selected) =>
                      selected === quote.id ? null : quote.id,
                    );
                  }
                }}
                tabIndex={0}
                aria-selected={selectedQuote === quote.id}
              >
                <div className="quote-card-top">
                  <QuoteIcon aria-hidden="true" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <blockquote>“{quote.text}”</blockquote>
                <div className="quote-attribution">
                  <div>
                    <strong>{quote.speaker}</strong>
                    <span>Episode {quote.episodeNumber} · {quote.episodeTitle}</span>
                  </div>
                  <a
                    href={timestampedYouTubeUrl(quote)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={
                      quote.youtubeUrl && quote.timestampSeconds !== null
                        ? `Watch ${quote.speaker} at ${formatTimestamp(quote.timestampSeconds)} on YouTube`
                        : `Read the source transcript for ${quote.speaker}, episode ${quote.episodeNumber}`
                    }
                  >
                    {quote.youtubeUrl && quote.timestampSeconds !== null
                      ? "Watch on YouTube"
                      : "Read transcript"}
                    {quote.timestampSeconds !== null && (
                      <span>{formatTimestamp(quote.timestampSeconds)}</span>
                    )}
                    <ExternalLink aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="quotes-empty">
            <QuoteIcon aria-hidden="true" />
            <h3>No passages found.</h3>
            <p>Try a different word or choose another episode.</p>
            <button onClick={() => { setQuery(""); setEpisode("all"); }}>Clear filters</button>
          </div>
        )}
      </section>
    </main>
  );
}
