export type Quote = {
  id: string;
  text: string;
  speaker: string;
  episodeNumber: number;
  episodeTitle: string;
  youtubeUrl: string | null;
  timestampSeconds: number | null;
  transcriptSource: "local-audio-transcription" | "wordpress-transcript";
  transcriptUrl?: string;
  episodeUrl?: string | null;
};

export const quotes: Quote[] = [
  {
    id: "mark-gober-quest",
    text: "I’ve been on this quest to just try to get to the core of what is this reality? Who are we? Why are we here? What is this place? And how should we be living?",
    speaker: "Mark Gober",
    episodeNumber: 192,
    episodeTitle: "Unveiling the Spiritual and Mystical Universe",
    youtubeUrl: "https://www.youtube.com/watch?v=beR1KsnBj5A",
    timestampSeconds: 224,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "mark-gober-consciousness",
    text: "The reality is that no one has ever observed consciousness coming out of a brain.",
    speaker: "Mark Gober",
    episodeNumber: 192,
    episodeTitle: "Unveiling the Spiritual and Mystical Universe",
    youtubeUrl: "https://www.youtube.com/watch?v=beR1KsnBj5A",
    timestampSeconds: 468,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "mark-gober-winks",
    text: "They could be like winks from reality.",
    speaker: "Mark Gober",
    episodeNumber: 192,
    episodeTitle: "Unveiling the Spiritual and Mystical Universe",
    youtubeUrl: "https://www.youtube.com/watch?v=beR1KsnBj5A",
    timestampSeconds: 892,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "mark-gober-spiritual-journey",
    text: "The spiritual journey is to elevate our consciousness. And if we take these things as distractions, it can take us off the path.",
    speaker: "Mark Gober",
    episodeNumber: 192,
    episodeTitle: "Unveiling the Spiritual and Mystical Universe",
    youtubeUrl: "https://www.youtube.com/watch?v=beR1KsnBj5A",
    timestampSeconds: 2836,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "mark-gober-message",
    text: "Even if I’m experiencing a radically difficult experience, I try to ask, what’s the message here? What am I supposed to learn from this?",
    speaker: "Mark Gober",
    episodeNumber: 192,
    episodeTitle: "Unveiling the Spiritual and Mystical Universe",
    youtubeUrl: "https://www.youtube.com/watch?v=beR1KsnBj5A",
    timestampSeconds: 3574,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "marjorie-woollacott-awakening",
    text: "I saw that I was much more than just the product of the activity of neurons in my brain and my body.",
    speaker: "Dr. Marjorie Woollacott",
    episodeNumber: 191,
    episodeTitle: "Infinite Awareness — Consciousness Beyond Biology",
    youtubeUrl: "https://www.youtube.com/watch?v=lQa2JBVkHJI",
    timestampSeconds: 168,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "marjorie-woollacott-fundamental",
    text: "Consciousness is fundamental and the material world is derivative of consciousness.",
    speaker: "Dr. Marjorie Woollacott",
    episodeNumber: 191,
    episodeTitle: "Infinite Awareness — Consciousness Beyond Biology",
    youtubeUrl: "https://www.youtube.com/watch?v=lQa2JBVkHJI",
    timestampSeconds: 268,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "marjorie-woollacott-source",
    text: "If you’re trying to look for the source of it, you’re never going to be able to do that.",
    speaker: "Dr. Marjorie Woollacott",
    episodeNumber: 191,
    episodeTitle: "Infinite Awareness — Consciousness Beyond Biology",
    youtubeUrl: "https://www.youtube.com/watch?v=lQa2JBVkHJI",
    timestampSeconds: 274,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "marjorie-woollacott-compassion",
    text: "We have to have compassion for ourselves when we’re dealing with, for example, the loss of a loved one or some illness in our life.",
    speaker: "Dr. Marjorie Woollacott",
    episodeNumber: 191,
    episodeTitle: "Infinite Awareness — Consciousness Beyond Biology",
    youtubeUrl: "https://www.youtube.com/watch?v=lQa2JBVkHJI",
    timestampSeconds: 2965,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "marjorie-woollacott-creative-consciousness",
    text: "We are in an experiment in the expansion of creative consciousness.",
    speaker: "Dr. Marjorie Woollacott",
    episodeNumber: 191,
    episodeTitle: "Infinite Awareness — Consciousness Beyond Biology",
    youtubeUrl: "https://www.youtube.com/watch?v=lQa2JBVkHJI",
    timestampSeconds: 3512,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "matt-kahl-trauma-future",
    text: "Your trauma doesn’t really have much to do with you. It made you who you are, but it does not have to determine who you will be.",
    speaker: "Matt Kahl",
    episodeNumber: 160,
    episodeTitle: "From Shock to Awe — Plant Medicine and Healing Trauma",
    youtubeUrl: "https://www.youtube.com/watch?v=o_3j-EG6JIo",
    timestampSeconds: 1248,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "matt-kahl-pain",
    text: "We all deserve recognition for our pain, and nobody’s pain is any more important than anybody else’s.",
    speaker: "Matt Kahl",
    episodeNumber: 160,
    episodeTitle: "From Shock to Awe — Plant Medicine and Healing Trauma",
    youtubeUrl: "https://www.youtube.com/watch?v=o_3j-EG6JIo",
    timestampSeconds: 1834,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "matt-kahl-everyday-work",
    text: "The work has to be done in your everyday life. You have to start making changes in the way you actually live your life, the way you think from moment to moment.",
    speaker: "Matt Kahl",
    episodeNumber: 160,
    episodeTitle: "From Shock to Awe — Plant Medicine and Healing Trauma",
    youtubeUrl: "https://www.youtube.com/watch?v=o_3j-EG6JIo",
    timestampSeconds: 2130,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "matt-kahl-greater-whole",
    text: "My trauma no longer determined who I was as a person. It was simply something that was a part of the greater whole.",
    speaker: "Matt Kahl",
    episodeNumber: 160,
    episodeTitle: "From Shock to Awe — Plant Medicine and Healing Trauma",
    youtubeUrl: "https://www.youtube.com/watch?v=o_3j-EG6JIo",
    timestampSeconds: 2235,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "matt-kahl-nature",
    text: "There is nothing in the world that should come between us and nature.",
    speaker: "Matt Kahl",
    episodeNumber: 160,
    episodeTitle: "From Shock to Awe — Plant Medicine and Healing Trauma",
    youtubeUrl: "https://www.youtube.com/watch?v=o_3j-EG6JIo",
    timestampSeconds: 2680,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "nandhiji-consciousness",
    text: "Consciousness is the only thing we could take from this life to the next.",
    speaker: "Nandhiji",
    episodeNumber: 159,
    episodeTitle: "Expanding Consciousness, Embracing Divinity, The Way of the Yogi",
    youtubeUrl: "https://www.youtube.com/watch?v=Un6EvWeigmU",
    timestampSeconds: 308,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "nandhiji-everything-teaches",
    text: "Everything teaches us. Every moment, everything we see, everything we experience is source.",
    speaker: "Nandhiji",
    episodeNumber: 159,
    episodeTitle: "Expanding Consciousness, Embracing Divinity, The Way of the Yogi",
    youtubeUrl: "https://www.youtube.com/watch?v=Un6EvWeigmU",
    timestampSeconds: 995,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "nandhiji-infinite-being",
    text: "We are the infinite, infinite, infinite being having this human experience, which is the power of infinity brought into the finite.",
    speaker: "Nandhiji",
    episodeNumber: 159,
    episodeTitle: "Expanding Consciousness, Embracing Divinity, The Way of the Yogi",
    youtubeUrl: "https://www.youtube.com/watch?v=Un6EvWeigmU",
    timestampSeconds: 1055,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "nandhiji-freedom",
    text: "To be liberated is the ultimate heart’s dream of every human ever born.",
    speaker: "Nandhiji",
    episodeNumber: 159,
    episodeTitle: "Expanding Consciousness, Embracing Divinity, The Way of the Yogi",
    youtubeUrl: "https://www.youtube.com/watch?v=Un6EvWeigmU",
    timestampSeconds: 2219,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "nandhiji-resilience",
    text: "A yogi’s strength is power of focus, passion, and resilience—the power of resilience that no matter how many times we fail, we will bounce back a million times.",
    speaker: "Nandhiji",
    episodeNumber: 159,
    episodeTitle: "Expanding Consciousness, Embracing Divinity, The Way of the Yogi",
    youtubeUrl: "https://www.youtube.com/watch?v=Un6EvWeigmU",
    timestampSeconds: 3434,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "bernard-beitman-meaningful-coincidences",
    text: "What we’re studying is meaningful coincidences—ones that somehow seem to have some meaning to the person who is experiencing them.",
    speaker: "Dr. Bernard Beitman",
    episodeNumber: 158,
    episodeTitle: "Synchronicity, Serendipity, Meaningful Coincidence",
    youtubeUrl: "https://www.youtube.com/watch?v=E8GIE6VKLJM",
    timestampSeconds: 242,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "bernard-beitman-clues",
    text: "Why are we here? What’s going on around here? How did we get here? What is my purpose in life? Why are human beings around here? Well, coincidences give us clues to all of those.",
    speaker: "Dr. Bernard Beitman",
    episodeNumber: 158,
    episodeTitle: "Synchronicity, Serendipity, Meaningful Coincidence",
    youtubeUrl: "https://www.youtube.com/watch?v=E8GIE6VKLJM",
    timestampSeconds: 502,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "bernard-beitman-connected",
    text: "People are connected. Perhaps everything is connected.",
    speaker: "Dr. Bernard Beitman",
    episodeNumber: 158,
    episodeTitle: "Synchronicity, Serendipity, Meaningful Coincidence",
    youtubeUrl: "https://www.youtube.com/watch?v=E8GIE6VKLJM",
    timestampSeconds: 767,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "bernard-beitman-quotidian",
    text: "Tear the web of quotidian reality and coincidences fly in.",
    speaker: "Dr. Bernard Beitman",
    episodeNumber: 158,
    episodeTitle: "Synchronicity, Serendipity, Meaningful Coincidence",
    youtubeUrl: "https://www.youtube.com/watch?v=E8GIE6VKLJM",
    timestampSeconds: 1659,
    transcriptSource: "local-audio-transcription",
  },
  {
    id: "bernard-beitman-keep-looking",
    text: "Keep moving, keep looking, keep imagining, because what you are needing can show up—and you have to be ready to look at it and seize it.",
    speaker: "Dr. Bernard Beitman",
    episodeNumber: 158,
    episodeTitle: "Synchronicity, Serendipity, Meaningful Coincidence",
    youtubeUrl: "https://www.youtube.com/watch?v=E8GIE6VKLJM",
    timestampSeconds: 4087,
    transcriptSource: "local-audio-transcription",
  },
];

export function timestampedYouTubeUrl(quote: Quote) {
  if (quote.youtubeUrl && quote.timestampSeconds !== null) {
    return `${quote.youtubeUrl}&t=${quote.timestampSeconds}s`;
  }
  return quote.transcriptUrl ?? quote.episodeUrl ?? "#";
}

export function formatTimestamp(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .filter((_, index) => hours > 0 || index > 0)
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}
