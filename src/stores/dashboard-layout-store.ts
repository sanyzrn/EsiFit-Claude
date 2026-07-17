"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WidgetId =
  | "progress-score"
  | "readiness"
  | "today-workout"
  | "nutrition"
  | "water"
  | "sleep"
  | "weight"
  | "body-fat"
  | "xp"
  | "streak"
  | "goals"
  | "weekly"
  | "timeline"
  | "milestones"
  | "coach-messages"
  | "analytics-teaser"
  | "complete-profile";

export const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  "complete-profile",
  "progress-score",
  "readiness",
  "today-workout",
  "nutrition",
  "water",
  "sleep",
  "weight",
  "body-fat",
  "xp",
  "streak",
  "goals",
  "weekly",
  "timeline",
  "milestones",
  "coach-messages",
  "analytics-teaser",
];

type DashboardLayoutState = {
  order: WidgetId[];
  hidden: WidgetId[];
  setOrder: (order: WidgetId[]) => void;
  toggleWidget: (id: WidgetId) => void;
  resetLayout: () => void;
};

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set, get) => ({
      order: DEFAULT_WIDGET_ORDER,
      hidden: [],
      setOrder: (order) => set({ order }),
      toggleWidget: (id) => {
        const { hidden } = get();
        set({
          hidden: hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id],
        });
      },
      resetLayout: () => set({ order: DEFAULT_WIDGET_ORDER, hidden: [] }),
    }),
    {
      name: "esifit-dashboard-layout",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
