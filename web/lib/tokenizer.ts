export interface BrainToken {
  raw: string;
  normalized: string;
  category: string;
  weight: number;
}

const STOP_WORDS = new Set([
  "и", "с", "на", "в", "по", "для", "the", "a", "an", "of", "to"
]);

const TOKEN_DICTIONARY: Array<{ pattern: RegExp; normalized: string; category: string; weight: number }> = [
  { pattern: /(политическ)/i, normalized: "political", category: "intent", weight: 1.4 },
  { pattern: /(карт)/i, normalized: "map", category: "intent", weight: 1.2 },
  { pattern: /(росси|russia|рф)/i, normalized: "russia", category: "target", weight: 2.0 },
  { pattern: /(казахстан|kazakhstan)/i, normalized: "kazakhstan", category: "target", weight: 1.8 },
  { pattern: /(европ|europe)/i, normalized: "europe", category: "target", weight: 1.7 },
  { pattern: /(ази|asia)/i, normalized: "asia", category: "target", weight: 1.7 },
  { pattern: /(африк|africa)/i, normalized: "africa", category: "target", weight: 1.7 },
  { pattern: /(мир|world)/i, normalized: "world", category: "target", weight: 1.2 },
  { pattern: /(вода|море|океан|water|sea|ocean)/i, normalized: "water", category: "water", weight: 1.5 },
  { pattern: /(подпис|назван|label)/i, normalized: "labels", category: "labels", weight: 1.3 },
  { pattern: /(минимал|minimal)/i, normalized: "minimal", category: "style", weight: 1.2 },
  { pattern: /(атлас|atlas)/i, normalized: "atlas", category: "style", weight: 1.2 },
  { pattern: /(темн|dark)/i, normalized: "dark", category: "style", weight: 1.2 },
  { pattern: /(школь|school)/i, normalized: "school", category: "style", weight: 1.2 },
  { pattern: /(качеств|детал|quality|detail)/i, normalized: "quality", category: "quality", weight: 1.25 },
  { pattern: /(ии|ai|нейрон)/i, normalized: "ai", category: "brain", weight: 1.35 }
];

function normalizeWord(word: string) {
  return word.toLowerCase().trim();
}

export function tokenizePrompt(prompt: string): BrainToken[] {
  const words = prompt
    .split(/[^\p{L}\p{N}_-]+/u)
    .map(normalizeWord)
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word));

  return words.map((word) => {
    const found = TOKEN_DICTIONARY.find((entry) => entry.pattern.test(word));

    if (found) {
      return {
        raw: word,
        normalized: found.normalized,
        category: found.category,
        weight: found.weight
      };
    }

    return {
      raw: word,
      normalized: word,
      category: "generic",
      weight: 0.7
    };
  });
}

export function normalizePrompt(prompt: string) {
  return tokenizePrompt(prompt)
    .map((token) => token.normalized)
    .join(" ");
}
