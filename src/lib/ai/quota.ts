import type { UserTier } from "@/lib/types";

/** Daily AI call caps by tier — enforced server-side. */
export const DAILY_AI_QUOTA: Record<UserTier, number> = {
  free: 8,
  vip: 25,
  "vip-plus": 60,
  coach: 200,
  admin: 500,
  "super-admin": 1000,
};

export function quotaForTier(tier: UserTier): number {
  return DAILY_AI_QUOTA[tier] ?? DAILY_AI_QUOTA.free;
}

export function nextResetISO(now = new Date()) {
  const d = new Date(now);
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}
