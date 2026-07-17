"use client";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGamificationStore } from "@/stores/gamification-store";

function countdown(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Resetting…";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function MissionsView() {
  const missions = useGamificationStore((s) => s.missions);
  const missionProgress = useGamificationStore((s) => s.missionProgress);
  const claimMission = useGamificationStore((s) => s.claimMission);
  const bumpMission = useGamificationStore((s) => s.bumpMission);

  return (
    <div className="space-y-4">
      {missions.map((m) => {
        const p = missionProgress[m.id] ?? { progress: 0, claimed: false, status: "Active" as const };
        const pct = Math.min(100, (p.progress / m.target) * 100);
        const canClaim = !p.claimed && p.progress >= m.target;
        return (
          <GlassCard key={m.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="type-h4">{m.title}</h2>
                  <Badge variant="status">{m.cadence}</Badge>
                  <Badge variant={p.claimed ? "vip" : "status"}>{p.status}</Badge>
                </div>
                <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">{m.description}</p>
                <p className="type-caption mt-2 text-[var(--foreground-subtle)]">
                  Resets in {countdown(m.resetsAt)} · +{m.xpReward} XP
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => bumpMission(m.id)}>
                  + Progress
                </Button>
                <Button size="sm" disabled={!canClaim} onClick={() => claimMission(m.id)}>
                  {p.claimed ? "Claimed" : "Claim reward"}
                </Button>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div className="h-full bg-[var(--plasma)]" style={{ width: `${pct}%` }} />
            </div>
            <p className="type-caption mt-1 text-[var(--foreground-subtle)]">
              {p.progress}/{m.target}
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
