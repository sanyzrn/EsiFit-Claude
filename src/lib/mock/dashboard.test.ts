import { describe, expect, it } from "vitest";
import { buildDashboardData } from "@/lib/mock/dashboard";
import { createMockUser } from "@/stores/auth-store";

describe("dashboard mock data", () => {
  it("builds 30-day weight history trends via buildDashboardData", () => {
    const user = createMockUser({ email: "t@esifit.app", name: "Test", tier: "vip" });
    const data = buildDashboardData(user);
    expect(data.weightTrend.length).toBeGreaterThanOrEqual(7);
    expect(data.sleepTrend.length).toBe(7);
    expect(data.weeklyActivity).toHaveLength(7);
    expect(data.analyticsTeaserUnlocked).toBe(true);
    expect(data.coachMessagesUnlocked).toBe(false);
  });

  it("unlocks coach messages for VIP+", () => {
    const user = createMockUser({ email: "p@esifit.app", name: "Plus", tier: "vip-plus" });
    const data = buildDashboardData(user);
    expect(data.coachMessagesUnlocked).toBe(true);
  });

  it("locks VIP widgets for Free", () => {
    const user = createMockUser({ email: "f@esifit.app", name: "Free", tier: "free" });
    const data = buildDashboardData(user);
    expect(data.analyticsTeaserUnlocked).toBe(false);
    expect(data.coachMessagesUnlocked).toBe(false);
  });
});
