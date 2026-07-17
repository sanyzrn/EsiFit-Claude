import { describe, expect, it } from "vitest";
import { sanitizeUserText, validateImageFile } from "@/lib/sanitize";
import { levelFromTotalXp, xpRequiredForLevel } from "@/lib/gamification/levels";

describe("sanitizeUserText", () => {
  it("strips script tags and control characters", () => {
    expect(sanitizeUserText('<script>alert(1)</script>Hello')).toBe("Hello");
    expect(sanitizeUserText("javascript:alert(1)")).toBe("alert(1)");
  });

  it("enforces max length", () => {
    expect(sanitizeUserText("abcdefghij", 5)).toBe("abcde");
  });
});

describe("validateImageFile", () => {
  it("rejects wrong type and oversized files", () => {
    const bad = new File(["x"], "x.txt", { type: "text/plain" });
    expect(validateImageFile(bad).ok).toBe(false);
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "x.png", { type: "image/png" });
    expect(validateImageFile(big).ok).toBe(false);
  });
});

describe("levelFromTotalXp", () => {
  it("starts at level 1 with zero xp", () => {
    expect(levelFromTotalXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpToNext: 100 });
  });

  it("levels up when threshold crossed", () => {
    const need = xpRequiredForLevel(1);
    const r = levelFromTotalXp(need);
    expect(r.level).toBe(2);
    expect(r.xpIntoLevel).toBe(0);
  });
});
