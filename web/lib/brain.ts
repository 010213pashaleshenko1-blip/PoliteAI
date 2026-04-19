import { normalizePrompt, tokenizePrompt } from "./tokenizer";

export interface BrainResult {
  normalizedPrompt: string;
  tokens: ReturnType<typeof tokenizePrompt>;
  detectedIntent: string | null;
  detectedTargetSlug: string | null;
  detectedStyle: string | null;
  detectedLabels: boolean;
  detectedWater: boolean;
  detectedVariation: number;
  brainScore: number;
  intelligence: number;
}

function pickTopToken(tokens: ReturnType<typeof tokenizePrompt>, category: string) {
  const found = tokens
    .filter((token) => token.category === category)
    .sort((a, b) => b.weight - a.weight);

  return found[0] || null;
}

export function runBrain(prompt: string, withWater?: boolean): BrainResult {
  const tokens = tokenizePrompt(prompt);
  const normalizedPrompt = normalizePrompt(prompt);

  const target = pickTopToken(tokens, "target");
  const style = pickTopToken(tokens, "style");
  const intentToken = pickTopToken(tokens, "intent");

  const labels = tokens.some((t) => t.category === "labels");
  const waterToken = tokens.some((t) => t.category === "water");
  const qualityToken = tokens.some((t) => t.category === "quality");
  const brainToken = tokens.some((t) => t.category === "brain");

  const totalWeight = tokens.reduce((sum, token) => sum + token.weight, 0);
  const intelligence = Math.min(1, 0.45 + totalWeight / 18 + (brainToken ? 0.1 : 0) + (qualityToken ? 0.08 : 0));
  const brainScore = Math.min(1, 0.35 + totalWeight / 20 + (target ? 0.2 : 0) + (intentToken ? 0.15 : 0));

  let detectedIntent: string | null = null;
  if (intentToken) detectedIntent = "political_map";

  let detectedVariation = 0.45 + intelligence * 0.2;
  if (/слегк|чуть|немного/i.test(prompt)) detectedVariation = 0.28;
  if (/сильно|очень|жестко/i.test(prompt)) detectedVariation = 0.85;

  return {
    normalizedPrompt,
    tokens,
    detectedIntent,
    detectedTargetSlug: target?.normalized || null,
    detectedStyle: style?.normalized || "minimal",
    detectedLabels: labels,
    detectedWater: typeof withWater === "boolean" ? withWater : waterToken,
    detectedVariation,
    brainScore,
    intelligence
  };
}
