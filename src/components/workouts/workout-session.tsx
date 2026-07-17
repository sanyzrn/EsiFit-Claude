"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { EXERCISES } from "@/lib/mock/catalog";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { useWorkoutBuilderStore } from "@/stores/workout-builder-store";
import { useSpeechSetLogger } from "@/components/workouts/exercise-library";
import { enqueueOffline, isOnline } from "@/lib/offline/queue";
import { toast } from "sonner";
import { motionPresets } from "@/lib/motion";
import { useGamificationStore } from "@/stores/gamification-store";
import { useNotificationStore } from "@/stores/notification-store";

type LoggedSet = { weight: number; reps: number; isPr: boolean };

export function WorkoutSession() {
  const router = useRouter();
  const draftSets = useWorkoutBuilderStore((s) => s.draftSets);
  const [index, setIndex] = useState(0);
  const [weight, setWeight] = useState(() => draftSets[0]?.targetWeight ?? 40);
  const [reps, setReps] = useState(() => draftSets[0]?.targetReps ?? 8);
  const [restLeft, setRestLeft] = useState(0);
  const [logs, setLogs] = useState<Record<string, LoggedSet[]>>({});
  const [startedAt] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const reduceMotion = useReducedMotion();

  const current = draftSets[index];
  const exercise = useMemo(() => EXERCISES.find((e) => e.id === current?.exerciseId), [current]);

  // Sync inputs when navigating sets via explicit handlers (not effect)
  function goToSet(nextIndex: number) {
    const next = draftSets[nextIndex];
    setIndex(nextIndex);
    if (next) {
      setWeight(next.targetWeight);
      setReps(next.targetReps);
    }
  }

  useEffect(() => {
    if (restLeft <= 0) return;
    const id = window.setTimeout(() => setRestLeft((r) => r - 1), 1000);
    if (restLeft === 1) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.value = 0.04;
        o.start();
        o.stop(ctx.currentTime + 0.15);
      } catch {
        /* ignore */
      }
    }
    return () => window.clearTimeout(id);
  }, [restLeft]);

  const voice = useSpeechSetLogger((w, r) => {
    setWeight(w);
    setReps(r);
    toast.success(`Voice logged ${w} kg × ${r}`);
  });

  if (!draftSets.length) {
    return (
      <GlassCard className="p-6">
        <p className="type-body-md text-[var(--foreground-muted)]">No session loaded. Build a routine first.</p>
        <Button className="mt-4" asChild>
          <a href="/workouts/builder">Open builder</a>
        </Button>
      </GlassCard>
    );
  }

  if (done) {
    const all = Object.values(logs).flat();
    const volume = all.reduce((a, s) => a + s.weight * s.reps, 0);
    const prs = all.filter((s) => s.isPr).length;
    const minutes = Math.max(1, Math.round(((endedAt ?? startedAt) - startedAt) / 60000));
    return (
      <GlassCard className="mx-auto max-w-lg p-8 text-center">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={motionPresets.spring}
        >
          <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Session complete</p>
          <h1 className="type-h2 mt-2">Nice work</h1>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Stat label="Duration" value={`${minutes}m`} />
            <Stat label="Volume" value={`${Math.round(volume)} kg`} />
            <Stat label="PRs" value={`${prs}`} />
            <Stat label="XP" value={`+${40 + prs * 15}`} />
          </div>
          <Button className="mt-8" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  async function logSet() {
    if (!current) return;
    const prevBest = Math.max(0, ...(logs[current.exerciseId] ?? []).map((s) => s.weight * s.reps));
    const isPr = weight * reps > prevBest && prevBest > 0;
    const entry = { weight, reps, isPr };
    setLogs((prev) => ({
      ...prev,
      [current.exerciseId]: [...(prev[current.exerciseId] ?? []), entry],
    }));

    if (!isOnline()) {
      await enqueueOffline("set", { exerciseId: current.exerciseId, weight, reps });
      toast.message("Saved offline — will sync");
    } else {
      toast.success("Set logged");
    }

    if (isPr) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1200);
      toast.success("Personal record!");
      useGamificationStore.getState().awardXp("pr", undefined, "Personal record");
      useGamificationStore.getState().bumpBadge("b_pr_3");
      useGamificationStore.setState({ celebration: { kind: "pr", label: "New PR" } });
    }
    setRestLeft(90);
  }

  function next() {
    if (index >= draftSets.length - 1) {
      setEndedAt(Date.now());
      setDone(true);
      useGamificationStore.getState().awardXp("workout_complete", undefined, "Workout complete");
      useGamificationStore.getState().bumpMission("m_daily_workout");
      useGamificationStore.getState().bumpMission("m_weekly_sessions");
      useNotificationStore.getState().push({
        type: "milestone",
        title: "Workout logged",
        message: "Nice session — XP and mission progress updated.",
      });
    } else goToSet(index + 1);
  }

  const last = (logs[current!.exerciseId] ?? []).at(-1);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between type-caption text-[var(--foreground-subtle)]">
        <span>
          Set {index + 1} / {draftSets.length}
        </span>
        {restLeft > 0 ? <span className="type-data-sm text-[var(--plasma)]">Rest {restLeft}s</span> : <span>Ready</span>}
      </div>
      <GlassCard className={`relative overflow-hidden p-6 ${celebrate ? "shadow-[var(--glow-mint)]" : ""}`}>
        {celebrate && !reduceMotion ? (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[var(--mint)]/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1 }}
          />
        ) : null}
        <p className="type-caption text-[var(--mint)]">{current?.group !== "normal" ? current?.group : "Working set"}</p>
        <h1 className="type-h2 mt-1">{exercise?.name}</h1>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
          Last time: {last ? `${last.weight}kg × ${last.reps}` : "—"} · Target {current?.targetWeight}kg × {current?.targetReps}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="type-caption font-semibold">
            Weight (kg)
            <TextInput type="number" className="mt-1 h-14 type-data-md" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </label>
          <label className="type-caption font-semibold">
            Reps
            <TextInput type="number" className="mt-1 h-14 type-data-md" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="flex-1" size="lg" onClick={logSet}>
            Log set
          </Button>
          <Button variant="secondary" size="lg" onClick={voice.start} loading={voice.listening}>
            Voice
          </Button>
        </div>
        <Button className="mt-3 w-full" variant="ghost" onClick={next}>
          {index >= draftSets.length - 1 ? "Finish workout" : "Next exercise"}
        </Button>
      </GlassCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
      <p className="type-caption text-[var(--foreground-subtle)]">{label}</p>
      <p className="type-data-md mt-1">{value}</p>
    </div>
  );
}
