/** XP / level math shared by gamification store + dashboard widgets */

export function xpRequiredForLevel(level: number): number {
  // Level 1→2 needs 100, then +50 each level
  return Math.max(100, 100 + (level - 1) * 50);
}

export function levelFromTotalXp(totalXp: number): { level: number; xpIntoLevel: number; xpToNext: number } {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
    if (level > 99) break;
  }
  const need = xpRequiredForLevel(level);
  return { level, xpIntoLevel: remaining, xpToNext: need };
}

export type XpSource =
  | "workout_complete"
  | "streak"
  | "mission"
  | "badge"
  | "challenge"
  | "pr"
  | "manual";

export const XP_REWARDS: Record<XpSource, number> = {
  workout_complete: 40,
  streak: 15,
  mission: 25,
  badge: 50,
  challenge: 30,
  pr: 20,
  manual: 10,
};
