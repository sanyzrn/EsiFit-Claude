"use client";

import Link from "next/link";
import { EXERCISES } from "@/lib/mock/catalog";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { useWorkoutBuilderStore } from "@/stores/workout-builder-store";
import { toast } from "sonner";

export function WorkoutBuilder() {
  const draftName = useWorkoutBuilderStore((s) => s.draftName);
  const draftSets = useWorkoutBuilderStore((s) => s.draftSets);
  const routines = useWorkoutBuilderStore((s) => s.routines);
  const setDraftName = useWorkoutBuilderStore((s) => s.setDraftName);
  const removeSet = useWorkoutBuilderStore((s) => s.removeSet);
  const updateSet = useWorkoutBuilderStore((s) => s.updateSet);
  const saveRoutine = useWorkoutBuilderStore((s) => s.saveRoutine);
  const loadRoutine = useWorkoutBuilderStore((s) => s.loadRoutine);
  const clearDraft = useWorkoutBuilderStore((s) => s.clearDraft);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1">
            <span className="type-caption font-semibold">Routine name</span>
            <TextInput className="mt-1" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
          </label>
          <Button
            onClick={() => {
              saveRoutine();
              toast.success("Routine saved");
            }}
          >
            Save routine
          </Button>
          <Button variant="ghost" onClick={clearDraft}>
            Clear
          </Button>
        </div>
        <ul className="mt-6 space-y-3">
          {draftSets.length === 0 ? (
            <p className="type-body-sm text-[var(--foreground-muted)]">
              Add exercises from the{" "}
              <Link href="/workouts" className="text-[var(--plasma)] hover:underline">
                library
              </Link>
              .
            </p>
          ) : (
            draftSets.map((s, i) => {
              const ex = EXERCISES.find((e) => e.id === s.exerciseId);
              return (
                <li key={s.id} className="rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="type-body-sm font-semibold">
                      {i + 1}. {ex?.name ?? s.exerciseId}
                    </p>
                    <div className="flex gap-2">
                      <select
                        className="h-9 rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-1)] px-2 type-caption"
                        value={s.group ?? "normal"}
                        onChange={(e) => updateSet(s.id, { group: e.target.value as "normal" | "superset" | "dropset" })}
                      >
                        <option value="normal">Normal</option>
                        <option value="superset">Superset</option>
                        <option value="dropset">Drop-set</option>
                      </select>
                      <Button size="sm" variant="ghost" onClick={() => removeSet(s.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="type-caption">
                      Weight (kg)
                      <TextInput
                        type="number"
                        className="mt-1"
                        value={s.targetWeight}
                        onChange={(e) => updateSet(s.id, { targetWeight: Number(e.target.value) })}
                      />
                    </label>
                    <label className="type-caption">
                      Reps
                      <TextInput
                        type="number"
                        className="mt-1"
                        value={s.targetReps}
                        onChange={(e) => updateSet(s.id, { targetReps: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                </li>
              );
            })
          )}
        </ul>
        {draftSets.length > 0 ? (
          <Button className="mt-6" variant="gradient-glow" asChild>
            <Link href="/workouts/session">Start session</Link>
          </Button>
        ) : null}
      </GlassCard>
      <GlassCard className="p-5">
        <h2 className="type-h4">Saved routines</h2>
        <ul className="mt-4 space-y-2">
          {routines.length === 0 ? (
            <li className="type-body-sm text-[var(--foreground-muted)]">No saved routines yet.</li>
          ) : (
            routines.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="type-body-sm font-semibold">{r.name}</span>
                <Button size="sm" variant="secondary" onClick={() => loadRoutine(r.id)}>
                  Load
                </Button>
              </li>
            ))
          )}
        </ul>
      </GlassCard>
    </div>
  );
}
