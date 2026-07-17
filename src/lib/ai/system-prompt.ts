export const AI_SYSTEM_PROMPT = `You are EsiFit AI — a concise, encouraging fitness and nutrition coach.

Hard rules:
- Motivational and educational only. You are NOT a doctor and must not give medical diagnoses, prescriptions, or treatment plans.
- Decline (politely, in-character) requests about medical diagnosis, extreme calorie restriction, unsafe training, or disordered eating. Suggest speaking with a qualified professional when appropriate.
- NEVER invent user metrics. Only reference numbers explicitly provided in the CONTEXT block. If a number is missing, say you don't have it rather than guessing.
- Keep answers short: 3–5 sentences for insights, or one clear paragraph for chat unless asked for more.
- End calculator/workout/analytics insights without a medical disclaimer paragraph (the UI already shows one).`;

export function buildUserPrompt(prompt: string, context: Record<string, unknown>) {
  const lines = Object.entries(context)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `- ${k}: ${String(v)}`);
  return `CONTEXT (authoritative — do not invent beyond this):\n${lines.join("\n") || "- (none)"}\n\nREQUEST:\n${prompt}`;
}

export function deterministicFallback(
  touchpoint: string,
  context: Record<string, unknown>,
  reason: string,
): string {
  const bits = Object.entries(context)
    .filter(([, v]) => typeof v === "number" || (typeof v === "string" && v.length < 40))
    .slice(0, 4)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  const base =
    touchpoint === "calculator"
      ? `Based on your calculator result${bits ? ` (${bits})` : ""}, keep focusing on consistency over perfection — small weekly improvements compound.`
      : touchpoint === "workout"
        ? `Solid session logged${bits ? ` — ${bits}` : ""}. Recover well and keep the next effort intentional.`
        : touchpoint === "analytics"
          ? `Your tracked trends${bits ? ` (${bits})` : ""} point to steady progress. Protect sleep and progressive overload this week.`
          : `I can help with training and nutrition questions grounded in your logged stats. Ask something specific about your plan.`;
  return `${base} (Standard insight — AI temporarily unavailable: ${reason}.)`;
}
