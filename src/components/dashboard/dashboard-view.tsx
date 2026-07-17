"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fetchDashboardData } from "@/lib/mock/dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardLayoutStore, type WidgetId } from "@/stores/dashboard-layout-store";
import { useFeatureFlag } from "@/lib/feature-flags";
import {
  AnalyticsTeaserWidget,
  BodyFatWidget,
  CoachMessagesWidget,
  CompleteProfileWidget,
  GoalsWidget,
  MilestonesWidget,
  NutritionWidget,
  ProgressScoreWidget,
  ReadinessWidget,
  SleepWidget,
  StreakWidget,
  TimelineWidget,
  TodayWorkoutWidget,
  WaterWidget,
  WeeklyWidget,
  WeightWidget,
  XpWidget,
} from "@/components/dashboard/widgets";
import { RevealOnScroll } from "@/components/ui-extended/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SortableWidget({
  id,
  children,
}: {
  id: WidgetId;
  children: (handleProps: React.HTMLAttributes<HTMLButtonElement>) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "z-10 opacity-90")}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const order = useDashboardLayoutStore((s) => s.order);
  const hidden = useDashboardLayoutStore((s) => s.hidden);
  const setOrder = useDashboardLayoutStore((s) => s.setOrder);
  const toggleWidget = useDashboardLayoutStore((s) => s.toggleWidget);
  const resetLayout = useDashboardLayoutStore((s) => s.resetLayout);
  const readinessEnabled = useFeatureFlag("READINESS_SCORE");

  const query = useQuery({
    queryKey: ["dashboard", user?.id, user?.tier, user?.profile.primaryGoal],
    queryFn: () => fetchDashboardData(user!),
    enabled: !!user,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const showProfileNudge = !!user && (!user.profile.onboardingCompleted || user.profile.onboardingSkipped);

  const visible = useMemo(
    () =>
      order.filter((id) => {
        if (hidden.includes(id)) return false;
        if (id === "readiness" && !readinessEnabled) return false;
        if (id === "complete-profile") return showProfileNudge;
        return true;
      }),
    [order, hidden, readinessEnabled, showProfileNudge],
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as WidgetId);
    const newIndex = order.indexOf(over.id as WidgetId);
    if (oldIndex < 0 || newIndex < 0) return;
    setOrder(arrayMove(order, oldIndex, newIndex));
  }

  const data = query.data;
  const loading = query.isLoading;
  const error = query.error ? (query.error instanceof Error ? query.error.message : "Failed to load") : null;

  const common = {
    data,
    loading,
    error,
    onRetry: () => void query.refetch(),
  };

  function renderWidget(id: WidgetId, handleProps: React.HTMLAttributes<HTMLButtonElement>) {
    switch (id) {
      case "complete-profile":
        return <CompleteProfileWidget visible dragHandleProps={handleProps} />;
      case "progress-score":
        return <ProgressScoreWidget {...common} dragHandleProps={handleProps} />;
      case "readiness":
        return <ReadinessWidget {...common} dragHandleProps={handleProps} />;
      case "today-workout":
        return <TodayWorkoutWidget {...common} dragHandleProps={handleProps} />;
      case "nutrition":
        return <NutritionWidget {...common} dragHandleProps={handleProps} />;
      case "water":
        return <WaterWidget {...common} dragHandleProps={handleProps} />;
      case "sleep":
        return <SleepWidget {...common} dragHandleProps={handleProps} />;
      case "weight":
        return <WeightWidget {...common} dragHandleProps={handleProps} />;
      case "body-fat":
        return <BodyFatWidget {...common} dragHandleProps={handleProps} />;
      case "xp":
        return <XpWidget {...common} dragHandleProps={handleProps} />;
      case "streak":
        return <StreakWidget {...common} dragHandleProps={handleProps} />;
      case "goals":
        return <GoalsWidget {...common} dragHandleProps={handleProps} />;
      case "weekly":
        return <WeeklyWidget {...common} dragHandleProps={handleProps} />;
      case "timeline":
        return <TimelineWidget {...common} dragHandleProps={handleProps} />;
      case "milestones":
        return <MilestonesWidget {...common} dragHandleProps={handleProps} />;
      case "coach-messages":
        return <CoachMessagesWidget {...common} dragHandleProps={handleProps} />;
      case "analytics-teaser":
        return <AnalyticsTeaserWidget {...common} dragHandleProps={handleProps} />;
      default:
        return null;
    }
  }

  const spanClass = (id: WidgetId) =>
    id === "progress-score" || id === "readiness" || id === "weekly" || id === "timeline"
      ? "md:col-span-2"
      : "md:col-span-1";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Dashboard</p>
          <h1 className="type-h2 mt-1">Today at a glance</h1>
          <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
            Greeting → Today → Progress → Action → History. Drag widgets to reshape your bento.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={resetLayout}>
            Reset layout
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleWidget("analytics-teaser")}>
            Toggle analytics card
          </Button>
        </div>
      </div>

      {(user?.tier === "admin" || user?.tier === "super-admin") && (
        <RevealOnScroll>
          <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--gold)]/40 bg-[var(--gold-dim)] p-4">
            <p className="type-h4">Admin console</p>
            <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">
              Coming in Phase 6 — this stub keeps the visual system intact.
            </p>
          </div>
        </RevealOnScroll>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visible} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {visible.map((id, i) => (
              <RevealOnScroll key={id} delay={Math.min(i * 0.03, 0.24)} className={spanClass(id)}>
                <SortableWidget id={id}>{(handleProps) => renderWidget(id, handleProps)}</SortableWidget>
              </RevealOnScroll>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
