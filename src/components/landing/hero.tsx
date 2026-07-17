"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Apple,
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Trophy,
  Users,
} from "lucide-react";
import { landingContent } from "@/content/landing";
import { MagneticButton } from "@/components/ui-extended/motion";
import { Button } from "@/components/ui/button";
import { useFeatureFlag } from "@/lib/feature-flags";
import { RadialProgress } from "@/components/ui-extended/animated-metrics";
import { AnatomyBodyMap } from "@/components/anatomy/anatomy-body-map";

const iconMap = {
  LayoutDashboard,
  Dumbbell,
  Apple,
  LineChart,
  Trophy,
  Users,
} as const;

export function HeroSection() {
  const { hero } = landingContent;
  const reduceMotion = useReducedMotion();
  const motionEnabled = useFeatureFlag("MOTION");

  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden gradient-hero pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      {!reduceMotion && motionEnabled ? (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-[var(--mint)]/20 blur-3xl"
            animate={{ y: [0, 24, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[var(--plasma)]/20 blur-3xl"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}

      <div className="container-esi relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-16">
        <div>
          <p className="type-caption mb-4 font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">{hero.brand}</p>
          <h1 className="type-display">
            {hero.headline}{" "}
            <span className="text-gradient-mint">Your data, calm.</span>
          </h1>
          <p className="type-body-lg mt-6 max-w-xl text-[var(--foreground-muted)]">{hero.subhead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton asChild size="lg">
              <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
            </MagneticButton>
            <Button variant="secondary" size="lg" asChild>
              <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="glass relative overflow-hidden rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-float)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="type-caption text-[var(--foreground-muted)]">Daily readiness</p>
                <p className="type-h3">Steady & ready</p>
              </div>
              <RadialProgress value={86} size="md" label="score" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
                <p className="type-caption text-[var(--foreground-muted)]">Today</p>
                <p className="type-h4 mt-1">Upper push</p>
                <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">48 min · 5 movements</p>
              </div>
              <div className="flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-2)] p-2">
                <AnatomyBodyMap
                  view="front"
                  intensityMap={{ chest: 0.9, shoulders: 0.7, triceps: 0.55 }}
                  className="max-w-[120px]"
                  title="Today's target muscles"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { iconMap };
