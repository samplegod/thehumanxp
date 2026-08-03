import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export const memberCategories = [
  "after-hours",
  "bonus-episodes",
  "research-notes",
  "transcripts",
  "downloads",
  "early-access",
  "behind-the-scenes",
] as const;

export type MemberCategory = (typeof memberCategories)[number];

export type MemberItem = {
  slug: string;
  category: MemberCategory;
  title: string;
  eyebrow: string;
  description: string;
  date: string;
  duration?: string;
  format: string;
  featured?: boolean;
  available?: boolean;
  href?: string;
  topics: string[];
  body: string[];
};

export type MemberLibrary = {
  updatedAt: string;
  edition: string;
  items: MemberItem[];
};

export async function getMemberLibrary(): Promise<MemberLibrary> {
  // Read from disk instead of statically importing JSON. Content Studio writes
  // this file at runtime in development, and a module import would stay cached.
  const filePath = path.join(process.cwd(), "content", "members", "library.json");
  return JSON.parse(await readFile(filePath, "utf8")) as MemberLibrary;
}

export function getMemberSections(items: MemberItem[]) {
  return memberCategories.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }));
}

export async function getMemberItem(slug: string) {
  return (await getMemberLibrary()).items.find((item) => item.slug === slug);
}
