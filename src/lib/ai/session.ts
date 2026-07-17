import { z } from "zod";
import type { UserTier } from "@/lib/types";

const tiers = ["free", "vip", "vip-plus", "coach", "admin", "super-admin"] as const;

export type MockSession = {
  userId: string;
  tier: UserTier;
  expiresAt: number;
};

export function readMockSession(req: Request): MockSession | null {
  const userId = req.headers.get("x-esifit-user-id");
  const tier = req.headers.get("x-esifit-user-tier") as UserTier | null;
  const expiresAt = Number(req.headers.get("x-esifit-expires-at") || 0);
  if (!userId || !tier || !tiers.includes(tier as (typeof tiers)[number])) return null;
  if (!expiresAt || expiresAt < Date.now()) return null;
  return { userId, tier, expiresAt };
}

export const generateBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  touchpoint: z.enum(["calculator", "workout", "analytics", "chat"]),
  context: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
  stream: z.boolean().optional(),
});
