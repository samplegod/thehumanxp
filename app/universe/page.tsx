import type { Metadata } from "next";

import { KnowledgeUniverse } from "@/components/universe/knowledge-universe";
import { episodes } from "@/lib/episodes";

export const metadata: Metadata = {
  title: "Knowledge Universe | The Human Experience Podcast",
  description: "Explore 192 Human Experience conversations as a living constellation of ideas.",
};

export default function UniversePage() {
  return <KnowledgeUniverse episodes={episodes} />;
}
