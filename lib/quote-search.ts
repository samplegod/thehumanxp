import type { SearchableQuote } from "./quote-search-index.generated";

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function includesEveryToken(value: string, tokens: string[]) {
  return tokens.every((token) => value.includes(token));
}

export function quoteSearchScore(quote: SearchableQuote, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 1;

  const tokens = query.split(" ");
  const { normalized } = quote;
  const combined = [
    normalized.quote,
    normalized.speaker,
    normalized.episodeTitle,
    normalized.episodeGuest,
    `episode ${normalized.episodeNumber}`,
    normalized.topics,
    normalized.transcript,
  ].join(" ");

  if (!includesEveryToken(combined, tokens)) return 0;

  let score = 1;
  if (normalized.quote === query) score += 1_200;
  else if (normalized.quote.includes(query)) score += 850;

  if (normalized.speaker === query || normalized.episodeGuest === query) score += 1_000;
  else if (normalized.speaker.startsWith(query) || normalized.episodeGuest.startsWith(query)) score += 800;
  else if (normalized.speaker.includes(query) || normalized.episodeGuest.includes(query)) score += 650;

  if (normalized.episodeTitle === query) score += 700;
  else if (normalized.episodeTitle.includes(query)) score += 525;

  if (normalized.topics.includes(query)) score += 450;
  if (
    normalized.episodeNumber === query ||
    `episode ${normalized.episodeNumber}` === query
  ) score += 425;
  if (normalized.transcript.includes(query)) score += 300;

  score += tokens.reduce(
    (sum, token) =>
      sum +
      (normalized.quote.includes(token) ? 40 : 0) +
      (normalized.speaker.includes(token) ? 30 : 0) +
      (normalized.episodeTitle.includes(token) ? 20 : 0) +
      (normalized.topics.includes(token) ? 10 : 0),
    0,
  );

  return score;
}

export function searchQuotes(quotes: SearchableQuote[], query: string) {
  if (!normalizeSearchText(query)) return quotes;

  return quotes
    .map((quote, sourceOrder) => ({
      quote,
      score: quoteSearchScore(quote, query),
      sourceOrder,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.sourceOrder - b.sourceOrder)
    .map(({ quote }) => quote);
}
