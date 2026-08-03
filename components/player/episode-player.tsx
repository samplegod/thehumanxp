"use client";

import { AudioLines, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Episode } from "@/lib/episodes";

type PlayableEpisode = Pick<Episode, "audio" | "guest" | "number" | "title">;

type PlayerContextValue = {
  activeEpisode: PlayableEpisode | null;
  playRequest: number;
  playEpisode: (episode: PlayableEpisode) => void;
  closePlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);
const ACTIVE_EPISODE_KEY = "hxp-active-episode";
const EPISODE_PROGRESS_KEY = "hxp-episode-progress";

export function EpisodePlayerProvider({ children }: { children: ReactNode }) {
  const [activeEpisode, setActiveEpisode] = useState<PlayableEpisode | null>(null);
  const [playRequest, setPlayRequest] = useState(0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ACTIVE_EPISODE_KEY);
      if (stored) setActiveEpisode(JSON.parse(stored) as PlayableEpisode);
    } catch {
      window.localStorage.removeItem(ACTIVE_EPISODE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeEpisode,
      playRequest,
      playEpisode: (episode: PlayableEpisode) => {
        setActiveEpisode(episode);
        setPlayRequest((request) => request + 1);
        window.localStorage.setItem(ACTIVE_EPISODE_KEY, JSON.stringify(episode));
      },
      closePlayer: () => {
        setActiveEpisode(null);
        window.localStorage.removeItem(ACTIVE_EPISODE_KEY);
      },
    }),
    [activeEpisode, playRequest],
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

export function EpisodePlayerDock() {
  const { activeEpisode, closePlayer, playRequest } = useEpisodePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSavedSecond = useRef(-1);

  useEffect(() => {
    if (playRequest === 0) return;
    void audioRef.current?.play().catch(() => {
      // Browser autoplay policies can still require the native play control.
    });
  }, [activeEpisode, playRequest]);

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
  };

  return (
    <aside className="episode-player" aria-label="Episode player">
      <AudioLines aria-hidden="true" />
      <div className="episode-player-copy">
        <small>Now listening · Episode {activeEpisode.number}</small>
        <strong>{cleanTitle(activeEpisode.title)}</strong>
        <span>{activeEpisode.guest}</span>
      </div>
      <audio
        key={activeEpisode.audio}
        ref={audioRef}
        controls
        preload="metadata"
        src={activeEpisode.audio}
        onLoadedMetadata={restoreProgress}
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
