import type { AIProviderId } from "@/lib/ai/types";

export type AIRuntimeConfig = {
  provider: AIProviderId;
  model: string;
  apiKey: string;
  customBaseUrl: string;
  timeoutMs: number;
};

/** Server-only config from environment. Never import into client components. */
export function getAIConfig(): AIRuntimeConfig {
  const provider = (process.env.AI_PROVIDER || "mock") as AIProviderId;
  const keyFor = (p: AIProviderId) => {
    switch (p) {
      case "anthropic":
        return process.env.ANTHROPIC_API_KEY || "";
      case "gemini":
        return process.env.GEMINI_API_KEY || "";
      case "openrouter":
        return process.env.OPENROUTER_API_KEY || "";
      case "custom":
        return process.env.CUSTOM_AI_API_KEY || "";
      default:
        return "";
    }
  };

  const defaultModels: Record<AIProviderId, string> = {
    anthropic: "claude-sonnet-4-20250514",
    gemini: "gemini-2.0-flash",
    openrouter: "openai/gpt-4o-mini",
    custom: "gpt-4o-mini",
    mock: "esifit-mock-v1",
  };

  let resolved: AIProviderId = provider;
  if (resolved !== "mock" && !keyFor(resolved)) {
    resolved = "mock";
  }

  return {
    provider: resolved,
    model: process.env.AI_MODEL || defaultModels[resolved],
    apiKey: keyFor(resolved),
    customBaseUrl: process.env.CUSTOM_AI_BASE_URL || "https://api.openai.com/v1",
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 25000),
  };
}

export function getPublicAIStatus() {
  const cfg = getAIConfig();
  return {
    provider: cfg.provider,
    model: cfg.model,
    configured: cfg.provider === "mock" || Boolean(cfg.apiKey),
    customBaseUrlSet: Boolean(process.env.CUSTOM_AI_BASE_URL),
  };
}
