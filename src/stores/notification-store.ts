"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { SEED_NOTIFICATIONS, type AppNotif, type NotifKind } from "@/lib/mock/growth";

export type ReminderPrefs = {
  workoutEnabled: boolean;
  workoutTime: string;
  nutritionEnabled: boolean;
  nutritionTime: string;
  waterEnabled: boolean;
  waterIntervalHours: number;
};

type NotificationState = {
  items: AppNotif[];
  reminders: ReminderPrefs;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  push: (partial: Omit<AppNotif, "id" | "is_read" | "created_at"> & { id?: string }) => void;
  unreadCount: () => number;
  setReminders: (patch: Partial<ReminderPrefs>) => void;
  filterBy: (type: NotifKind | "all") => AppNotif[];
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: SEED_NOTIFICATIONS,
      reminders: {
        workoutEnabled: true,
        workoutTime: "18:00",
        nutritionEnabled: true,
        nutritionTime: "12:30",
        waterEnabled: true,
        waterIntervalHours: 2,
      },

      markRead: (id) =>
        set({
          items: get().items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        }),

      markAllRead: () => set({ items: get().items.map((n) => ({ ...n, is_read: true })) }),

      clearAll: () => {
        set({ items: [] });
        toast.message("Notifications cleared");
      },

      push: (partial) => {
        const item: AppNotif = {
          id: partial.id ?? `n_${Date.now()}`,
          type: partial.type,
          title: partial.title,
          message: partial.message,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        set({ items: [item, ...get().items] });
        if (partial.type === "streak") {
          toast.warning(partial.title, { description: partial.message });
        } else if (partial.type === "milestone" || partial.type === "mission") {
          toast.success(partial.title, { description: partial.message });
        }
      },

      unreadCount: () => get().items.filter((n) => !n.is_read).length,

      setReminders: (patch) => {
        set({ reminders: { ...get().reminders, ...patch } });
        toast.success("Reminder preferences saved");
      },

      filterBy: (type) => (type === "all" ? get().items : get().items.filter((n) => n.type === type)),
    }),
    { name: "esifit-notifications" },
  ),
);
