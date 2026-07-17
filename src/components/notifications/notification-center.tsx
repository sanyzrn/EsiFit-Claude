"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/stores/notification-store";
import type { NotifKind } from "@/lib/mock/growth";
import { useFeatureFlag } from "@/lib/feature-flags";

const FILTERS: (NotifKind | "all")[] = ["all", "workout", "nutrition", "streak", "milestone", "community", "mission"];

export function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const enabled = useFeatureFlag("NOTIFICATIONS");
  const filterBy = useNotificationStore((s) => s.filterBy);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const [filter, setFilter] = useState<NotifKind | "all">("all");
  const items = filterBy(filter);

  if (!enabled) return null;

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {!compact ? (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "primary" : "ghost"} onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={markAllRead}>
            Mark all read
          </Button>
          <Button size="sm" variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className={compact ? "p-3 text-center type-body-sm text-[var(--foreground-muted)]" : undefined}>
          {compact ? (
            "No notifications"
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="type-h4">All quiet</p>
              <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">No notifications in this category.</p>
            </GlassCard>
          )}
        </div>
      ) : (
        items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => markRead(n.id)}
            className={`w-full rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] p-3 text-left transition-colors ${
              n.is_read ? "bg-[var(--surface-1)]" : "bg-[var(--mint-dim)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="type-body-sm font-semibold">{n.title}</p>
              <Badge variant="status">{n.type}</Badge>
            </div>
            <p className="type-caption mt-1 text-[var(--foreground-muted)]">{n.message}</p>
          </button>
        ))
      )}
    </div>
  );
}

export function ReminderSettings() {
  const reminders = useNotificationStore((s) => s.reminders);
  const setReminders = useNotificationStore((s) => s.setReminders);
  const enabled = useFeatureFlag("NOTIFICATIONS");
  if (!enabled) return null;

  return (
    <GlassCard className="p-5">
      <h2 className="type-h4">Smart reminders</h2>
      <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">
        Preferences are saved locally — push delivery comes with the real backend.
      </p>
      <div className="mt-4 space-y-4">
        <ToggleRow
          label="Workout reminder"
          checked={reminders.workoutEnabled}
          onChange={(v) => setReminders({ workoutEnabled: v })}
          time={reminders.workoutTime}
          onTime={(v) => setReminders({ workoutTime: v })}
        />
        <ToggleRow
          label="Nutrition reminder"
          checked={reminders.nutritionEnabled}
          onChange={(v) => setReminders({ nutritionEnabled: v })}
          time={reminders.nutritionTime}
          onTime={(v) => setReminders({ nutritionTime: v })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 type-body-sm">
            <input
              type="checkbox"
              className="accent-[var(--mint)]"
              checked={reminders.waterEnabled}
              onChange={(e) => setReminders({ waterEnabled: e.target.checked })}
            />
            Water reminders
          </label>
          <label className="type-caption text-[var(--foreground-muted)]">
            Every{" "}
            <input
              type="number"
              min={1}
              max={6}
              className="ml-1 w-14 rounded border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-2 py-1"
              value={reminders.waterIntervalHours}
              onChange={(e) => setReminders({ waterIntervalHours: Number(e.target.value) })}
            />{" "}
            hours
          </label>
        </div>
      </div>
    </GlassCard>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  time,
  onTime,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  time: string;
  onTime: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 type-body-sm">
        <input
          type="checkbox"
          className="accent-[var(--mint)]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
      <input
        type="time"
        value={time}
        onChange={(e) => onTime(e.target.value)}
        className="rounded border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-2 py-1 type-body-sm"
      />
    </div>
  );
}
