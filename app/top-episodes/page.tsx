import Link from "next/link";
import { ArrowLeft, ExternalLink, Play, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const topEpisodes = [
  {
    guest: "Rob Bell",
    title: "Being in the Moment",
    description:
      "Time magazine top 100 influential voice on coping with adversity and redefining success.",
    href: "https://www.youtube.com/watch?v=LWi-0PL58uI&t",
    videoId: "LWi-0PL58uI",
    themes: ["Presence", "Adversity", "Success"],
  },
  {
    guest: "Ido Portal",
    title: "Movement, Body Dynamics, and Fear",
    description:
      "A masterclass in movement culture, physical intelligence, and confronting fear through the body.",
    href: "https://www.youtube.com/watch?v=bCLDxYavj5k&t",
    videoId: "bCLDxYavj5k",
    themes: ["Movement", "Body", "Fear"],
  },
  {
    guest: "Vishen Lakhiani",
    title: "Mastering the Mind",
    description:
      "The Mindvalley founder explores consciousness, beliefs, and upgrading the operating system of the self.",
    href: "https://www.youtube.com/watch?v=h-CJo8tTl4Y&t",
    videoId: "h-CJo8tTl4Y",
    themes: ["Mind", "Belief", "Consciousness"],
  },
  {
    guest: "Graham Hancock",
    title: "Ancient Structures and Lost Origins",
    description:
      "A sweeping conversation on ancient monuments, deep history, and the mysteries of antiquity.",
    href: "https://www.youtube.com/watch?v=1mcl_v3H4sA",
    videoId: "1mcl_v3H4sA",
    themes: ["Antiquity", "Mystery", "History"],
  },
  {
    guest: "Mark Manson",
    title: "The Subtle Art of Not Giving a F*ck",
    description:
      "A frank, funny, and useful conversation on values, attention, and what is actually worth caring about.",
    href: "https://www.youtube.com/watch?v=nqbxGhoe_jo&t",
    videoId: "nqbxGhoe_jo",
    themes: ["Values", "Clarity", "Life"],
  },
  {
    guest: "Dr. Joe Vitale",
    title: "Law of Attraction and Reality Manifestation",
    description:
      "A conversation on fear, intention, and the stories we use to shape possibility.",
    href: "https://youtu.be/7U4WrjFzZ_U",
    videoId: "7U4WrjFzZ_U",
    themes: ["Manifestation", "Fear", "Reality"],
  },
  {
    guest: "Dr. Bruce Lipton",
    title: "The Biology of Belief",
    description:
      "The bestselling geneticist on how thought, belief, and perception influence the body and reality.",
    href: "https://www.youtube.com/watch?v=r-xfE1mEwk4",
    videoId: "r-xfE1mEwk4",
    themes: ["Biology", "Belief", "Mind"],
  },
  {
    guest: "Waqas Ahmed",
    title: "The Polymath",
    description:
      "Unlocking hidden human potential through creativity, range, success, and multidimensional thinking.",
    href: "https://thehumanxp.com/episode-154/",
    themes: ["Creativity", "Range", "Potential"],
  },
  {
    guest: "Wim Hof",
    title: "The Iceman",
    description:
      "Extreme cold, breath, healing, and the trainable edge of natural human power.",
    href: "https://youtu.be/GJPdd2nJP8k",
    videoId: "GJPdd2nJP8k",
    themes: ["Breath", "Cold", "Resilience"],
  },
  {
    guest: "Alex Grey & Allyson Grey",
    title: "Visionary Art and Creativity",
    description:
      "A luminous exploration of inspiration, art, spiritual practice, and creative devotion.",
    href: "https://youtu.be/uxLxGdqOrP8",
    videoId: "uxLxGdqOrP8",
    themes: ["Art", "Vision", "Creativity"],
  },
  {
    guest: "Sevan Bomar",
    title: "Timing, Flow, Mind, Body, Soul",
    description:
      "A far-reaching episode on flow, embodied awareness, soul, and blockchain technology.",
    href: "https://youtu.be/G8Ht5YVpv1o",
    videoId: "G8Ht5YVpv1o",
    themes: ["Flow", "Soul", "Technology"],
  },
  {
    guest: "Nassim Haramein",
    title: "Unified Field Theory",
    description:
      "Physics, unity, and the connected nature of everything through a frontier-science lens.",
    href: "https://youtu.be/t7iSUMM2cmI",
    videoId: "t7iSUMM2cmI",
    themes: ["Physics", "Unity", "Universe"],
  },
  {
    guest: "Master Mantak Chia",
    title: "The Energy Body",
    description:
      "Bio-energetics, balance, Qi Gong, and cultivating life force through embodied practice.",
    href: "https://youtu.be/fMpdV5o2OWY",
    videoId: "fMpdV5o2OWY",
    themes: ["Energy", "Qi Gong", "Balance"],
  },
  {
    guest: "Rick Strassman",
    title: "DMT: The Spirit Molecule",
    description:
      "A landmark conversation on DMT, consciousness, altered states, and the mystery of mind.",
    href: "https://youtu.be/1r-BbSn9GSM",
    videoId: "1r-BbSn9GSM",
    themes: ["DMT", "Mysticism", "Mind"],
  },
];

function getThumbnail(videoId?: string) {
  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80";
}

export default function TopEpisodesPage() {
  const featured = topEpisodes[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="noise" />
      <section className="relative overflow-hidden border-b border-white/14 pt-8">
        <div className="absolute inset-0 -z-10">
          <div className="cinema-frame h-full w-full opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,7,5,0.62),rgba(10,7,5,0.92))]" />
          <div className="pearl-line absolute bottom-0 left-0 h-px w-full" />
        </div>

        <div className="container pb-16 pt-4 md:pb-24">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back home
            </Link>
          </Button>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <Badge>All-time top episodes</Badge>
              <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] text-foreground [text-shadow:0_0_46px_rgba(255,246,220,0.14)] md:text-7xl">
                Game-changing conversations for the creative and curious.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                A curated HXP starter list for listeners who want the deepest
                threads first: consciousness, embodiment, creativity, ancient
                mystery, reality, and human potential.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <a href={featured.href} target="_blank" rel="noreferrer">
                    Start with Rob Bell
                    <Play className="size-4" />
                  </a>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <a href="#episodes">
                    Browse all 14
                    <Sparkles className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden bg-white/[0.06]">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={getThumbnail(featured.videoId)}
                  alt=""
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.74))]" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-sm text-primary">Featured first listen</p>
                  <h2 className="mt-2 text-2xl font-semibold">{featured.guest}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {featured.title}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="episodes" className="container py-20">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topEpisodes.map((episode, index) => (
            <Card
              key={episode.href}
              className="group overflow-hidden bg-white/[0.055] transition duration-300 hover:border-primary/30 hover:bg-white/[0.075] hover:shadow-glow"
            >
              <div className="relative aspect-video overflow-hidden bg-black/30">
                <img
                  src={getThumbnail(episode.videoId)}
                  alt=""
                  className="h-full w-full object-cover opacity-82 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72))]" />
                <div className="absolute left-4 top-4 rounded-full border border-primary/30 bg-black/55 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                  #{String(index + 1).padStart(2, "0")}
                </div>
                <div className="absolute bottom-4 left-4 grid size-11 place-items-center rounded-full border border-white/20 bg-white/12 text-foreground shadow-glow backdrop-blur">
                  <Play className="size-4" />
                </div>
              </div>
              <CardContent className="flex min-h-80 flex-col p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-primary">
                  {episode.guest}
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  {episode.title}
                </h2>
                <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
                  {episode.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {episode.themes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
                <Button className="mt-6 w-full" variant="secondary" asChild>
                  <a href={episode.href} target="_blank" rel="noreferrer">
                    Watch episode
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
