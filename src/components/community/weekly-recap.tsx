"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_RECAP_PRIVACY, type RecapPrivacy } from "@/lib/mock/growth";
import { useGamificationStore } from "@/stores/gamification-store";
import { useFeatureFlag } from "@/lib/feature-flags";

export function WeeklyRecapView() {
  const enabled = useFeatureFlag("WEEKLY_RECAP");
  const { level, xpIntoLevel } = useGamificationStore((s) => s.getLevelInfo());
  const totalXp = useGamificationStore((s) => s.totalXp);
  const [privacy, setPrivacy] = useState<RecapPrivacy>(DEFAULT_RECAP_PRIVACY);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!enabled) {
    return <p className="type-body-md text-[var(--foreground-muted)]">Weekly recap is disabled.</p>;
  }

  const stats = {
    streak: 6,
    workouts: 4,
    volume: 18420,
    xp: totalXp,
    bodyFat: 18.4,
  };

  async function download() {
    const node = cardRef.current;
    if (!node) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "esifit-weekly-recap.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Recap image downloaded");
      });
    } catch {
      toast.error("Could not render recap image");
    }
  }

  const ogParams = new URLSearchParams({
    streak: privacy.includeStreak ? String(stats.streak) : "",
    workouts: privacy.includeWorkouts ? String(stats.workouts) : "",
    volume: privacy.includeVolume ? String(stats.volume) : "",
    xp: privacy.includeXp ? String(stats.xp) : "",
    bf: privacy.includeBodyFat ? String(stats.bodyFat) : "",
    level: String(level),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <GlassCard className="p-5">
        <h2 className="type-h3">Share preferences</h2>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
          Defaults exclude sensitive body metrics. Opt in only to what you want public.
        </p>
        <div className="mt-4 space-y-3">
          {(
            [
              ["includeStreak", "Workout streak"],
              ["includeWorkouts", "Sessions this week"],
              ["includeVolume", "Training volume"],
              ["includeXp", "XP total"],
              ["includeBodyFat", "Body fat % (sensitive)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 type-body-sm">
              <input
                type="checkbox"
                checked={privacy[key]}
                onChange={(e) => setPrivacy((p) => ({ ...p, [key]: e.target.checked }))}
                className="accent-[var(--mint)]"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => void download()}>Download image</Button>
          <Button variant="secondary" asChild>
            <a href={`/api/og/recap?${ogParams.toString()}`} target="_blank" rel="noreferrer">
              Open OG preview
            </a>
          </Button>
        </div>
      </GlassCard>

      <div ref={cardRef}>
        <GlassCard className="overflow-hidden bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--mint-dim)] p-6">
          <p className="type-caption font-semibold uppercase tracking-[0.16em] text-[var(--mint)]">EsiFit Weekly Recap</p>
          <h2 className="type-h2 mt-3">Your week, wrapped</h2>
          <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">Level {level} · {xpIntoLevel} XP into next</p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {privacy.includeStreak ? <Stat label="Streak" value={`${stats.streak} days`} /> : null}
            {privacy.includeWorkouts ? <Stat label="Workouts" value={`${stats.workouts}`} /> : null}
            {privacy.includeVolume ? <Stat label="Volume" value={`${stats.volume.toLocaleString()} kg`} /> : null}
            {privacy.includeXp ? <Stat label="XP" value={stats.xp.toLocaleString()} /> : null}
            {privacy.includeBodyFat ? <Stat label="Body fat" value={`${stats.bodyFat}%`} /> : null}
          </dl>
          <p className="type-caption mt-6 text-[var(--foreground-subtle)]">Highlight: new squat PR this week</p>
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-0)]/50 p-3">
      <dt className="type-caption text-[var(--foreground-subtle)]">{label}</dt>
      <dd className="type-data-md mt-1">{value}</dd>
    </div>
  );
}
