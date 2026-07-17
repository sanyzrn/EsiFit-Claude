"use client";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCommunityStore } from "@/stores/community-store";

export function LeaderboardView() {
  const scope = useCommunityStore((s) => s.leaderboardScope);
  const leaderboard = useCommunityStore((s) => s.leaderboard);
  const setScope = useCommunityStore((s) => s.setLeaderboardScope);
  const me = leaderboard.find((e) => e.isMe);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={scope === "global" ? "primary" : "secondary"} onClick={() => setScope("global")}>
          Global
        </Button>
        <Button size="sm" variant={scope === "friends" ? "primary" : "secondary"} onClick={() => setScope("friends")}>
          Friends
        </Button>
      </div>

      <GlassCard className="overflow-hidden p-0">
        <table className="w-full type-body-sm">
          <thead className="bg-[var(--surface-2)] text-left type-caption uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Athlete</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Δ</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr key={row.userId} className={row.isMe ? "bg-[var(--mint-dim)] font-semibold" : ""}>
                <td className="px-4 py-3">{row.rank}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 type-data-sm">{row.xp.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {row.rankDelta > 0 ? `↑${row.rankDelta}` : row.rankDelta < 0 ? `↓${Math.abs(row.rankDelta)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {me && me.rank > 5 ? (
        <GlassCard className="sticky bottom-4 border-[var(--mint)]/40 bg-[var(--surface-1)] p-4 shadow-[var(--shadow-float)]">
          <p className="type-caption text-[var(--mint)]">Your position</p>
          <p className="type-h4 mt-1">
            #{me.rank} · {me.xp.toLocaleString()} XP{" "}
            <span className="type-body-sm text-[var(--foreground-muted)]">
              ({me.rankDelta > 0 ? `↑${me.rankDelta}` : me.rankDelta < 0 ? `↓${Math.abs(me.rankDelta)}` : "flat"})
            </span>
          </p>
        </GlassCard>
      ) : null}
    </div>
  );
}
