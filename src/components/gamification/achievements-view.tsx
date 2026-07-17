"use client";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGamificationStore } from "@/stores/gamification-store";

export function AchievementsView() {
  const getLevelInfo = useGamificationStore((s) => s.getLevelInfo);
  const getBadges = useGamificationStore((s) => s.getBadges);
  const getUnlockables = useGamificationStore((s) => s.getUnlockables);
  const awardXp = useGamificationStore((s) => s.awardXp);
  const setTheme = useGamificationStore((s) => s.setTheme);
  const setFrame = useGamificationStore((s) => s.setFrame);
  const { level, xpIntoLevel, xpToNext } = getLevelInfo();
  const badges = getBadges();
  const unlockables = getUnlockables();
  const pct = Math.min(100, (xpIntoLevel / xpToNext) * 100);

  return (
    <div className="space-y-8">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-caption text-[var(--foreground-subtle)]">Level</p>
            <p className="type-h1 mt-1">{level}</p>
            <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
              {xpIntoLevel} / {xpToNext} XP to next level
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => awardXp("manual", 40, "Demo XP boost")}>
            Simulate +40 XP
          </Button>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--plasma)]" style={{ width: `${pct}%` }} />
        </div>
      </GlassCard>

      <section>
        <h2 className="type-h3">Badges</h2>
        <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">Locked, in-progress, and unlocked states.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <GlassCard
              key={b.id}
              className={`p-4 ${b.unlocked ? "shadow-[var(--glow-mint)]" : "opacity-80"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl" aria-hidden>
                  {b.icon}
                </span>
                <Badge variant={b.unlocked ? "vip" : "status"}>{b.unlocked ? "Unlocked" : "Locked"}</Badge>
              </div>
              <h3 className="type-h4 mt-3">{b.name}</h3>
              <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">{b.description}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div
                  className="h-full bg-[var(--mint)]"
                  style={{ width: `${Math.min(100, (b.progress / b.target) * 100)}%` }}
                />
              </div>
              <p className="type-caption mt-1 text-[var(--foreground-subtle)]">
                {b.progress}/{b.target}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <h2 className="type-h3">Unlockables</h2>
        <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">Themes and profile frames tied to level.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unlockables.map((u) => (
            <GlassCard key={u.id} className="p-4">
              <Badge variant="status">{u.kind}</Badge>
              <h3 className="type-h4 mt-2">{u.name}</h3>
              <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">{u.description}</p>
              <p className="type-caption mt-2 text-[var(--foreground-subtle)]">Requires level {u.requiredLevel}</p>
              <Button
                className="mt-3"
                size="sm"
                variant={u.equipped ? "primary" : "secondary"}
                disabled={!u.unlocked}
                onClick={() => (u.kind === "theme" ? setTheme(u.value) : setFrame(u.value))}
              >
                {!u.unlocked ? "Locked" : u.equipped ? "Equipped" : "Equip"}
              </Button>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
