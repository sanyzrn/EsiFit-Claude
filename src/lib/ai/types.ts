import type { UserTier } from "@/lib/types";

export type AIProviderId = "anthropic" | "gemini" | "openrouter" | "custom" | "mock";

export type AITouchpoint = "calculator" | "workout" | "analytics" | "chat";

export type AIGenerateRequest = {
  prompt: string;
  context: Record<string, string | number | boolean | null | undefined>;
  touchpoint: AITouchpoint;
  stream?: boolean;
};

export type AIGenerateResult = {
  text: string;
  provider: AIProviderId;
  model: string;
  promptTokens: number;
  completionTokens: number;
  degraded: boolean;
  fallbackReason?: string;
};

export type AIUsageLog = {
  id: string;
  userId: string;
  tier: UserTier;
  provider: AIProviderId;
  model: string;
  touchpoint: AITouchpoint;
  promptTokens: number;
  completionTokens: number;
  createdAt: string;
  ok: boolean;
  error?: string;
};

export type AIAdapter = {
  id: AIProviderId;
  generate: (input: {
    system: string;
    user: string;
    model: string;
    signal?: AbortSignal;
  }) => Promise<{ text: string; promptTokens: number; completionTokens: number }>;
  stream?: (input: {
    system: string;
    user: string;
    model: string;
    signal?: AbortSignal;
  }) => AsyncGenerator<string, { promptTokens: number; completionTokens: number }, unknown>;
};

export class AIProviderError extends Error {
  constructor(
    message: string,
    public code: "timeout" | "rate_limit" | "invalid_key" | "model_error" | "config",
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
