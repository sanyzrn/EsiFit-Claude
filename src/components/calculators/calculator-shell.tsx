"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getCalculator, type CalculatorConfig } from "@/lib/calculators/config";
import type { CalcInputs } from "@/lib/calculators/formulas";
import { RadialProgress, AnimatedCounter } from "@/components/ui-extended/animated-metrics";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useCalculatorHistoryStore } from "@/stores/calculator-history-store";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  chartTheme,
  ChartTooltipStyle,
} from "@/lib/charts/theme";

export function CalculatorShell({ slug }: { slug: string }) {
  const config = getCalculator(slug);
  if (!config) {
    return <p className="type-body-md text-[var(--foreground-muted)]">Calculator not found.</p>;
  }
  return <CalculatorShellInner config={config} />;
}

function CalculatorShellInner({ config }: { config: CalculatorConfig }) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signedIn = !!user && status === "authenticated";
  const addHistory = useCalculatorHistoryStore((s) => s.add);
  const historyAll = useCalculatorHistoryStore((s) => s.entries);
  const history = historyAll.filter((h) => h.calculatorId === config.id);
  const profile = user?.profile;

  const defaults = useMemo(() => {
    const base: CalcInputs = {};
    for (const f of config.fields) base[f.key] = f.defaultValue;
    if (profile?.weightKg && "weightKg" in base) base.weightKg = profile.weightKg;
    if (profile?.heightCm && "heightCm" in base) base.heightCm = profile.heightCm;
    if (profile?.age && "age" in base) base.age = profile.age;
    if (profile?.sex && "sex" in base) base.sex = profile.sex === "female" ? 0 : profile.sex === "male" ? 1 : 0.5;
    return base;
  }, [config.fields, profile]);

  const [inputs, setInputs] = useState<CalcInputs>(defaults);
  const [compareId, setCompareId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => config.compute(inputs), [config, inputs]);
  const compare = history.find((h) => h.id === compareId);

  function setField(key: string, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function saveHistory() {
    if (!signedIn) {
      toast.message("Sign in to save calculator history.");
      return;
    }
    addHistory({ calculatorId: config.id, inputs, result });
    toast.success("Saved to history.");
  }

  async function shareCard() {
    if (!signedIn) {
      toast.message("Sign in to generate a share card.");
      return;
    }
    const node = cardRef.current;
    if (!node) return;
    try {
      const { default: html2canvas } = await import("html2canvas").catch(() => ({ default: null }));
      if (!html2canvas) {
        await navigator.clipboard.writeText(
          `${config.name}: ${result.value} ${result.unit} (${result.band}) — EsiFit`,
        );
        toast.success("Share summary copied to clipboard.");
        return;
      }
      const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `esifit-${config.slug}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Share card downloaded.");
      });
    } catch {
      toast.error("Couldn't create share image.");
    }
  }

  const gaugeValue = Math.min(100, (result.value / config.gaugeMax) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <GlassCard className="p-5 sm:p-6">
        <h1 className="type-h2">{config.name}</h1>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">{config.description}</p>
        <div className="mt-6 space-y-5">
          {config.fields.map((field) => (
            <div key={field.key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor={field.key} className="type-body-sm font-semibold">
                  {field.label}
                </label>
                <span className="type-data-sm text-[var(--mint)]">
                  {inputs[field.key]}
                  {field.unit ? ` ${field.unit}` : ""}
                </span>
              </div>
              <input
                id={field.key}
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={inputs[field.key] ?? field.defaultValue}
                onChange={(e) => setField(field.key, Number(e.target.value))}
                className="w-full accent-[var(--mint)]"
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-4">
        <div ref={cardRef}>
          <GlassCard className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="type-caption text-[var(--foreground-subtle)]">Result</p>
                <p className="type-data-lg mt-1">
                  <AnimatedCounter value={result.value} decimals={result.value % 1 ? 1 : 0} />{" "}
                  <span className="type-body-sm text-[var(--foreground-muted)]">{result.unit}</span>
                </p>
                <Badge variant="status" className="mt-3">
                  {result.band}
                </Badge>
              </div>
              <RadialProgress value={gaugeValue} size="lg" label="scale" />
            </div>
            <p className="type-body-sm mt-4 text-[var(--foreground-muted)]">{result.interpretation}</p>
            {result.secondary ? (
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(result.secondary).map(([k, v]) => (
                  <div key={k} className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-2">
                    <dt className="type-caption text-[var(--foreground-subtle)]">{k}</dt>
                    <dd className="type-data-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {compare ? (
              <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--plasma)]/30 bg-[var(--plasma-dim)] p-3">
                <p className="type-caption font-semibold text-[var(--plasma)]">Comparison</p>
                <p className="type-body-sm mt-1">
                  Previous: {compare.result.value} {compare.result.unit} → Now: {result.value} {result.unit} (
                  {result.value - compare.result.value >= 0 ? "+" : ""}
                  {(result.value - compare.result.value).toFixed(1)})
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" onClick={saveHistory}>
                Save result
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void shareCard()}>
                Share card
              </Button>
              {!signedIn ? (
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/signup">Sign up to unlock history / AI</Link>
                </Button>
              ) : null}
            </div>
          </GlassCard>
        </div>

        {config.showSeries && result.series?.length ? (
          <GlassCard className="p-4">
            <p className="type-h4 mb-3">Projection</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.series}>
                  <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="x" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} />
                  <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={ChartTooltipStyle()} />
                  <Line type="monotone" dataKey="y" stroke={chartTheme.mint} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        ) : null}

        {signedIn ? (
          <GlassCard className="p-4">
            <p className="type-h4">History</p>
            {history.length === 0 ? (
              <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">No saved results yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {history.slice(0, 6).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-2 type-body-sm">
                    <span>
                      {h.result.value} {h.result.unit} · {new Date(h.at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant={compareId === h.id ? "primary" : "ghost"} onClick={() => setCompareId(h.id)}>
                      Compare
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-4">
            <p className="type-body-sm text-[var(--foreground-muted)]">
              Core calculate → result works without an account. Sign in to save history, compare, share cards, and (later)
              AI insights.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
