"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXERCISES } from "@/lib/mock/catalog";
import { AnatomyBodyMap } from "@/components/anatomy/anatomy-body-map";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { useWorkoutBuilderStore } from "@/stores/workout-builder-store";
import { toast } from "sonner";
import type { MuscleGroup } from "@/components/anatomy/anatomy-body-map";

export function ExerciseLibrary() {
  const [q, setQ] = useState("");
  const [equipment, setEquipment] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selected, setSelected] = useState(EXERCISES[0]!);
  const addExercise = useWorkoutBuilderStore((s) => s.addExercise);

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      if (equipment !== "all" && e.equipment !== equipment) return false;
      if (difficulty !== "all" && e.difficulty !== difficulty) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, equipment, difficulty]);

  const intensity = useMemo(() => {
    const map: Partial<Record<MuscleGroup, number>> = {};
    for (const m of selected.muscles) map[m] = 0.95;
    for (const m of selected.secondaryMuscles ?? []) map[m] = 0.55;
    return map;
  }, [selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-wrap gap-2">
          <TextInput
            placeholder="Search exercises"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
            aria-label="Search exercises"
          />
          <select
            className="h-11 rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-3"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            aria-label="Equipment filter"
          >
            <option value="all">All equipment</option>
            <option value="barbell">Barbell</option>
            <option value="dumbbell">Dumbbell</option>
            <option value="cable">Cable</option>
            <option value="machine">Machine</option>
            <option value="bodyweight">Bodyweight</option>
          </select>
          <select
            className="h-11 rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-3"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Difficulty filter"
          >
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtered.map((ex) => (
            <button key={ex.id} type="button" onClick={() => setSelected(ex)} className="text-left">
              <GlassCard interactive className={`p-4 ${selected.id === ex.id ? "ring-1 ring-[var(--mint)]" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="type-h4">{ex.name}</h3>
                  <Badge variant="status">{ex.difficulty}</Badge>
                </div>
                <p className="type-caption mt-2 text-[var(--foreground-muted)]">{ex.equipment} · {ex.muscles.join(", ")}</p>
              </GlassCard>
            </button>
          ))}
        </div>
      </div>
      <GlassCard className="h-fit p-5">
        <div className="aspect-video rounded-[var(--radius-md)] bg-[var(--surface-2)] flex items-center justify-center type-caption text-[var(--foreground-subtle)]">
          Media placeholder · {selected.mediaPlaceholder}
        </div>
        <h2 className="type-h3 mt-4">{selected.name}</h2>
        <div className="mt-4 flex justify-center">
          <AnatomyBodyMap intensityMap={intensity} title={`${selected.name} target muscles`} />
        </div>
        <p className="type-caption mt-2 text-center text-[var(--foreground-subtle)]">Target muscles</p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 type-body-sm text-[var(--foreground-muted)]">
          {selected.instructions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="type-caption mt-4 font-semibold uppercase tracking-[0.12em] text-[var(--error)]">Common mistakes</p>
        <ul className="mt-2 space-y-1 type-body-sm text-[var(--foreground-muted)]">
          {selected.mistakes.map((m) => (
            <li key={m}>• {m}</li>
          ))}
        </ul>
        <label className="mt-4 block">
          <span className="type-caption font-semibold">Personal notes</span>
          <textarea
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] p-2 type-body-sm"
            rows={3}
            placeholder="Cues that work for you…"
          />
        </label>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              addExercise(selected);
              toast.success(`Added ${selected.name} to builder`);
            }}
          >
            Add to workout
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/workouts/builder">Open builder</Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function useSpeechSetLogger(onResult: (weight: number, reps: number) => void) {
  const [listening, setListening] = useState(false);
  useEffect(() => {
    return () => setListening(false);
  }, []);

  function start() {
    const SR = typeof window !== "undefined" ? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition : undefined;
    if (!SR) {
      toast.error("Voice logging isn't supported in this browser. Use manual entry.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.toLowerCase() ?? "";
      const nums = transcript.match(/(\d+(\.\d+)?)/g)?.map(Number) ?? [];
      if (nums.length >= 2) onResult(nums[0]!, nums[1]!);
      else if (nums.length === 1) onResult(nums[0]!, 8);
      else toast.message(`Heard “${transcript}” — try “60 kilos, 8 reps”.`);
      setListening(false);
    };
    rec.onerror = () => {
      setListening(false);
      toast.error("Voice capture failed — use manual entry.");
    };
    setListening(true);
    rec.start();
  }

  return { listening, start };
}

// Minimal SpeechRecognition types for TS without DOM lib friction
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
