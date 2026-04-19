const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey)
  };
}

export async function insertBrainMemory(payload: {
  prompt: string;
  normalizedPrompt: string;
  detectedIntent: string | null;
  detectedTargetSlug: string | null;
  detectedStyle: string | null;
  detectedLabels: boolean;
  detectedWater: boolean;
  detectedVariation: number;
  brainScore: number;
  tokenCount: number;
  generatorMode: string;
}) {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return { ok: false, skipped: true, reason: "Supabase env is not configured" };
  }

  const res = await fetch(`${url}/rest/v1/ai_requests`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      prompt: payload.prompt,
      normalized_prompt: payload.normalizedPrompt,
      detected_intent: payload.detectedIntent,
      detected_target_slug: payload.detectedTargetSlug,
      detected_style: payload.detectedStyle,
      detected_labels: payload.detectedLabels,
      detected_water: payload.detectedWater,
      detected_variation: payload.detectedVariation,
      brain_score: payload.brainScore,
      token_count: payload.tokenCount,
      generator_mode: payload.generatorMode,
      status: "completed"
    })
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, skipped: false, reason: text };
  }

  const data = await res.json();
  return { ok: true, data };
}
