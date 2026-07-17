"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFeatureFlag } from "@/lib/feature-flags";
import { motionPresets } from "@/lib/motion";
import { useGamificationStore } from "@/stores/gamification-store";

/** One reusable celebration for level-ups, badges, missions, and PRs. */
export function CelebrationHost() {
  const celebration = useGamificationStore((s) => s.celebration);
  const clear = useGamificationStore((s) => s.clearCelebration);
  const motionOn = useFeatureFlag("MOTION");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!celebration) return;
    const id = window.setTimeout(clear, 2200);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {
        /* ignore */
      }
    }
    return () => window.clearTimeout(id);
  }, [celebration, clear]);

  return (
    <AnimatePresence>
      {celebration ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-[var(--surface-0)]/40 backdrop-blur-[2px]" />
          {motionOn && !reduce
            ? Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute size-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? "var(--mint)" : i % 3 === 1 ? "var(--plasma)" : "var(--gold)",
                    left: `${20 + ((i * 37) % 60)}%`,
                    top: `${30 + ((i * 53) % 40)}%`,
                  }}
                  initial={{ scale: 0, y: 0, opacity: 1 }}
                  animate={{ scale: 1, y: -80 - (i % 5) * 12, opacity: 0 }}
                  transition={{ ...motionPresets.smooth, delay: i * 0.02, duration: 1.1 }}
                />
              ))
            : null}
          <motion.div
            className="relative rounded-2xl border border-[var(--surface-glass-border)] bg-[var(--surface-1)] px-8 py-6 text-center shadow-[var(--shadow-float)]"
            initial={reduce || !motionOn ? false : { scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={motionPresets.spring}
          >
            <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">
              {celebration.kind === "level"
                ? "Level up"
                : celebration.kind === "badge"
                  ? "Badge unlocked"
                  : celebration.kind === "mission"
                    ? "Mission complete"
                    : "Personal record"}
            </p>
            <p className="type-h2 mt-2">{celebration.label}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
