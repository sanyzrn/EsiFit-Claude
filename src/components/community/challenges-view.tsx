"use client";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/stores/community-store";

export function ChallengesView() {
  const challenges = useCommunityStore((s) => s.challenges);
  const joinChallenge = useCommunityStore((s) => s.joinChallenge);
  const leaveChallenge = useCommunityStore((s) => s.leaveChallenge);

  if (!challenges.length) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="type-h4">No challenges</p>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">Check back soon for new community goals.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((c) => (
        <GlassCard key={c.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="type-h4">{c.name}</h2>
                <Badge variant="status">{c.status}</Badge>
              </div>
              <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">{c.description}</p>
              <p className="type-caption mt-2 text-[var(--foreground-subtle)]">
                {c.participantCount.toLocaleString()} participants ·{" "}
                {new Date(c.start_date).toLocaleDateString()} → {new Date(c.end_date).toLocaleDateString()}
              </p>
            </div>
            {c.status === "Active" || c.status === "Upcoming" ? (
              c.joined ? (
                <Button size="sm" variant="secondary" onClick={() => leaveChallenge(c.id)}>
                  Leave
                </Button>
              ) : (
                <Button size="sm" onClick={() => joinChallenge(c.id)}>
                  Join
                </Button>
              )
            ) : (
              <Badge variant="free">Ended</Badge>
            )}
          </div>
          {c.leaderboard.length ? (
            <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--surface-glass-border)]">
              <table className="w-full type-body-sm">
                <thead className="bg-[var(--surface-2)] text-left type-caption uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Athlete</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {c.leaderboard.map((row, i) => (
                    <tr
                      key={row.userId}
                      className={row.userId === "u_me" ? "bg-[var(--mint-dim)] font-semibold" : ""}
                    >
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2 type-data-sm">{row.score.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        {row.rankDelta > 0 ? `↑${row.rankDelta}` : row.rankDelta < 0 ? `↓${Math.abs(row.rankDelta)}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </GlassCard>
      ))}
    </div>
  );
}
