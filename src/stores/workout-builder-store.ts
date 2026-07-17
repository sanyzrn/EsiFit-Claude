"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Exercise } from "@/lib/mock/catalog";

export type BuilderSet = {
  id: string;
  exerciseId: string;
  targetReps: number;
  targetWeight: number;
  group?: "normal" | "superset" | "dropset";
  groupId?: string;
};

export type Routine = {
  id: string;
  name: string;
  sets: BuilderSet[];
  updatedAt: string;
};

type WorkoutBuilderState = {
  draftName: string;
  draftSets: BuilderSet[];
  routines: Routine[];
  setDraftName: (name: string) => void;
  addExercise: (exercise: Exercise) => void;
  removeSet: (id: string) => void;
  updateSet: (id: string, patch: Partial<BuilderSet>) => void;
  clearDraft: () => void;
  saveRoutine: () => void;
  loadRoutine: (id: string) => void;
};

export const useWorkoutBuilderStore = create<WorkoutBuilderState>()(
  persist(
    (set, get) => ({
      draftName: "My routine",
      draftSets: [],
      routines: [],
      setDraftName: (draftName) => set({ draftName }),
      addExercise: (exercise) =>
        set((s) => ({
          draftSets: [
            ...s.draftSets,
            {
              id: `bs_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
              exerciseId: exercise.id,
              targetReps: 8,
              targetWeight: 40,
              group: "normal",
            },
          ],
        })),
      removeSet: (id) => set((s) => ({ draftSets: s.draftSets.filter((x) => x.id !== id) })),
      updateSet: (id, patch) =>
        set((s) => ({
          draftSets: s.draftSets.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      clearDraft: () => set({ draftSets: [], draftName: "My routine" }),
      saveRoutine: () => {
        const { draftName, draftSets, routines } = get();
        if (!draftSets.length) return;
        const routine: Routine = {
          id: `rt_${Date.now()}`,
          name: draftName || "Untitled",
          sets: draftSets,
          updatedAt: new Date().toISOString(),
        };
        set({ routines: [routine, ...routines].slice(0, 20) });
      },
      loadRoutine: (id) => {
        const routine = get().routines.find((r) => r.id === id);
        if (!routine) return;
        set({ draftName: routine.name, draftSets: routine.sets });
      },
    }),
    { name: "esifit-workout-builder", storage: createJSONStorage(() => localStorage) },
  ),
);
