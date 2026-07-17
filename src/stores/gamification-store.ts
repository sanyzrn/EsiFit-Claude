"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  BADGES,
  UNLOCKABLES,
  buildMissions,
  type BadgeDef,
  type MissionDef,
  type Unlockable,
} from "@/lib/mock/growth";
import { XP_REWARDS, levelFromTotalXp, type XpSource } from "@/lib/gamification/levels";

type MissionProgress = {
  progress: number;
  claimed: boolean;
  status: "Active" | "Completed" | "Claimed" | "Expired";
};

type GamificationState = {
  totalXp: number;
  badgeProgress: Record<string, number>;
  unlockedBadgeIds: string[];
  missionProgress: Record<string, MissionProgress>;
  activeTheme: string;
  activeFrame: string;
  celebration: { kind: "level" | "badge" | "mission" | "pr"; label: string } | null;
  missions: MissionDef[];
  awardXp: (source: XpSource, amount?: number, label?: string) => { leveled: boolean; level: number };
  bumpBadge: (badgeId: string, by?: number) => void;
  bumpMission: (missionId: string, by?: number) => void;
  claimMission: (missionId: string) => void;
  setTheme: (id: string) => void;
  setFrame: (id: string) => void;
  clearCelebration: () => void;
  getLevelInfo: () => ReturnType<typeof levelFromTotalXp>;
  getBadges: () => (BadgeDef & { progress: number; unlocked: boolean })[];
  getUnlockables: () => (Unlockable & { unlocked: boolean; equipped: boolean })[];
};

function initialMissions() {
  const defs = buildMissions();
  const progress: Record<string, MissionProgress> = {};
  for (const m of defs) {
    progress[m.id] = {
      progress: m.id === "m_daily_water" ? 1 : m.id === "m_weekly_sessions" ? 2 : 0,
      claimed: false,
      status: "Active",
    };
  }
  return { defs, progress };
}

const boot = initialMissions();

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXp: 2460,
      badgeProgress: {
        b_streak_7: 6,
        b_streak_30: 6,
        b_vol_10k: 6200,
        b_water_7: 4,
        b_post_1: 0,
        b_level_5: 4,
        b_mission_5: 2,
        b_pr_3: 1,
      },
      unlockedBadgeIds: [],
      missionProgress: boot.progress,
      activeTheme: "graphite",
      activeFrame: "none",
      celebration: null,
      missions: boot.defs,

      getLevelInfo: () => levelFromTotalXp(get().totalXp),

      getBadges: () =>
        BADGES.map((b) => {
          const progress = get().badgeProgress[b.id] ?? 0;
          const unlocked = get().unlockedBadgeIds.includes(b.id) || progress >= b.target;
          return { ...b, progress: Math.min(progress, b.target), unlocked };
        }),

      getUnlockables: () => {
        const { level } = get().getLevelInfo();
        return UNLOCKABLES.map((u) => ({
          ...u,
          unlocked: level >= u.requiredLevel,
          equipped:
            (u.kind === "theme" && get().activeTheme === u.value) ||
            (u.kind === "frame" && get().activeFrame === u.value),
        }));
      },

      awardXp: (source, amount, label) => {
        const gain = amount ?? XP_REWARDS[source];
        const before = levelFromTotalXp(get().totalXp);
        const totalXp = get().totalXp + gain;
        const after = levelFromTotalXp(totalXp);
        const leveled = after.level > before.level;
        set({
          totalXp,
          celebration: leveled
            ? { kind: "level", label: `Level ${after.level}` }
            : get().celebration,
          badgeProgress: {
            ...get().badgeProgress,
            b_level_5: Math.max(get().badgeProgress.b_level_5 ?? 0, after.level),
          },
        });
        toast.success(`+${gain} XP`, { description: label ?? source.replace(/_/g, " ") });
        if (leveled) {
          toast.message(`Level up — you're now level ${after.level}`);
        }
        return { leveled, level: after.level };
      },

      bumpBadge: (badgeId, by = 1) => {
        const def = BADGES.find((b) => b.id === badgeId);
        if (!def) return;
        const next = (get().badgeProgress[badgeId] ?? 0) + by;
        const unlocked = get().unlockedBadgeIds;
        const justUnlocked = next >= def.target && !unlocked.includes(badgeId);
        set({
          badgeProgress: { ...get().badgeProgress, [badgeId]: next },
          unlockedBadgeIds: justUnlocked ? [...unlocked, badgeId] : unlocked,
          celebration: justUnlocked ? { kind: "badge", label: def.name } : get().celebration,
        });
        if (justUnlocked) {
          get().awardXp("badge", undefined, `Badge: ${def.name}`);
        }
      },

      bumpMission: (missionId, by = 1) => {
        const m = get().missions.find((x) => x.id === missionId);
        const cur = get().missionProgress[missionId];
        if (!m || !cur || cur.claimed || cur.status === "Expired") return;
        const progress = Math.min(m.target, cur.progress + by);
        const status = progress >= m.target ? "Completed" : "Active";
        set({
          missionProgress: {
            ...get().missionProgress,
            [missionId]: { ...cur, progress, status },
          },
        });
      },

      claimMission: (missionId) => {
        const m = get().missions.find((x) => x.id === missionId);
        const cur = get().missionProgress[missionId];
        if (!m || !cur || cur.claimed || cur.progress < m.target) return;
        set({
          missionProgress: {
            ...get().missionProgress,
            [missionId]: { ...cur, claimed: true, status: "Claimed" },
          },
          celebration: { kind: "mission", label: m.title },
          badgeProgress: {
            ...get().badgeProgress,
            b_mission_5: (get().badgeProgress.b_mission_5 ?? 0) + 1,
          },
        });
        get().awardXp("mission", m.xpReward, `Mission: ${m.title}`);
        toast.success("Mission reward claimed");
      },

      setTheme: (id) => {
        const u = UNLOCKABLES.find((x) => x.value === id && x.kind === "theme");
        if (!u) return;
        const { level } = get().getLevelInfo();
        if (level < u.requiredLevel) {
          toast.message(`Reach level ${u.requiredLevel} to unlock`);
          return;
        }
        set({ activeTheme: id });
        toast.success(`Theme: ${u.name}`);
      },

      setFrame: (id) => {
        if (id === "none") {
          set({ activeFrame: "none" });
          return;
        }
        const u = UNLOCKABLES.find((x) => x.value === id && x.kind === "frame");
        if (!u) return;
        const { level } = get().getLevelInfo();
        if (level < u.requiredLevel) {
          toast.message(`Reach level ${u.requiredLevel} to unlock`);
          return;
        }
        set({ activeFrame: id });
        toast.success(`Frame: ${u.name}`);
      },

      clearCelebration: () => set({ celebration: null }),
    }),
    { name: "esifit-gamification" },
  ),
);
