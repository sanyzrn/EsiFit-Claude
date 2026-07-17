"use client";

import { useState } from "react";
import { getSeedDataset } from "@/lib/mock/seed";
import { AnatomyBodyMap } from "@/components/anatomy/anatomy-body-map";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui-extended/animated-metrics";
import { TransformationSlider } from "@/components/landing/sections";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  chartTheme,
  ChartTooltipStyle,
} from "@/lib/charts/theme";
import { isFeatureEnabled } from "@/lib/feature-flags";

function ActivityHeatmap({ values }: { values: { date: string; count: number }[] }) {
  const max = Math.max(...values.map((v) => v.count), 1);
  return (
    <div className="grid grid-cols-7 gap-1 sm:grid-cols-10 md:grid-cols-15" role="img" aria-label="Workout activity heatmap">
      {values.map((v) => {
        const t = v.count / max;
        return (
          <div
            key={v.date}
            title={`${v.date}: ${v.count} workout(s)`}
            className="aspect-square rounded-[3px]"
            style={{
              background:
                t === 0
                  ? "var(--surface-3)"
                  : `color-mix(in srgb, var(--mint) ${Math.round(25 + t * 75)}%, var(--surface-3))`,
            }}
          />
        );
      })}
    </div>
  );
}

export function AnalyticsPage() {
  const seed = getSeedDataset();
  const [range, setRange] = useState<"30" | "45">("30");
  const days = range === "30" ? 30 : 45;

  const weight = seed.weight.slice(-days);
  const bodyFat = seed.bodyFat.slice(-days);
  const sleep = seed.sleep.slice(-days);

  const sleepAvgRecent = sleep.slice(-14).reduce((a, b) => a + b.hours, 0) / 14;
  const prevSlice = sleep.slice(-28, -14);
  const sleepAvgPrev = prevSlice.reduce((a, b) => a + b.hours, 0) / Math.max(1, prevSlice.length);
  const sleepDelta = ((sleepAvgRecent - sleepAvgPrev) / Math.max(0.1, sleepAvgPrev)) * 100;
  const weightDelta = (weight.at(-1)?.kg ?? 0) - (weight[0]?.kg ?? 0);
  const workouts = seed.workouts.filter((w) => w.date >= (weight[0]?.date ?? "")).length;
  const insights = [
    sleepDelta >= 0
      ? `Your average sleep improved ${Math.abs(sleepDelta).toFixed(0)}% vs the prior fortnight.`
      : `Sleep dipped ${Math.abs(sleepDelta).toFixed(0)}% vs the prior fortnight — protect wind-down.`,
    weightDelta <= 0
      ? `Weight trend ${weightDelta.toFixed(1)} kg over the selected range.`
      : `Weight up ${weightDelta.toFixed(1)} kg over the selected range — check fueling vs training load.`,
    `You logged ${workouts} workouts in this window — consistency over perfection.`,
  ];

  const radar = (["chest", "back", "legs", "shoulders", "arms", "core"] as const).map((g) => {
    const map: Record<string, number> = {
      chest: (seed.muscleVolume.chest ?? 0) * 100,
      back: ((seed.muscleVolume.lats ?? 0) + (seed.muscleVolume.traps ?? 0)) * 50,
      legs: ((seed.muscleVolume.quads ?? 0) + (seed.muscleVolume.hamstrings ?? 0) + (seed.muscleVolume.glutes ?? 0)) * 33,
      shoulders: (seed.muscleVolume.shoulders ?? 0) * 100,
      arms: ((seed.muscleVolume.biceps ?? 0) + (seed.muscleVolume.triceps ?? 0)) * 50,
      core: ((seed.muscleVolume.abs ?? 0) + (seed.muscleVolume.obliques ?? 0)) * 50,
    };
    return { metric: g, value: Math.round(map[g] ?? 0) };
  });

  const countByDate = new Map<string, number>();
  for (const w of seed.workouts) countByDate.set(w.date, (countByDate.get(w.date) ?? 0) + 1);
  const heatmap = seed.weight.slice(-70).map((d) => ({ date: d.date, count: countByDate.get(d.date) ?? 0 }));

  const pts = weight.slice(-14);
  const first = pts[0]?.kg ?? 0;
  const last = pts.at(-1)?.kg ?? 0;
  const slope = pts.length > 1 ? (last - first) / (pts.length - 1) : 0;
  const projection = Array.from({ length: 15 }, (_, i) => ({
    i,
    actual: i < pts.length ? pts[i]!.kg : undefined,
    projected: last + slope * Math.max(0, i - (pts.length - 1)),
    low: last + slope * Math.max(0, i - (pts.length - 1)) - 0.4,
    high: last + slope * Math.max(0, i - (pts.length - 1)) + 0.4,
  }));

  if (!isFeatureEnabled("ANALYTICS")) {
    return <p className="type-body-md">Analytics are disabled.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Analytics</p>
          <h1 className="type-h2 mt-1">Progress that tells a story</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={range === "30" ? "primary" : "secondary"} onClick={() => setRange("30")}>
            30 days
          </Button>
          <Button size="sm" variant={range === "45" ? "primary" : "secondary"} onClick={() => setRange("45")}>
            45 days
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="type-caption text-[var(--foreground-subtle)]">Latest weight</p>
          <p className="type-data-lg mt-1">
            <AnimatedCounter value={weight.at(-1)?.kg ?? 0} decimals={1} /> kg
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="type-caption text-[var(--foreground-subtle)]">Body fat</p>
          <p className="type-data-lg mt-1">
            <AnimatedCounter value={bodyFat.at(-1)?.percent ?? 0} decimals={1} suffix="%" />
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="type-caption text-[var(--foreground-subtle)]">Avg sleep (7d)</p>
          <p className="type-data-lg mt-1">
            <AnimatedCounter
              value={sleep.slice(-7).reduce((a, b) => a + b.hours, 0) / Math.max(1, sleep.slice(-7).length)}
              decimals={1}
            />{" "}
            h
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-4">
          <h2 className="type-h4 mb-3">Weight trend</h2>
          <div className="h-56">
            {weight.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weight}>
                  <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={["auto", "auto"]} stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
                  <Tooltip contentStyle={ChartTooltipStyle()} />
                  <Area type="monotone" dataKey="kg" stroke={chartTheme.mint} fill="var(--mint-dim)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center type-body-sm text-[var(--foreground-muted)]">Not enough data yet.</p>
            )}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <h2 className="type-h4 mb-3">Body fat</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyFat}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={["auto", "auto"]} stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
                <Tooltip contentStyle={ChartTooltipStyle()} />
                <Line type="monotone" dataKey="percent" stroke={chartTheme.gold} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-4">
          <h2 className="type-h4 mb-3">Strength balance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: chartTheme.axis, fontSize: 12 }} />
                <Radar dataKey="value" stroke={chartTheme.plasma} fill={chartTheme.plasma} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <h2 className="type-h4 mb-2">Workout consistency</h2>
          <p className="type-caption mb-4 text-[var(--foreground-muted)]">GitHub-style activity heatmap</p>
          <ActivityHeatmap values={heatmap} />
        </GlassCard>
      </div>

      {isFeatureEnabled("MUSCLE_HEATMAP") ? (
        <GlassCard className="p-5">
          <h2 className="type-h4">Muscle volume heatmap</h2>
          <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
            Intensity encodes relative training volume — neglected vs overloaded groups at a glance.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
            <AnatomyBodyMap view="front" intensityMap={seed.muscleVolume} title="Front muscle volume" />
            <AnatomyBodyMap view="back" intensityMap={seed.muscleVolume} title="Back muscle volume" />
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="p-4">
        <h2 className="type-h4 mb-3">Goal projection</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
              <XAxis dataKey="i" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <Tooltip contentStyle={ChartTooltipStyle()} />
              <Area type="monotone" dataKey="high" stroke="transparent" fill="var(--plasma-dim)" />
              <Area type="monotone" dataKey="low" stroke="transparent" fill="var(--surface-0)" />
              <Line type="monotone" dataKey="projected" stroke={chartTheme.plasma} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="actual" stroke={chartTheme.mint} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="type-h4">Plain-language insights</h2>
        <ul className="mt-4 space-y-2">
          {insights.map((t) => (
            <li key={t} className="type-body-sm text-[var(--foreground-muted)]">
              • {t}
            </li>
          ))}
        </ul>
      </GlassCard>

      <div>
        <h2 className="type-h3 mb-4">Before / after gallery</h2>
        <TransformationSlider />
      </div>
    </div>
  );
}
