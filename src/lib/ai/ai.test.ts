import { describe, expect, it } from "vitest";
import { quotaForTier, DAILY_AI_QUOTA } from "@/lib/ai/quota";
import { deterministicFallback, buildUserPrompt } from "@/lib/ai/system-prompt";
import { mockAdapter } from "@/lib/ai/adapters";

describe("AI quota", () => {
  it("gives free less than vip", () => {
    expect(quotaForTier("free")).toBe(DAILY_AI_QUOTA.free);
    expect(quotaForTier("vip")).toBeGreaterThan(quotaForTier("free"));
    expect(quotaForTier("vip-plus")).toBeGreaterThan(quotaForTier("vip"));
  });
});

describe("AI prompts", () => {
  it("embeds context without inventing keys", () => {
    const p = buildUserPrompt("Explain BMI", { bmi: 22.4, band: "healthy" });
    expect(p).toContain("bmi: 22.4");
    expect(p).toContain("Explain BMI");
  });

  it("fallback references provided context", () => {
    const text = deterministicFallback("calculator", { value: 22.4, unit: "BMI" }, "timeout");
    expect(text).toContain("22.4");
    expect(text).toContain("timeout");
  });
});

describe("mock adapter", () => {
  it("returns grounded text", async () => {
    const r = await mockAdapter.generate({
      system: "sys",
      user: "CONTEXT\n- value: 80\n\nREQUEST:\nSummarize",
      model: "mock",
    });
    expect(r.text.length).toBeGreaterThan(20);
    expect(r.promptTokens).toBeGreaterThan(0);
  });
});
