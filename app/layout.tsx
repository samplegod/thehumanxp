import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import {
  EpisodePlayerDock,
  EpisodePlayerProvider,
} from "@/components/player/episode-player";

import "./globals.css";
import "./home-polish.css";

export const metadata: Metadata = {
  title: "The Human Experience Podcast | Follow the Question",
  description:
    "Independent long-form conversations exploring consciousness, science, ancient worlds, healing, philosophy, and human potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="font-sans">
        <EpisodePlayerProvider>
          {children}
          <EpisodePlayerDock />
        </EpisodePlayerProvider>
        <Analytics />
      </body>
    </html>
  );
}
