import "server-only";

import library from "@/content/members/library.json";

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

export function getMemberLibrary(): MemberLibrary {
  return library as MemberLibrary;
}

export function getMemberSections(items: MemberItem[]) {
  return memberCategories.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }));
}

export function getMemberItem(slug: string) {
  return getMemberLibrary().items.find((item) => item.slug === slug);
}
