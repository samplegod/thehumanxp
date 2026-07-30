import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const PAGE_API =
  "https://www.thehumanxp.com/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,content";

const HOST_LABELS = new Set([
  "xavier",
  "xavier katana",
  "host",
  "interviewer",
  "dr g",
  "dr. g",
]);

const MEANINGFUL_WORDS = new Set([
  "awareness",
  "believe",
  "change",
  "consciousness",
  "creative",
  "experience",
  "fear",
  "freedom",
  "future",
  "healing",
  "human",
  "learn",
  "life",
  "love",
  "meaning",
  "mind",
  "nature",
  "possibility",
  "reality",
  "relationship",
  "spiritual",
  "truth",
  "understand",
  "world",
]);

async function importTypeScriptModule(file) {
  const source = await (await import("node:fs/promises")).readFile(resolve(file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: file,
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

function decode(value = "", preserveLines = false) {
  let decoded = value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  if (preserveLines) {
    decoded = decoded.replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>|<\/h\d>/gi, "\n");
  }
  return decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/gi, "–")
    .replace(/&#8217;|&#039;|&rsquo;/gi, "’")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&#038;|&amp;/gi, "&")
    .replace(/&hellip;/gi, "…")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(
      /\b\d{1,2}:\d{2}:\d{2}[.,]\d+\s*,\s*\d{1,2}:\d{2}:\d{2}[.,]\d+\b/g,
      " ",
    )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(preserveLines ? "\n" : " ")
    .trim();
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "at", "episode", "ep", "for", "from", "here",
  "in", "is", "more", "of", "on", "part", "podcast", "the", "to",
  "transcript", "w", "with",
]);

function tokens(value) {
  return new Set(
    decode(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\d+/g, " ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .split(" ")
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
  );
}

function normalized(value) {
  return [...tokens(value)].join(" ");
}

function overlap(left, right) {
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size || 1;
  return { intersection, jaccard: intersection / union };
}

function transcriptTurns(transcript) {
  const lines = transcript.split("\n");
  const turns = [];
  let current = null;
  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9 .&'’_-]{1,40}):\s*(.*)$/);
    if (match) {
      if (current?.text) turns.push(current);
      current = { label: match[1].trim(), text: match[2].trim() };
    } else if (current) {
      current.text = `${current.text} ${line}`.replace(/\s+/g, " ").trim();
    }
  }
  if (current?.text) turns.push(current);
  return turns;
}

function chooseGuestLabel(turns, episode) {
  const stats = new Map();
  for (const turn of turns) {
    const key = turn.label.toLowerCase().replace(/\s+/g, " ").trim();
    if (HOST_LABELS.has(key) || key === "transcript") continue;
    const existing = stats.get(key) ?? { label: turn.label, turns: 0, characters: 0 };
    existing.turns += 1;
    existing.characters += turn.text.length;
    stats.set(key, existing);
  }
  const guestTokens = tokens(episode.guest);
  return [...stats.values()]
    .map((stat) => ({
      ...stat,
      guestOverlap: overlap(guestTokens, tokens(stat.label)).intersection,
    }))
    .sort(
      (a, b) =>
        b.guestOverlap - a.guestOverlap ||
        b.characters - a.characters ||
        b.turns - a.turns,
    )[0];
}

function sentenceCandidates(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z“"'])/)
    .map((sentence) => sentence.replace(/^["“]|["”]$/g, "").trim())
    .filter((sentence) => {
      const words = sentence.split(/\s+/);
      return (
        sentence.length >= 80 &&
        sentence.length <= 320 &&
        words.length >= 12 &&
        !sentence.endsWith("?") &&
        !/https?:|www\.|subscribe|sponsor|commercial break/i.test(sentence)
      );
    });
}

function quoteScore(sentence) {
  const words = sentence.toLowerCase().match(/[\p{L}\p{N}’'-]+/gu) ?? [];
  const meaningful = words.filter((word) => MEANINGFUL_WORDS.has(word)).length;
  const filler = /\b(you know|kind of|sort of|um|uh|thanks for|thank you)\b/i.test(sentence);
  const firstPerson = /\b(i|we|our|us)\b/i.test(sentence);
  const declarativeStart =
    /^(i |i’m |i've |we |we’re |our |the |when |life |love |consciousness |human |you can |there is |what we )/i.test(
      sentence,
    );
  const questionCue =
    /\b(can you|could you|do you|tell me|tell us|what do you|how do you|would you)\b/i.test(
      sentence,
    );
  const promo =
    /\b(thank you|thanks for listening|human experience|my guest|subscribe|get out of here|welcome back)\b/i.test(
      sentence,
    );
  const weakEnding = /\b(and|but|for|if|of|or|the|to|with)\.?$/i.test(sentence);
  return (
    meaningful * 20 +
    Math.max(0, 90 - Math.abs(sentence.length - 180) / 2) +
    (firstPerson ? 8 : 0) -
    (declarativeStart ? 35 : 0) -
    (filler ? 30 : 0) -
    (questionCue ? 80 : 0) -
    (promo ? 180 : 0) -
    (weakEnding ? 35 : 0)
  );
}

function chooseQuote(turns, guestLabel) {
  const guestTurns = turns.filter(
    (turn) => turn.label.toLowerCase() === guestLabel?.toLowerCase(),
  );
  return guestTurns
    .flatMap((turn) => sentenceCandidates(turn.text))
    .map((text) => ({ text, score: quoteScore(text) }))
    .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text))[0]?.text;
}

function chooseUnattributedPassage(transcript) {
  const lines = transcript
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 5) {
    const words = transcript.replace(/\s+/g, " ").trim().split(" ");
    const candidates = [];
    const start = Math.floor(words.length * 0.12);
    const end = Math.floor(words.length * 0.9);
    for (let index = start; index < end; index += 10) {
      const text = words.slice(index, index + 36).join(" ").trim();
      if (
        text.length >= 100 &&
        text.length <= 320 &&
        !/https?:|www\.|subscribe|sponsor|commercial break|welcome to the human experience/i.test(
          text,
        )
      ) {
        candidates.push({ text, score: quoteScore(text) });
      }
    }
    return candidates.sort(
      (a, b) => b.score - a.score || a.text.localeCompare(b.text),
    )[0]?.text;
  }
  const start = Math.floor(lines.length * 0.12);
  const end = Math.max(start + 1, Math.floor(lines.length * 0.9));
  const candidates = [];

  for (let index = start; index < end; index += 2) {
    for (let lineCount = 5; lineCount <= 10; lineCount += 1) {
      const text = lines.slice(index, index + lineCount).join(" ").replace(/\s+/g, " ").trim();
      const words = text.split(/\s+/);
      if (
        text.length < 100 ||
        text.length > 320 ||
        words.length < 18 ||
        words.length > 55 ||
        /https?:|www\.|subscribe|sponsor|commercial break|welcome to the human experience/i.test(text)
      ) {
        continue;
      }
      candidates.push({ text, score: quoteScore(text) });
    }
  }

  return candidates.sort(
    (a, b) => b.score - a.score || a.text.localeCompare(b.text),
  )[0]?.text;
}

const { episodes } = await importTypeScriptModule("lib/episodes.ts");
const pageResponses = await Promise.all(
  [1, 2, 3].map(async (page) => {
    const response = await fetch(`${PAGE_API}&page=${page}`);
    if (!response.ok) throw new Error(`Transcript page API returned ${response.status}`);
    return response.json();
  }),
);

const rawTranscriptPages = pageResponses
  .flat()
  .filter((page) => /transcript/i.test(`${page.slug} ${decode(page.title?.rendered)}`))
  .map((page) => {
    const title = decode(page.title.rendered);
    const transcript = decode(page.content?.rendered, true);
    const explicit =
      Number(
        (`${page.slug} ${title}`.match(/(?:episode|ep)[- #]*(\d{1,3})/i) ?? [])[1],
      ) || null;
    return {
      id: page.id,
      slug: page.slug,
      title,
      transcript,
      explicit,
      titleTokens: tokens(title),
      sourceUrl: `https://www.thehumanxp.com/${page.slug}/`,
    };
  })
  .filter((page) => page.transcript.length >= 5_000);

const transcriptPages = [
  ...new Map(
    rawTranscriptPages.map((page) => [
      `${normalized(page.title)}:${normalized(page.transcript.slice(0, 2_000))}`,
      page,
    ]),
  ).values(),
];

const extracted = [];
const unmatched = [];
const extractionFailures = [];
const seenQuoteText = new Set();
const seenQuoteTokenSets = [];

for (const episode of episodes) {
  const episodeTokens = tokens(`${episode.guest} ${episode.title}`);
  const guestTokens = tokens(episode.guest);
  const scored = transcriptPages
    .map((page) => {
      const titleOverlap = overlap(episodeTokens, page.titleTokens);
      const guestOverlap = overlap(guestTokens, page.titleTokens);
      const explicit = page.explicit === episode.number;
      const score = explicit
        ? 2
        : guestOverlap.intersection
          ? guestOverlap.intersection / Math.max(guestTokens.size, 1) * 0.7 +
            titleOverlap.jaccard * 0.3
          : titleOverlap.jaccard * 0.4;
      return { page, score, explicit };
    })
    .sort((a, b) => b.score - a.score || b.page.transcript.length - a.page.transcript.length);

  const best = scored[0];
  const second = scored[1];
  const confident =
    Boolean(best?.explicit) ||
    best?.score >= 0.75 ||
    (best?.score >= 0.56 && best.score - (second?.score ?? 0) >= 0.04);

  if (!confident) {
    unmatched.push(episode.number);
    continue;
  }

  const turns = transcriptTurns(best.page.transcript);
  const guestLabel = chooseGuestLabel(turns, episode);
  const reliableAttribution =
    Boolean(guestLabel?.guestOverlap) && guestLabel.turns >= 5;
  const attributedText = reliableAttribution
    ? chooseQuote(turns, guestLabel.label)
    : null;
  const text = attributedText ?? chooseUnattributedPassage(best.page.transcript);
  if (!text) {
    extractionFailures.push({
      episodeNumber: episode.number,
      transcriptUrl: best.page.sourceUrl,
      guestLabel: guestLabel?.label ?? null,
      turnCount: turns.length,
    });
    continue;
  }

  const duplicateKey = normalized(text);
  const duplicateTokens = tokens(text);
  const nearDuplicate = seenQuoteTokenSets.some((existing) => {
    const intersection = [...duplicateTokens].filter((token) => existing.has(token)).length;
    const union = new Set([...duplicateTokens, ...existing]).size || 1;
    return intersection / union >= 0.88;
  });
  if (seenQuoteText.has(duplicateKey) || nearDuplicate) continue;
  seenQuoteText.add(duplicateKey);
  seenQuoteTokenSets.push(duplicateTokens);

  extracted.push({
    id: `transcript-${episode.number}-${best.page.id}`,
    text: attributedText ? text : `…${text}…`,
    speaker: attributedText ? episode.guest : "Episode transcript",
    episodeNumber: episode.number,
    episodeTitle: episode.title.replace(
      /^(?:Episode|Ep)\s*#?\s*\d+\s*[-–—:]?\s*/i,
      "",
    ),
    youtubeUrl: null,
    timestampSeconds: null,
    transcriptSource: "wordpress-transcript",
    transcriptUrl: best.page.sourceUrl,
    episodeUrl: episode.url,
  });
}

const payload = {
  generatedFrom: "public-hxp-wordpress-transcript-pages",
  episodeCount: episodes.length,
  transcriptPageCount: transcriptPages.length,
  extractedQuoteCount: extracted.length,
  unmatchedEpisodeNumbers: unmatched,
  extractionFailures,
  quotes: extracted,
};

await writeFile(
  resolve("data/transcript-quotes.generated.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);

console.log(`Found ${transcriptPages.length} unique usable transcript pages.`);
console.log(`Extracted ${extracted.length} exact quotes.`);
console.log(`${unmatched.length} episodes could not be confidently matched.`);
console.log(`${extractionFailures.length} matched transcripts had no safe extractable guest passage.`);
