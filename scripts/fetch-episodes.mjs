import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const API =
  "https://www.thehumanxp.com/wp-json/wp/v2/posts?per_page=100&_embed=wp:featuredmedia&_fields=id,date,link,title,excerpt,content,featured_media,_embedded";

const TOPICS = {
  Consciousness: ["consciousness", "awareness", "mind", "near death", "quantum", "reality"],
  Spirituality: ["spiritual", "mystic", "soul", "divine", "meditation", "yogi", "awakening"],
  Science: ["science", "physics", "biology", "neuroscience", "research", "cosmic", "universe"],
  Psychology: ["psychology", "anxiety", "emotion", "trauma", "addiction", "fear", "relationship"],
  Psychedelics: ["psychedelic", "ayahuasca", "dmt", "plant medicine", "cannabis"],
  "Human Potential": ["potential", "performance", "success", "willpower", "habit", "learning", "flow"],
  Health: ["health", "healing", "diet", "nutrition", "sleep", "medicine", "longevity", "body"],
  Philosophy: ["philosophy", "meaning", "metaphysics", "stoicism", "ethics", "belief"],
  "Ancient Worlds": ["ancient", "civilization", "egypt", "archaeology", "origins", "monolithic"],
  Creativity: ["creative", "creativity", "art", "music", "writer", "polymath"],
  Technology: ["technology", "artificial intelligence", "blockchain", "futurism", "simulation"],
};

function decode(value = "") {
  return value
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "–")
    .replace(/&#8217;|&#039;|&rsquo;/g, "’")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function plain(html = "") {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function episodeNumber(title) {
  const match = title.match(/(?:episode|ep)\s*#?\s*(\d{1,3})/i);
  return match ? Number(match[1]) : null;
}

function guestFromTitle(title) {
  const cleaned = title
    .replace(/^(?:episode|ep)\s*#?\s*\d+\s*[-–—:]?\s*/i, "")
    .replace(/\s+on\s+.+$/i, "")
    .trim();
  const first = cleaned.split(/\s+[-–—]\s+|\s+w\/\s+|\s+with\s+/i)[0]?.trim();
  return first || "Guest unavailable";
}

function topicMatches(text) {
  const lower = text.toLowerCase();
  const matches = Object.entries(TOPICS)
    .map(([topic, words]) => ({
      topic,
      score: words.reduce((sum, word) => sum + (lower.includes(word) ? 1 : 0), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.topic.localeCompare(b.topic))
    .slice(0, 4)
    .map(({ topic }) => topic);
  return matches.length ? matches : ["Human Potential"];
}

function firstImage(post) {
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  if (embedded) return embedded;
  const match = post.content?.rendered?.match(/<img[^>]+(?:src|data-lazy-src)=["']([^"']+)/i);
  return match?.[1] ? decode(match[1]) : null;
}

function audioUrl(content = "") {
  const match = content.match(/https:\/\/media\.blubrry\.com\/[^"'<>? ]+\.mp3/i);
  return match?.[0] ?? null;
}

const posts = [];
for (let page = 1; page <= 4; page += 1) {
  const response = await fetch(`${API}&page=${page}`);
  if (!response.ok) {
    if (response.status === 400) break;
    throw new Error(`WordPress API returned ${response.status}`);
  }
  const batch = await response.json();
  posts.push(...batch);
  if (batch.length < 100) break;
}

const episodes = posts
  .map((post) => {
    const title = decode(post.title?.rendered ?? "").replace(/\s+/g, " ").trim();
    const number = episodeNumber(title);
    if (!number || number > 250) return null;
    const body = plain(post.excerpt?.rendered || post.content?.rendered || "");
    const description = body
      .replace(/^.*?Subscribe:\s*Spotify\s*\|\s*Email\s*\|\s*RSS\s*\|\s*More\s*/i, "")
      .slice(0, 360)
      .trim();
    const sourceText = `${title} ${body.slice(0, 1800)}`;
    return {
      number,
      title,
      guest: guestFromTitle(title),
      description: description || "Description unavailable in the source archive.",
      date: post.date?.slice(0, 10) ?? null,
      url: post.link?.replace("http://", "https://") ?? null,
      audio: audioUrl(post.content?.rendered ?? ""),
      image: firstImage(post),
      topics: topicMatches(sourceText),
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.number - a.number)
  .filter((episode, index, all) => all.findIndex((item) => item.number === episode.number) === index);

const output = `// Generated from the public Human Experience WordPress archive.\n// Run: node scripts/fetch-episodes.mjs\n\nexport type Episode = {\n  number: number;\n  title: string;\n  guest: string;\n  description: string;\n  date: string | null;\n  url: string | null;\n  audio: string | null;\n  image: string | null;\n  topics: string[];\n};\n\nexport const episodes: Episode[] = ${JSON.stringify(episodes, null, 2)};\n`;

await writeFile(resolve("lib/episodes.ts"), output);
console.log(`Wrote ${episodes.length} episodes to lib/episodes.ts`);
