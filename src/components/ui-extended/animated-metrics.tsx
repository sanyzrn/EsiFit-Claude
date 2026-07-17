"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionPresets } from "@/lib/motion";
import { useFeatureFlag } from "@/lib/feature-flags";

function formatValue(value: number, decimals: number, prefix: string, suffix: string) {
  return prefix + value.toFixed(decimals) + suffix;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const motionEnabled = useFeatureFlag("MOTION");
  const shouldAnimate = Boolean(motionEnabled && !reduceMotion);
  const motionValue = useMotionValue(shouldAnimate ? 0 : value);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = React.useState(() => formatValue(value, decimals, prefix, suffix));

  useMotionValueEvent(spring, "change", (latest) => {
    if (shouldAnimate) {
      setDisplay(formatValue(latest, decimals, prefix, suffix));
    }
  });

  React.useEffect(() => {
    if (!shouldAnimate) return;
    motionValue.set(0);
    motionValue.set(value);
  }, [value, shouldAnimate, motionValue]);

  const shown = shouldAnimate ? display : formatValue(value, decimals, prefix, suffix);

  return <span className={cn("type-data-lg tabular-nums", className)}>{shown}</span>;
}

export function RadialProgress({
  value,
  size = "md",
  label,
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg" | "hero";
  label?: string;
  className?: string;
}) {
  const dims = { sm: 64, md: 96, lg: 140, hero: 200 }[size];
  const stroke = { sm: 6, md: 8, lg: 10, hero: 12 }[size];
  const r = (dims - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;
  const reduceMotion = useReducedMotion();
  const motionEnabled = useFeatureFlag("MOTION");

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: dims, height: dims }}>
      <svg width={dims} height={dims} className="-rotate-90" aria-hidden>
        <circle cx={dims / 2} cy={dims / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          fill="none"
          stroke="url(#esi-gauge)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={reduceMotion || !motionEnabled ? { duration: 0 } : motionPresets.smooth}
        />
        <defs>
          <linearGradient id="esi-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--mint)" />
            <stop offset="100%" stopColor="var(--plasma)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter value={clamped} suffix="%" className={size === "hero" ? "type-data-lg" : "type-data-md"} />
        {label ? <span className="type-caption text-[var(--foreground-muted)]">{label}</span> : null}
      </div>
    </div>
  );
}
