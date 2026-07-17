"use client";

import Link from "next/link";
import { AnimatedCounter, RadialProgress } from "@/components/ui-extended/animated-metrics";
import { Sparkline } from "@/components/dashboard/sparkline";
import { WidgetShell } from "@/components/dashboard/widgets/widget-shell";
import type { WidgetProps } from "@/components/dashboard/widgets/types";
import type { DashboardData, Goal, Milestone, ActivityEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";

type Common = WidgetProps<DashboardData> & {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

export function ProgressScoreWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell title="Progress Score" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps} className="min-h-[280px]">
      <div className="flex flex-col items-center justify-center gap-3 py-2">
        <RadialProgress value={data?.progressScore ?? 0} size="hero" label="overall" />
        <p className="type-body-sm text-center text-[var(--foreground-muted)]">Cumulative clarity across training, recovery, and consistency.</p>
      </div>
    </WidgetShell>
  );
}

export function ReadinessWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell title="Daily Readiness" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps} className="min-h-[280px]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <RadialProgress value={data?.readinessScore ?? 0} size="lg" label={data?.readinessLabel} />
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[var(--glow-mint)] opacity-40" aria-hidden />
        </div>
        <p className="type-body-sm text-center text-[var(--foreground-muted)]">{data?.readinessRecommendation}</p>
      </div>
    </WidgetShell>
  );
}

export function TodayWorkoutWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const w = data?.todayWorkout;
  return (
    <WidgetShell
      title="Today's Workout"
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!w}
      emptyMessage="No workout scheduled — rest is productive too."
      dragHandleProps={dragHandleProps}
    >
      {w ? (
        <div className="flex items-center gap-4">
          <RadialProgress value={w.progressPercent} size="md" />
          <div>
            <p className="type-h4">{w.name}</p>
            <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">
              {w.durationMin} min · {w.exerciseCount} movements
            </p>
            <p className="type-caption mt-2 text-[var(--mint)]">Next: {w.nextExercise}</p>
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}

export function NutritionWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const n = data?.nutrition;
  return (
    <WidgetShell title="Nutrition" loading={loading} error={error} onRetry={onRetry} empty={!n} dragHandleProps={dragHandleProps}>
      {n ? (
        <div>
          <p className="type-data-md">
            <AnimatedCounter value={n.calorieTarget - n.calories} />{" "}
            <span className="type-caption text-[var(--foreground-muted)]">kcal left</span>
          </p>
          <div className="mt-4 flex justify-between gap-2">
            <MacroRing label="P" value={(n.protein_g / n.proteinTarget) * 100} detail={`${n.protein_g}g`} />
            <MacroRing label="C" value={(n.carbs_g / n.carbsTarget) * 100} detail={`${n.carbs_g}g`} />
            <MacroRing label="F" value={(n.fat_g / n.fatTarget) * 100} detail={`${n.fat_g}g`} />
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}

function MacroRing({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <RadialProgress value={Math.min(100, value)} size="sm" />
      <span className="type-caption font-semibold">{label}</span>
      <span className="type-data-sm text-[var(--foreground-muted)]">{detail}</span>
    </div>
  );
}

export function WaterWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const pct = Math.min(100, ((data?.waterMl ?? 0) / (data?.waterTargetMl || 1)) * 100);
  return (
    <WidgetShell title="Water" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-16 overflow-hidden rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)]">
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--plasma)] to-[var(--mint)] transition-all duration-[var(--duration-smooth)]"
            style={{ height: `${pct}%` }}
          />
        </div>
        <div>
          <p className="type-data-md">
            <AnimatedCounter value={data?.waterMl ?? 0} /> ml
          </p>
          <p className="type-caption mt-1 text-[var(--foreground-muted)]">of {data?.waterTargetMl ?? 0} ml</p>
        </div>
      </div>
    </WidgetShell>
  );
}

export function SleepWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell title="Sleep" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <p className="type-data-md">
        <AnimatedCounter value={data?.sleepHours ?? 0} decimals={1} /> h
      </p>
      <p className="type-caption mt-1 text-[var(--foreground-muted)]">Last night</p>
      <div className="mt-4">
        <Sparkline values={data?.sleepTrend ?? []} stroke="var(--plasma)" />
      </div>
    </WidgetShell>
  );
}

export function WeightWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell title="Weight" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <p className="type-data-md">
        <AnimatedCounter value={data?.weightKg ?? 0} decimals={1} /> kg
      </p>
      <div className="mt-4">
        <Sparkline values={data?.weightTrend ?? []} />
      </div>
    </WidgetShell>
  );
}

export function BodyFatWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell title="Body fat %" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <p className="type-data-md">
        <AnimatedCounter value={data?.bodyFatPercent ?? 0} decimals={1} suffix="%" />
      </p>
      <div className="mt-4">
        <Sparkline values={data?.bodyFatTrend ?? []} stroke="var(--gold)" />
      </div>
    </WidgetShell>
  );
}

export function XpWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const xp = data?.xp ?? 0;
  const next = data?.xpToNext ?? 1;
  const pct = Math.min(100, (xp / next) * 100);
  return (
    <WidgetShell title="XP / Level" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <p className="type-h4">Level {data?.level ?? 0}</p>
      <p className="type-data-sm mt-1 text-[var(--foreground-muted)]">
        {xp} / {next} XP
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--plasma)]" style={{ width: `${pct}%` }} />
      </div>
    </WidgetShell>
  );
}

export function StreakWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell title="Streak" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mint-dim)] shadow-[var(--glow-mint)]">
          <span className="type-data-md text-[var(--mint)]">{data?.streakDays ?? 0}</span>
        </div>
        <div>
          <p className="type-h4">Day streak</p>
          <p className="type-body-sm text-[var(--foreground-muted)]">Consistency glow — keep showing up.</p>
        </div>
      </div>
    </WidgetShell>
  );
}

export function GoalsWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const goals = data?.goals ?? [];
  return (
    <WidgetShell title="Goals" loading={loading} error={error} onRetry={onRetry} empty={!goals.length} dragHandleProps={dragHandleProps}>
      <ul className="space-y-4">
        {goals.map((g: Goal) => {
          const pct = Math.min(100, (g.current_value / g.target_value) * 100);
          return (
            <li key={g.id}>
              <div className="flex justify-between type-body-sm">
                <span className="font-semibold capitalize">{g.type.replaceAll("_", " ")}</span>
                <span className="type-data-sm text-[var(--foreground-muted)]">
                  {g.current_value}/{g.target_value}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div className="h-full rounded-full bg-[var(--mint)]" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

export function WeeklyWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const bars = data?.weeklyActivity ?? [];
  const max = Math.max(...bars, 1);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <WidgetShell title="Weekly overview" loading={loading} error={error} onRetry={onRetry} dragHandleProps={dragHandleProps}>
      <div className="flex h-32 items-end gap-2">
        {bars.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-[var(--radius-sm)] bg-gradient-to-t from-[var(--plasma)] to-[var(--mint)]" style={{ height: `${(v / max) * 100}%` }} />
            <span className="type-caption text-[var(--foreground-subtle)]">{labels[i]}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function TimelineWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const items = data?.timeline ?? [];
  return (
    <WidgetShell title="Activity" loading={loading} error={error} onRetry={onRetry} empty={!items.length} dragHandleProps={dragHandleProps}>
      <ol className="space-y-4 border-l border-[var(--surface-glass-border)] pl-4">
        {items.map((a: ActivityEvent) => (
          <li key={a.id} className="relative">
            <span className="absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full bg-[var(--mint)]" />
            <p className="type-body-sm font-semibold">{a.title}</p>
            <p className="type-caption text-[var(--foreground-muted)]">{a.detail}</p>
          </li>
        ))}
      </ol>
    </WidgetShell>
  );
}

export function MilestonesWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  const items = data?.milestones ?? [];
  return (
    <WidgetShell title="Upcoming milestones" loading={loading} error={error} onRetry={onRetry} empty={!items.length} dragHandleProps={dragHandleProps}>
      <ul className="space-y-3">
        {items.map((m: Milestone) => (
          <li key={m.id}>
            <div className="flex justify-between gap-2 type-body-sm">
              <span className="font-semibold">{m.title}</span>
              <span className="type-data-sm text-[var(--foreground-muted)]">{m.progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div className="h-full rounded-full bg-[var(--plasma)]" style={{ width: `${m.progress}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

export function CompleteProfileWidget({
  visible,
  dragHandleProps,
}: {
  visible: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  if (!visible) return null;
  return (
    <WidgetShell title="Complete your profile" dragHandleProps={dragHandleProps}>
      <p className="type-body-sm text-[var(--foreground-muted)]">
        A few optional details help personalize workouts and calculators. Skip anything you&apos;re not ready to share.
      </p>
      <Button className="mt-4" size="sm" asChild>
        <Link href="/onboarding">Continue setup</Link>
      </Button>
    </WidgetShell>
  );
}

export function CoachMessagesWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell
      title="Coach messages"
      loading={loading}
      error={error}
      onRetry={onRetry}
      locked={!data?.coachMessagesUnlocked}
      lockReason="VIP+ unlocks coach message previews"
      dragHandleProps={dragHandleProps}
    >
      <p className="type-body-sm text-[var(--foreground-muted)]">“Solid upper push yesterday — keep recovery sleep above 7h tonight.”</p>
    </WidgetShell>
  );
}

export function AnalyticsTeaserWidget({ data, loading, error, onRetry, dragHandleProps }: Common) {
  return (
    <WidgetShell
      title="Advanced analytics"
      loading={loading}
      error={error}
      onRetry={onRetry}
      locked={!data?.analyticsTeaserUnlocked}
      lockReason="VIP unlocks deeper trend analytics"
      dragHandleProps={dragHandleProps}
    >
      <p className="type-body-sm text-[var(--foreground-muted)]">Volume trends and readiness correlations will live here in Phase 3.</p>
      <div className="mt-3">
        <Sparkline values={data?.weeklyActivity ?? []} />
      </div>
    </WidgetShell>
  );
}
