import { AIProviderError, type AIAdapter } from "@/lib/ai/types";

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export const mockAdapter: AIAdapter = {
  id: "mock",
  async generate({ system, user }) {
    const ctxMatch = user.match(/CONTEXT[\s\S]*?REQUEST:\n([\s\S]*)/);
    const request = (ctxMatch?.[1] || user).trim();
    const numbers = [...user.matchAll(/:\s*(-?\d+(?:\.\d+)?%?)/g)].map((m) => m[1]);
    const grounded = numbers.slice(0, 3).join(", ");
    const text = [
      "Here's a grounded take based only on the stats you provided",
      grounded ? ` (${grounded})` : "",
      ". Stay consistent, prioritize recovery, and adjust one variable at a time. ",
      request.toLowerCase().includes("medical") || request.toLowerCase().includes("diagnos")
        ? "I can't help with medical diagnosis — please talk to a clinician for that."
        : "Keep the next block of training intentional and measurable.",
    ].join("");
    void system;
    return {
      text,
      promptTokens: estimateTokens(system + user),
      completionTokens: estimateTokens(text),
    };
  },
  async *stream(input) {
    const result = await mockAdapter.generate(input);
    const parts = result.text.match(/.{1,24}/g) ?? [result.text];
    for (const p of parts) {
      yield p;
      await new Promise((r) => setTimeout(r, 12));
    }
    return { promptTokens: result.promptTokens, completionTokens: result.completionTokens };
  },
};

export function createAnthropicAdapter(apiKey: string): AIAdapter {
  return {
    id: "anthropic",
    async generate({ system, user, model, signal }) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal,
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 400,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      if (res.status === 401) throw new AIProviderError("Invalid Anthropic API key", "invalid_key");
      if (res.status === 429) throw new AIProviderError("Anthropic rate limit", "rate_limit");
      if (!res.ok) throw new AIProviderError(`Anthropic error ${res.status}`, "model_error");
      const data = (await res.json()) as {
        content?: { type: string; text?: string }[];
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      const text = data.content?.filter((c) => c.type === "text").map((c) => c.text || "").join("\n") || "";
      return {
        text,
        promptTokens: data.usage?.input_tokens ?? estimateTokens(system + user),
        completionTokens: data.usage?.output_tokens ?? estimateTokens(text),
      };
    },
  };
}

export function createGeminiAdapter(apiKey: string): AIAdapter {
  return {
    id: "gemini",
    async generate({ system, user, model, signal }) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
        }),
      });
      if (res.status === 400 || res.status === 403) throw new AIProviderError("Invalid Gemini API key", "invalid_key");
      if (res.status === 429) throw new AIProviderError("Gemini rate limit", "rate_limit");
      if (!res.ok) throw new AIProviderError(`Gemini error ${res.status}`, "model_error");
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      return {
        text,
        promptTokens: data.usageMetadata?.promptTokenCount ?? estimateTokens(system + user),
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? estimateTokens(text),
      };
    },
  };
}

export function createOpenRouterAdapter(apiKey: string): AIAdapter {
  return createOpenAICompatibleAdapter("openrouter", apiKey, "https://openrouter.ai/api/v1");
}

export function createCustomAdapter(apiKey: string, baseUrl: string): AIAdapter {
  return createOpenAICompatibleAdapter("custom", apiKey, baseUrl.replace(/\/$/, ""));
}

function createOpenAICompatibleAdapter(
  id: "openrouter" | "custom",
  apiKey: string,
  baseUrl: string,
): AIAdapter {
  return {
    id,
    async generate({ system, user, model, signal }) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        signal,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
          ...(id === "openrouter"
            ? { "HTTP-Referer": "https://esifit.app", "X-Title": "EsiFit" }
            : {}),
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 400,
        }),
      });
      if (res.status === 401) throw new AIProviderError("Invalid API key", "invalid_key");
      if (res.status === 429) throw new AIProviderError("Rate limit", "rate_limit");
      if (!res.ok) throw new AIProviderError(`Provider error ${res.status}`, "model_error");
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const text = data.choices?.[0]?.message?.content || "";
      return {
        text,
        promptTokens: data.usage?.prompt_tokens ?? estimateTokens(system + user),
        completionTokens: data.usage?.completion_tokens ?? estimateTokens(text),
      };
    },
  };
}
