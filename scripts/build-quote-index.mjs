import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

async function importTypeScriptModule(file) {
  const source = await readFile(resolve(file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: file,
  });
  const encoded = Buffer.from(outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

function normalize(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const [{ episodes }, { quotes: curatedQuotes }] = await Promise.all([
  importTypeScriptModule("lib/episodes.ts"),
  importTypeScriptModule("lib/quotes.ts"),
]);
const transcriptPayload = JSON.parse(
  await readFile(resolve("data/transcript-quotes.generated.json"), "utf8").catch(
    (error) => {
      if (error.code === "ENOENT") return '{"quotes":[]}';
      throw error;
    },
  ),
);
const quotes = [...curatedQuotes, ...(transcriptPayload.quotes ?? [])];

const episodeByNumber = new Map(episodes.map((episode) => [episode.number, episode]));
const seen = new Set();
const seenQuoteTexts = [];
const searchableQuotes = [];

for (const quote of quotes) {
  if (!quote.id || !quote.speaker || !quote.text || quote.text.trim().length < 20) {
    throw new Error(`Malformed or too-short quote: ${quote.id || "missing-id"}`);
  }
  if (
    quote.timestampSeconds !== null &&
    (!Number.isInteger(quote.timestampSeconds) || quote.timestampSeconds < 0)
  ) {
    throw new Error(`Invalid timestamp for quote ${quote.id}`);
  }
  if (
    quote.youtubeUrl &&
    !/^https:\/\/www\.youtube\.com\/watch\?v=/.test(quote.youtubeUrl)
  ) {
    throw new Error(`Invalid YouTube source for quote ${quote.id}`);
  }
  if (!quote.youtubeUrl && !quote.transcriptUrl) {
    throw new Error(`Quote ${quote.id} has no traceable source`);
  }

  const episode = episodeByNumber.get(quote.episodeNumber);
  if (!episode) throw new Error(`Episode ${quote.episodeNumber} is missing for quote ${quote.id}`);

  const duplicateKey = normalize(`${quote.episodeNumber} ${quote.speaker} ${quote.text}`);
  const normalizedQuoteText = normalize(quote.text);
  const duplicateText = seenQuoteTexts.some(
    (existing) =>
      existing === normalizedQuoteText ||
      (existing.split(" ").length >= 8 && normalizedQuoteText.includes(existing)) ||
      (normalizedQuoteText.split(" ").length >= 8 && existing.includes(normalizedQuoteText)),
  );
  if (seen.has(duplicateKey) || duplicateText) continue;
  seen.add(duplicateKey);
  seenQuoteTexts.push(normalizedQuoteText);

  const transcriptText = quote.text;
  searchableQuotes.push({
    ...quote,
    episodeGuest: episode.guest,
    episodeUrl: episode.url,
    topics: episode.topics,
    transcriptText,
    normalized: {
      quote: normalize(quote.text),
      speaker: normalize(quote.speaker),
      episodeTitle: normalize(quote.episodeTitle),
      episodeGuest: normalize(episode.guest),
      episodeNumber: String(quote.episodeNumber),
      topics: normalize(episode.topics.join(" ")),
      transcript: normalize(transcriptText),
    },
  });
}

const quoteCountByEpisode = new Map();
for (const quote of searchableQuotes) {
  quoteCountByEpisode.set(
    quote.episodeNumber,
    (quoteCountByEpisode.get(quote.episodeNumber) ?? 0) + 1,
  );
}

const episodeSearchIndex = episodes.map((episode) => ({
  number: episode.number,
  title: episode.title,
  guest: episode.guest,
  topics: episode.topics,
  url: episode.url,
  quoteCount: quoteCountByEpisode.get(episode.number) ?? 0,
  transcriptStatus: quoteCountByEpisode.has(episode.number)
    ? "verified-excerpts-only"
    : "missing",
  normalizedSearchText: normalize(
    `${episode.number} ${episode.title} ${episode.guest} ${episode.topics.join(" ")} ${episode.description}`,
  ),
}));

const coveredEpisodeNumbers = [...quoteCountByEpisode.keys()].sort((a, b) => b - a);
const missingEpisodeNumbers = episodes
  .filter((episode) => !quoteCountByEpisode.has(episode.number))
  .map((episode) => episode.number)
  .sort((a, b) => b - a);

const output = `// Generated from verified local quote data and episode metadata.
// Run: npm run quotes:index
// Do not edit by hand.

import type { Quote } from "./quotes";

export type SearchableQuote = Quote & {
  episodeGuest: string;
  episodeUrl: string | null;
  topics: string[];
  transcriptText: string;
  normalized: {
    quote: string;
    speaker: string;
    episodeTitle: string;
    episodeGuest: string;
    episodeNumber: string;
    topics: string;
    transcript: string;
  };
};

export const quoteSearchIndex = ${JSON.stringify(searchableQuotes, null, 2)} satisfies SearchableQuote[];

export const quoteIndexCoverage = ${JSON.stringify(
  {
    episodeCount: episodes.length,
    quoteCount: searchableQuotes.length,
    coveredEpisodeCount: coveredEpisodeNumbers.length,
    coveredEpisodeNumbers,
    missingTranscriptCount: missingEpisodeNumbers.length,
    missingEpisodeNumbers,
    transcriptCoverage: "verified-excerpts-only",
  },
  null,
  2,
)};
`;

const episodeOutput = `// Generated from the complete local episode archive.
// Run: npm run quotes:index
// Do not edit by hand.

export const episodeSearchIndex = ${JSON.stringify(episodeSearchIndex, null, 2)};
`;

await Promise.all([
  writeFile(resolve("lib/quote-search-index.generated.ts"), output),
  writeFile(resolve("lib/episode-search-index.generated.ts"), episodeOutput),
]);

console.log(
  [
    `Indexed ${episodes.length} episode metadata records.`,
    `Indexed ${searchableQuotes.length} verified quotes across ${coveredEpisodeNumbers.length} episodes.`,
    `${missingEpisodeNumbers.length} episodes have no local transcript or verified quote source.`,
  ].join("\n"),
);
