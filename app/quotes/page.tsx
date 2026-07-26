import type { Metadata } from "next";

import { QuotesExperience } from "./quotes-experience";

export const metadata: Metadata = {
  title: "Quotes | The Human Experience Podcast",
  description:
    "Memorable ideas from The Human Experience Podcast, linked to the moment they were spoken.",
};

export default function QuotesPage() {
  return <QuotesExperience />;
}
