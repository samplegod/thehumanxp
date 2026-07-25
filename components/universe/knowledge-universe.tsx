"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  ChevronDown,
  LocateFixed,
  Search,
  Shuffle,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Episode } from "@/lib/episodes";
import { FavoriteButton } from "@/components/conversion/conversion-ui";
import { track } from "@/lib/analytics";

type GraphNode = Episode & { x: number; y: number; radius: number; color: string };
type GraphLink = { source: number; target: number; strength: number };

const topicColors: Record<string, string> = {
  Consciousness: "#f3d8a2",
  Spirituality: "#bba8ff",
  Science: "#8ddaf0",
  Psychology: "#f3a6bb",
  Psychedelics: "#c49af4",
  "Human Potential": "#f2be77",
  Health: "#9cddb9",
  Philosophy: "#d4c6a4",
  "Ancient Worlds": "#efad78",
  Creativity: "#ee98c8",
  Technology: "#8db8ff",
};

const topicOrder = Object.keys(topicColors);

function hash(value: number, salt: number) {
  const x = Math.sin(value * 91.345 + salt * 43.11) * 43758.5453;
  return x - Math.floor(x);
}

function makeGraph(episodes: Episode[]) {
  const guestCounts = new Map<string, number>();
  episodes.forEach((episode) =>
    guestCounts.set(episode.guest, (guestCounts.get(episode.guest) ?? 0) + 1)
  );

  const nodes: GraphNode[] = episodes.map((episode) => {
    const primary = episode.topics[0] ?? "Human Potential";
    const cluster = Math.max(0, topicOrder.indexOf(primary));
    const angle = (cluster / topicOrder.length) * Math.PI * 2 - Math.PI / 2;
    const clusterRadius = 290 + hash(episode.number, 1) * 130;
    const localAngle = angle + (hash(episode.number, 2) - 0.5) * 0.7;
    const centerPull = episode.number > 175 ? 0.72 : 1;
    return {
      ...episode,
      x: Math.cos(localAngle) * clusterRadius * centerPull + (hash(episode.number, 3) - 0.5) * 130,
      y: Math.sin(localAngle) * clusterRadius * centerPull + (hash(episode.number, 4) - 0.5) * 130,
      radius: 2.4 + Math.min(3.8, (guestCounts.get(episode.guest) ?? 1) * 0.7 + episode.topics.length * 0.35),
      color: topicColors[primary] ?? "#f3d8a2",
    };
  });

  const links: GraphLink[] = [];
  nodes.forEach((node, index) => {
    const candidates = nodes
      .slice(index + 1)
      .map((other, offset) => {
        const sharedTopics = node.topics.filter((topic) => other.topics.includes(topic)).length;
        const sameGuest = node.guest === other.guest && node.guest !== "Guest unavailable";
        return {
          target: index + 1 + offset,
          strength: sharedTopics + (sameGuest ? 4 : 0),
          distance: Math.abs(node.number - other.number),
        };
      })
      .filter((item) => item.strength > 0)
      .sort((a, b) => b.strength - a.strength || a.distance - b.distance)
      .slice(0, 2);
    candidates.forEach((candidate) =>
      links.push({ source: index, target: candidate.target, strength: candidate.strength })
    );
  });
  return { nodes, links };
}

function stripEpisode(title: string) {
  return title.replace(/^(?:Episode|Ep)\s*#?\s*\d+\s*[-–—:]?\s*/i, "");
}

export function KnowledgeUniverse({ episodes }: { episodes: Episode[] }) {
  const { nodes, links } = useMemo(() => makeGraph(episodes), [episodes]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const viewRef = useRef({ x: 0, y: 0, zoom: 1 });
  const pointerRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, dragging: false, moved: false });
  const selectedRef = useRef<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [listOpen, setListOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [explorationCount, setExplorationCount] = useState(0);

  selectedRef.current = selected;
  hoveredRef.current = hovered;

  const related = useMemo(() => {
    if (selected === null) return new Set<number>();
    const set = new Set<number>([selected]);
    links.forEach((link) => {
      if (link.source === selected) set.add(link.target);
      if (link.target === selected) set.add(link.source);
    });
    return set;
  }, [links, selected]);

  const filteredIndexes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return new Set(
      nodes
        .map((node, index) => ({ node, index }))
        .filter(({ node }) => topic === "All topics" || node.topics.includes(topic))
        .filter(
          ({ node }) =>
            !normalized ||
            `${node.number} ${node.title} ${node.guest} ${node.topics.join(" ")}`
              .toLowerCase()
              .includes(normalized)
        )
        .map(({ index }) => index)
    );
  }, [nodes, query, topic]);

  const draw = useCallback(
    (time = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const { x, y, zoom } = viewRef.current;
      const centerX = width / 2 + x;
      const centerY = height / 2 + y;
      const active = selectedRef.current;
      const hover = hoveredRef.current;
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time / 600) * 0.14;

      const background = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.7);
      background.addColorStop(0, "rgba(31, 38, 62, .18)");
      background.addColorStop(0.45, "rgba(11, 15, 28, .08)");
      background.addColorStop(1, "rgba(3, 5, 10, 0)");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      links.forEach((link) => {
        const source = nodes[link.source];
        const target = nodes[link.target];
        const relatedLink = active !== null && (link.source === active || link.target === active);
        const faded = active !== null && !relatedLink;
        context.beginPath();
        context.moveTo(centerX + source.x * zoom, centerY + source.y * zoom);
        context.lineTo(centerX + target.x * zoom, centerY + target.y * zoom);
        context.strokeStyle = relatedLink
          ? "rgba(244, 219, 169, .62)"
          : `rgba(159, 182, 215, ${faded ? 0.012 : 0.055})`;
        context.lineWidth = relatedLink ? 1.15 : 0.55;
        context.stroke();
      });

      nodes.forEach((node, index) => {
        const sx = centerX + node.x * zoom;
        const sy = centerY + node.y * zoom;
        const isSelected = active === index;
        const isHovered = hover === index;
        const isRelated = active === null || related.has(index);
        const isFiltered = filteredIndexes.has(index);
        const opacity = !isFiltered ? 0.035 : isRelated ? 0.94 : 0.08;
        const radius = node.radius * zoom * (isSelected ? 1.9 * pulse : isHovered ? 1.55 : 1);
        const glowRadius = Math.max(8, radius * (isSelected ? 7 : isHovered ? 5 : 3.5));
        const glow = context.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
        glow.addColorStop(0, `${node.color}${isSelected ? "ee" : "b8"}`);
        glow.addColorStop(0.18, `${node.color}64`);
        glow.addColorStop(1, `${node.color}00`);
        context.globalAlpha = opacity;
        context.fillStyle = glow;
        context.beginPath();
        context.arc(sx, sy, glowRadius, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = isSelected ? "#fff9e9" : node.color;
        context.beginPath();
        context.arc(sx, sy, Math.max(1.35, radius), 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });

      if (!reducedMotion) frameRef.current = requestAnimationFrame(draw);
    },
    [filteredIndexes, nodes, links, related, reducedMotion]
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    draw();
    const resize = new ResizeObserver(() => draw());
    if (canvasRef.current) resize.observe(canvasRef.current);
    return () => {
      cancelAnimationFrame(frameRef.current);
      resize.disconnect();
    };
  }, [draw]);

  const nodeAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { x, y, zoom } = viewRef.current;
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    let match: number | null = null;
    let best = 18;
    nodes.forEach((node, index) => {
      if (!filteredIndexes.has(index)) return;
      const dx = px - (rect.width / 2 + x + node.x * zoom);
      const dy = py - (rect.height / 2 + y + node.y * zoom);
      const distance = Math.hypot(dx, dy);
      if (distance < best) {
        match = index;
        best = distance;
      }
    });
    return match;
  };

  const reset = () => {
    viewRef.current = { x: 0, y: 0, zoom: 1 };
    setSelected(null);
    setQuery("");
    setTopic("All topics");
    draw();
  };

  const chooseRandom = () => {
    const options = [...filteredIndexes];
    if (!options.length) return;
    selectEpisode(options[Math.floor(Math.random() * options.length)]);
  };

  const selectEpisode = (index: number | null) => {
    setSelected(index);
    if (index !== null) {
      setExplorationCount((count) => count + 1);
      track("universe_engaged", { action: "episode_selected", episode: nodes[index].number });
    }
  };

  const selectedEpisode = selected === null ? null : nodes[selected];
  const hoveredEpisode = hovered === null ? null : nodes[hovered];

  return (
    <main className="universe-shell">
      <div className="universe-noise" aria-hidden="true" />
      <header className="universe-header">
        <Link href="/" className="universe-brand" aria-label="Back to The Human Experience home">
          <span className="universe-mark">HXP</span>
          <span>
            The Human Experience
            <small>Knowledge Universe</small>
          </span>
        </Link>
        <div className="universe-count"><i /> {episodes.length} conversations · 11 constellations</div>
        <div className="universe-header-links">
          <Link href="/membership">Membership</Link>
          <Link href="/" className="universe-back"><ArrowLeft size={15} /> Back to archive</Link>
        </div>
      </header>

      <section className="universe-stage" aria-label="Interactive episode knowledge graph">
        <canvas
          ref={canvasRef}
          className="universe-canvas"
          tabIndex={0}
          aria-label="Interactive map of podcast episodes. Use the accessible episode index below for keyboard navigation."
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pointerRef.current = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, dragging: true, moved: false };
          }}
          onPointerMove={(event) => {
            const pointer = pointerRef.current;
            if (pointer.dragging) {
              const dx = event.clientX - pointer.x;
              const dy = event.clientY - pointer.y;
              if (Math.abs(event.clientX - pointer.startX) + Math.abs(event.clientY - pointer.startY) > 5) pointer.moved = true;
              viewRef.current.x += dx;
              viewRef.current.y += dy;
              pointer.x = event.clientX;
              pointer.y = event.clientY;
              if (reducedMotion) draw();
            } else {
              const hit = nodeAt(event.clientX, event.clientY);
              if (hit !== hoveredRef.current) setHovered(hit);
            }
          }}
          onPointerUp={(event) => {
            const pointer = pointerRef.current;
            if (!pointer.moved) selectEpisode(nodeAt(event.clientX, event.clientY));
            pointer.dragging = false;
          }}
          onPointerLeave={() => {
            pointerRef.current.dragging = false;
            setHovered(null);
          }}
          onWheel={(event) => {
            event.preventDefault();
            viewRef.current.zoom = Math.min(2.2, Math.max(0.55, viewRef.current.zoom * (event.deltaY > 0 ? 0.92 : 1.08)));
            if (reducedMotion) draw();
          }}
        />

        <div className="universe-vignette" aria-hidden="true" />
        <div className="universe-intro">
          <p><Sparkles size={13} /> A living constellation of ideas</p>
          <h1>Follow the light.<br />Find the thread.</h1>
          <span>Every point is a conversation. Every line is a shared question.</span>
        </div>

        <div className="universe-controls">
          <label className="universe-search">
            <Search size={16} />
            <span className="sr-only">Search episodes, guests, and ideas</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the universe" />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
          </label>
          <div className="universe-select-wrap">
            <select aria-label="Filter by topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option>All topics</option>
              {topicOrder.map((item) => <option key={item}>{item}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
          <button onClick={chooseRandom}><Shuffle size={15} /> Random signal</button>
          <button onClick={reset} aria-label="Reset universe"><LocateFixed size={16} /></button>
        </div>

        {hoveredEpisode && selected === null && (
          <div className="universe-hover-card">
            <small>Episode {hoveredEpisode.number}</small>
            <strong>{stripEpisode(hoveredEpisode.title)}</strong>
          </div>
        )}

        <div className="universe-legend" aria-hidden="true">
          {topicOrder.slice(0, 5).map((item) => <span key={item}><i style={{ background: topicColors[item] }} />{item}</span>)}
        </div>

        <div className="universe-hint"><span>Drag to travel</span><span>Scroll to zoom</span><span>Click to illuminate</span></div>

        <aside className={`universe-panel ${selectedEpisode ? "is-open" : ""}`} aria-live="polite">
          {selectedEpisode && (
            <>
              <button className="universe-panel-close" onClick={() => selectEpisode(null)} aria-label="Close episode details"><X size={18} /></button>
              <div className="universe-panel-art">
                {selectedEpisode.image ? <img src={selectedEpisode.image} alt="" /> : <AudioLines size={42} />}
                <div />
                <span>Episode {selectedEpisode.number}</span>
              </div>
              <div className="universe-panel-body">
                <p className="universe-eyebrow">Selected transmission</p>
                <h2>{stripEpisode(selectedEpisode.title)}</h2>
                <p className="universe-guest">A conversation with {selectedEpisode.guest}</p>
                <p className="universe-description">{selectedEpisode.description}</p>
                <div className="universe-topics">
                  {selectedEpisode.topics.map((item) => <button key={item} onClick={() => setTopic(item)}>{item}</button>)}
                  <FavoriteButton episodeNumber={selectedEpisode.number} title={selectedEpisode.title} />
                </div>
                <div className="universe-related">
                  <small>Connected signals</small>
                  {[...related].filter((index) => index !== selected).slice(0, 3).map((index) => (
                    <button key={nodes[index].number} onClick={() => selectEpisode(index)}>
                      <i style={{ background: nodes[index].color }} />
                      <span>EP {nodes[index].number}<b>{nodes[index].guest}</b></span>
                    </button>
                  ))}
                </div>
                <a href={selectedEpisode.audio || selectedEpisode.url || "#"} target="_blank" rel="noreferrer" className="universe-listen">
                  Listen to episode <ArrowUpRight size={16} />
                </a>
                {explorationCount >= 1 && (
                  <div className="universe-membership-invite">
                    <small>Go beyond the map</small>
                    <p>Membership directly supports the next conversations and the continued life of this archive.</p>
                    <Link href="/membership" onClick={() => track("membership_cta_clicked", { label: "universe_panel" })}>Explore membership <ArrowUpRight size={14} /></Link>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </section>

      <section className={`universe-index ${listOpen ? "is-open" : ""}`}>
        <button className="universe-index-toggle" onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen}>
          Accessible episode index <span>{filteredIndexes.size} results</span><ChevronDown size={16} />
        </button>
        {listOpen && (
          <div className="universe-index-grid">
            {nodes.map((episode, index) => filteredIndexes.has(index) && (
              <button key={episode.number} onClick={() => { selectEpisode(index); setListOpen(false); }}>
                <span>EP {episode.number}</span><strong>{episode.guest}</strong><small>{episode.topics.join(" · ")}</small>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
