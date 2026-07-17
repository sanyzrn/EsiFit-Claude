import { getAIConfig } from "@/lib/ai/config";
import {
  createAnthropicAdapter,
  createCustomAdapter,
  createGeminiAdapter,
  createOpenRouterAdapter,
  mockAdapter,
} from "@/lib/ai/adapters";
import { AI_SYSTEM_PROMPT, buildUserPrompt, deterministicFallback } from "@/lib/ai/system-prompt";
import { appendUsage, checkQuota } from "@/lib/ai/usage-store";
import { nextResetISO } from "@/lib/ai/quota";
import { captureError, logWarn } from "@/lib/ai/logger";
import {
  AIProviderError,
  type AIAdapter,
  type AIGenerateRequest,
  type AIGenerateResult,
} from "@/lib/ai/types";
import type { UserTier } from "@/lib/types";

export function resolveAdapter(): { adapter: AIAdapter; model: string; timeoutMs: number } {
  const cfg = getAIConfig();
  switch (cfg.provider) {
    case "anthropic":
      return { adapter: createAnthropicAdapter(cfg.apiKey), model: cfg.model, timeoutMs: cfg.timeoutMs };
    case "gemini":
      return { adapter: createGeminiAdapter(cfg.apiKey), model: cfg.model, timeoutMs: cfg.timeoutMs };
    case "openrouter":
      return { adapter: createOpenRouterAdapter(cfg.apiKey), model: cfg.model, timeoutMs: cfg.timeoutMs };
    case "custom":
      return {
        adapter: createCustomAdapter(cfg.apiKey, cfg.customBaseUrl),
        model: cfg.model,
        timeoutMs: cfg.timeoutMs,
      };
    default:
      return { adapter: mockAdapter, model: cfg.model, timeoutMs: cfg.timeoutMs };
  }
}

export async function generateAIResponse(opts: {
  userId: string;
  tier: UserTier;
  request: AIGenerateRequest;
}): Promise<AIGenerateResult & { quota?: { used: number; limit: number; resetsAt: string } }> {
  const quota = await checkQuota(opts.userId, opts.tier);
  if (!quota.allowed) {
    const text = deterministicFallback(
      opts.request.touchpoint,
      opts.request.context,
      `daily quota reached (${quota.used}/${quota.limit})`,
    );
    return {
      text,
      provider: "mock",
      model: "quota",
      promptTokens: 0,
      completionTokens: 0,
      degraded: true,
      fallbackReason: `You've used your AI insights for today (${quota.used}/${quota.limit}). Resets at ${nextResetISO()}.`,
      quota: { used: quota.used, limit: quota.limit, resetsAt: nextResetISO() },
    };
  }

  const { adapter, model, timeoutMs } = resolveAdapter();
  const system = AI_SYSTEM_PROMPT;
  const user = buildUserPrompt(opts.request.prompt, opts.request.context);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await adapter.generate({
      system,
      user,
      model,
      signal: controller.signal,
    });
    clearTimeout(timer);
    await appendUsage({
      id: `ai_${Date.now()}`,
      userId: opts.userId,
      tier: opts.tier,
      provider: adapter.id,
      model,
      touchpoint: opts.request.touchpoint,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      createdAt: new Date().toISOString(),
      ok: true,
    });
    return {
      text: result.text.trim(),
      provider: adapter.id,
      model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      degraded: false,
      quota: { used: quota.used + 1, limit: quota.limit, resetsAt: nextResetISO() },
    };
  } catch (error) {
    clearTimeout(timer);
    const code =
      error instanceof AIProviderError
        ? error.code
        : error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : "model_error";
    const reason =
      code === "timeout"
        ? "timeout"
        : code === "rate_limit"
          ? "rate limit"
          : code === "invalid_key"
            ? "invalid key"
            : "provider error";
    logWarn("ai_generate_failed", { code, reason, provider: adapter.id, userId: opts.userId });
    await captureError(error, { touchpoint: opts.request.touchpoint, provider: adapter.id });
    await appendUsage({
      id: `ai_${Date.now()}`,
      userId: opts.userId,
      tier: opts.tier,
      provider: adapter.id,
      model,
      touchpoint: opts.request.touchpoint,
      promptTokens: 0,
      completionTokens: 0,
      createdAt: new Date().toISOString(),
      ok: false,
      error: reason,
    });
    return {
      text: deterministicFallback(opts.request.touchpoint, opts.request.context, reason),
      provider: adapter.id,
      model,
      promptTokens: 0,
      completionTokens: 0,
      degraded: true,
      fallbackReason: reason,
      quota: { used: quota.used, limit: quota.limit, resetsAt: nextResetISO() },
    };
  }
}
