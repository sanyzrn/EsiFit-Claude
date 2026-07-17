"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CalculatorId } from "@/lib/calculators/formulas";
import type { CalcInputs, CalcResult } from "@/lib/calculators/formulas";

export type HistoryEntry = {
  id: string;
  calculatorId: CalculatorId;
  inputs: CalcInputs;
  result: CalcResult;
  at: string;
};

type CalculatorHistoryState = {
  entries: HistoryEntry[];
  add: (entry: Omit<HistoryEntry, "id" | "at">) => void;
  clear: (calculatorId?: CalculatorId) => void;
  forCalculator: (calculatorId: CalculatorId) => HistoryEntry[];
};

export const useCalculatorHistoryStore = create<CalculatorHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (entry) =>
        set((s) => ({
          entries: [
            { ...entry, id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString() },
            ...s.entries,
          ].slice(0, 100),
        })),
      clear: (calculatorId) =>
        set((s) => ({
          entries: calculatorId ? s.entries.filter((e) => e.calculatorId !== calculatorId) : [],
        })),
      forCalculator: (calculatorId) => get().entries.filter((e) => e.calculatorId === calculatorId),
    }),
    {
      name: "esifit-calculator-history",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
