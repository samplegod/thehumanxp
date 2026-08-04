"use client";

import { ArrowLeft, ArrowRight, AudioLines, Compass, ListMusic, Play, Search, Sparkles, Star, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { episodes, type Episode } from "@/lib/episodes";

type PlayableEpisode = Pick<Episode, "audio" | "guest" | "number" | "title">;

type PlayerContextValue = {
  activeEpisode: PlayableEpisode | null;
  recentEpisodes: PlayableEpisode[];
  playRequest: number;
  playEpisode: (episode: PlayableEpisode) => void;
  closePlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);
const ACTIVE_EPISODE_KEY = "hxp-active-episode";
const EPISODE_PROGRESS_KEY = "hxp-episode-progress";
const RECENT_EPISODES_KEY = "hxp-recent-episodes";
const PROGRESS_UPDATED_EVENT = "hxp-progress-updated";

export function EpisodePlayerProvider({ children }: { children: ReactNode }) {
  const [activeEpisode, setActiveEpisode] = useState<PlayableEpisode | null>(null);
  const [recentEpisodes, setRecentEpisodes] = useState<PlayableEpisode[]>([]);
  const [playRequest, setPlayRequest] = useState(0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ACTIVE_EPISODE_KEY);
      if (stored) setActiveEpisode(JSON.parse(stored) as PlayableEpisode);
      const recent = window.localStorage.getItem(RECENT_EPISODES_KEY);
      if (recent) setRecentEpisodes(JSON.parse(recent) as PlayableEpisode[]);
    } catch {
      window.localStorage.removeItem(ACTIVE_EPISODE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeEpisode,
      recentEpisodes,
      playRequest,
      playEpisode: (episode: PlayableEpisode) => {
        setActiveEpisode(episode);
        setPlayRequest((request) => request + 1);
        window.localStorage.setItem(ACTIVE_EPISODE_KEY, JSON.stringify(episode));
        setRecentEpisodes((current) => {
          const next = [episode, ...current.filter((item) => item.number !== episode.number)].slice(0, 6);
          window.localStorage.setItem(RECENT_EPISODES_KEY, JSON.stringify(next));
          return next;
        });
      },
      closePlayer: () => {
        setActiveEpisode(null);
        window.localStorage.removeItem(ACTIVE_EPISODE_KEY);
      },
    }),
    [activeEpisode, playRequest, recentEpisodes],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function EpisodePlayButton({ episode, children, className }: {
  episode: PlayableEpisode;
  children: ReactNode;
  className?: string;
}) {
  const { activeEpisode, playEpisode } = useEpisodePlayer();
  const isActive = activeEpisode?.number === episode.number;

  if (!episode.audio) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={() => playEpisode(episode)}
      aria-label={`Play episode ${episode.number}: ${episode.title}`}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
}

export function ContinueListeningShelf() {
  const { activeEpisode, playEpisode, recentEpisodes } = useEpisodePlayer();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const syncProgress = () => setProgress(readProgress());
    syncProgress();
    window.addEventListener(PROGRESS_UPDATED_EVENT, syncProgress);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, syncProgress);
  }, []);

  if (!recentEpisodes.length) return null;

  return (
    <section className="continue-listening" aria-labelledby="continue-listening-title">
      <header>
        <div>
          <p className="conversion-kicker">Your listening thread</p>
          <h2 id="continue-listening-title">Continue where you left off.</h2>
        </div>
        <span>Saved only in this browser</span>
      </header>
      <div className="continue-listening-list">
        {recentEpisodes.slice(0, 4).map((recent) => {
          const fullEpisode = episodes.find((item) => item.number === recent.number);
          const savedTime = progress[String(recent.number)] ?? 0;
          const isActive = activeEpisode?.number === recent.number;
          return (
            <button key={recent.number} type="button" onClick={() => playEpisode(recent)} className={isActive ? "is-active" : ""}>
              <span className="continue-listening-art">
                {fullEpisode?.image ? <img src={fullEpisode.image} alt="" /> : <i>HXP</i>}
                <Play fill="currentColor" aria-hidden="true" />
              </span>
              <span className="continue-listening-copy">
                <small>Episode {recent.number} · {savedTime > 0 ? `Resume at ${formatTime(savedTime)}` : "Ready to begin"}</small>
                <strong>{cleanTitle(recent.title)}</strong>
                <em>{recent.guest}</em>
              </span>
              <ArrowRight aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function EpisodePlayerDock() {
  const { activeEpisode, closePlayer, playEpisode, playRequest } = useEpisodePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSavedSecond = useRef(-1);
  const pendingPlayRequest = useRef(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<"featured" | "recommended" | "themes" | "all">("featured");
  const [query, setQuery] = useState("");
  const playableEpisodes = useMemo(() => episodes.filter((episode) => Boolean(episode.audio)), []);
  const activeIndex = activeEpisode
    ? playableEpisodes.findIndex((episode) => episode.number === activeEpisode.number)
    : -1;

  useEffect(() => {
    if (playRequest === 0) return;
    pendingPlayRequest.current = playRequest;
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    void audio.play().then(() => {
      pendingPlayRequest.current = 0;
    }).catch(() => {
      // The ready event retries after the newly selected source has loaded.
    });
  }, [activeEpisode, playRequest]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [drawerOpen]);

  if (!activeEpisode?.audio) return null;

  const restoreProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const progress = readProgress();
    const savedTime = progress[String(activeEpisode.number)] ?? 0;
    if (savedTime > 0 && savedTime < audio.duration - 5) audio.currentTime = savedTime;
  };

  const saveProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const currentSecond = Math.floor(audio.currentTime);
    if (currentSecond === lastSavedSecond.current) return;
    lastSavedSecond.current = currentSecond;
    const progress = readProgress();
    progress[String(activeEpisode.number)] = currentSecond;
    window.localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(progress));
    if (currentSecond % 5 === 0) window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
  };

  const moveThroughArchive = (direction: -1 | 1) => {
    if (activeIndex < 0 || playableEpisodes.length === 0) return;
    const nextIndex = (activeIndex + direction + playableEpisodes.length) % playableEpisodes.length;
    playEpisode(playableEpisodes[nextIndex]);
  };

  const recommendedNumbers = new Set([191, 189, 181, 180, 172, 185, 176, 174]);
  const searchResults = playableEpisodes.filter((episode) => {
    const haystack = `${episode.number} ${episode.title} ${episode.guest} ${episode.topics.join(" ")}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const visibleEpisodes = query.trim()
    ? searchResults
    : drawerView === "featured"
      ? playableEpisodes.slice(0, 12)
      : drawerView === "recommended"
        ? playableEpisodes.filter((episode) => recommendedNumbers.has(episode.number))
        : playableEpisodes;
  const themeGroups = ["Consciousness", "Human Potential", "Science", "Ancient Worlds"]
    .map((topic) => ({ topic, episodes: playableEpisodes.filter((episode) => episode.topics.includes(topic)).slice(0, 6) }))
    .filter((group) => group.episodes.length > 0);

  const chooseEpisode = (episode: Episode) => {
    playEpisode(episode);
    setDrawerOpen(false);
  };

  return (
    <>
      <div className={`episode-library-scrim ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <aside className={`episode-library-drawer ${drawerOpen ? "is-open" : ""}`} aria-label="Episode library" aria-hidden={!drawerOpen}>
        <header className="episode-library-header">
          <div><span>HXP listening index</span><h2>Choose your next<br /><em>conversation.</em></h2></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close episode library"><X /></button>
        </header>
        <div className="episode-library-tools">
          <label><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a guest, episode, or idea" aria-label="Search episodes" /></label>
          <nav aria-label="Episode collections">
            <button className={drawerView === "featured" ? "is-active" : ""} onClick={() => { setDrawerView("featured"); setQuery(""); }}><Star /> Featured</button>
            <button className={drawerView === "recommended" ? "is-active" : ""} onClick={() => { setDrawerView("recommended"); setQuery(""); }}><Sparkles /> Recommended</button>
            <button className={drawerView === "themes" ? "is-active" : ""} onClick={() => { setDrawerView("themes"); setQuery(""); }}><Compass /> By theme</button>
            <button className={drawerView === "all" ? "is-active" : ""} onClick={() => { setDrawerView("all"); setQuery(""); }}><ListMusic /> Full archive</button>
          </nav>
        </div>
        <div className="episode-library-body">
          <div className="episode-library-caption"><span>{query ? "Search results" : drawerView === "all" ? "Complete listening archive" : drawerView}</span><small>{query ? searchResults.length : drawerView === "themes" ? themeGroups.length : visibleEpisodes.length} {drawerView === "themes" && !query ? "curated paths" : "episodes"}</small></div>
          {drawerView === "themes" && !query ? (
            <div className="episode-theme-groups">
              {themeGroups.map((group, groupIndex) => <section key={group.topic}><header><span>0{groupIndex + 1}</span><h3>{group.topic}</h3></header><div>{group.episodes.map((episode) => <LibraryEpisode key={episode.number} episode={episode} active={episode.number === activeEpisode.number} onChoose={chooseEpisode} />)}</div></section>)}
            </div>
          ) : visibleEpisodes.length ? (
            <div className="episode-library-list">{visibleEpisodes.map((episode) => <LibraryEpisode key={episode.number} episode={episode} active={episode.number === activeEpisode.number} onChoose={chooseEpisode} />)}</div>
          ) : <div className="episode-library-empty">No conversation matches that search.</div>}
        </div>
      </aside>
      <aside className="episode-player" aria-label="Episode player">
      <div className="episode-player-signal" aria-hidden="true"><AudioLines /></div>
      <div className="episode-player-copy">
        <small>Now listening · Episode {activeEpisode.number} <i>{activeIndex + 1} / {playableEpisodes.length}</i></small>
        <strong>{cleanTitle(activeEpisode.title)}</strong>
        <span>{activeEpisode.guest}</span>
      </div>
      <div className="episode-player-navigation" aria-label="Browse playable episodes">
        <button type="button" onClick={() => moveThroughArchive(-1)} aria-label="Play previous episode"><ArrowLeft /></button>
        <button type="button" className="episode-player-library-trigger" onClick={() => setDrawerOpen(true)} aria-label="Open the complete episode library"><ListMusic /><span>Open library</span></button>
        <button type="button" onClick={() => moveThroughArchive(1)} aria-label="Play next episode"><ArrowRight /></button>
      </div>
      <audio
        key={activeEpisode.audio}
        ref={audioRef}
        controls
        preload="metadata"
        src={activeEpisode.audio}
        onLoadedMetadata={restoreProgress}
        onCanPlay={() => {
          if (pendingPlayRequest.current !== playRequest) return;
          void audioRef.current?.play().then(() => {
            pendingPlayRequest.current = 0;
          }).catch(() => {
            // Browser autoplay policies can still require the native play control.
          });
        }}
        onTimeUpdate={saveProgress}
        onEnded={() => {
          const progress = readProgress();
          progress[String(activeEpisode.number)] = 0;
          window.localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(progress));
        }}
      >
        Your browser does not support embedded audio.
      </audio>
      <button type="button" className="episode-player-close" onClick={closePlayer} aria-label="Close episode player">
        <X aria-hidden="true" />
      </button>
      </aside>
    </>
  );
}

function LibraryEpisode({ episode, active, onChoose }: { episode: Episode; active: boolean; onChoose: (episode: Episode) => void }) {
  return (
    <button type="button" className={`episode-library-item ${active ? "is-playing" : ""}`} onClick={() => onChoose(episode)}>
      <span className="episode-library-art">{episode.image ? <img src={episode.image} alt="" /> : <i>HXP</i>}<Play fill="currentColor" /></span>
      <span className="episode-library-copy"><small>Episode {episode.number}{episode.date ? ` · ${new Date(`${episode.date}T12:00:00`).getFullYear()}` : ""}</small><strong>{cleanTitle(episode.title)}</strong><em>{episode.guest}</em></span>
      <span className="episode-library-action">{active ? "Playing" : "Listen"}<ArrowRight /></span>
    </button>
  );
}

function useEpisodePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("Episode player controls must be inside EpisodePlayerProvider");
  return value;
}

function cleanTitle(title: string) {
  return title.replace(/^(Episode|Ep)\s*#?\s*\d+\s*[-–—:]?\s*/i, "");
}

function readProgress(): Record<string, number> {
  try {
    const stored = window.localStorage.getItem(EPISODE_PROGRESS_KEY);
    return stored ? JSON.parse(stored) as Record<string, number> : {};
  } catch {
    return {};
  }
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
