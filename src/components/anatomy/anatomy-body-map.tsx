"use client";

import { cn } from "@/lib/utils";
import { useFeatureFlag } from "@/lib/feature-flags";

/** Muscle group keys used across exercise targeting and volume heatmaps */
export type MuscleGroup =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "traps"
  | "lats"
  | "lower-back"
  | "forearms";

export type MuscleIntensityMap = Partial<Record<MuscleGroup, number>>;

const FRONT_PATHS: { id: MuscleGroup; d: string }[] = [
  { id: "chest", d: "M78 78c8-10 28-12 36-2 4 6 4 18 0 28-8 8-24 10-36 2-6-8-6-18 0-28z M122 78c-8-10-28-12-36-2-4 6-4 18 0 28 8 8 24 10 36 2 6-8 6-18 0-28z" },
  { id: "shoulders", d: "M58 70c-10 2-18 14-16 26 8 4 18 2 24-6 4-8 2-18-8-20z M142 70c10 2 18 14 16 26-8 4-18 2-24-6-4-8-2-18 8-20z" },
  { id: "biceps", d: "M52 96c-8 4-12 18-8 30 6 4 14 2 18-6 2-10-2-22-10-24z M148 96c8 4 12 18 8 30-6 4-14 2-18-6-2-10 2-22 10-24z" },
  { id: "abs", d: "M90 108h20c4 0 8 20 6 40-2 8-10 12-16 12s-14-4-16-12c-2-20 2-40 6-40z" },
  { id: "obliques", d: "M78 112c-6 8-8 24-4 38 8 2 14-6 16-16 0-10-4-20-12-22z M122 112c6 8 8 24 4 38-8 2-14-6-16-16 0-10 4-20 12-22z" },
  { id: "quads", d: "M82 168c-4 18-2 40 2 56 8 4 18 2 20-8 0-18-2-36-6-50-6-4-12-2-16 2z M118 168c4 18 2 40-2 56-8 4-18 2-20-8 0-18 2-36 6-50 6-4 12-2 16 2z" },
  { id: "calves", d: "M86 232c-2 14 0 28 4 36 6 2 12 0 14-6 0-12-2-24-6-32-4-2-10-2-12 2z M114 232c2 14 0 28-4 36-6 2-12 0-14-6 0-12 2-24 6-32 4-2 10-2 12 2z" },
  { id: "forearms", d: "M46 128c-6 10-8 24-4 34 6 2 12-2 14-10 0-10 0-20-4-26-2-2-4-2-6 2z M154 128c6 10 8 24 4 34-6 2-12-2-14-10 0-10 0-20 4-26 2-2 4-2 6 2z" },
];

const BACK_PATHS: { id: MuscleGroup; d: string }[] = [
  { id: "traps", d: "M86 62c6-10 22-12 28-2 2 8-2 16-10 20-10 2-18-4-18-18z" },
  { id: "lats", d: "M70 90c-8 16-6 40 4 56 10 2 18-10 20-24 0-14-6-28-14-34-4-2-8 0-10 2z M130 90c8 16 6 40-4 56-10 2-18-10-20-24 0-14 6-28 14-34 4-2 8 0 10 2z" },
  { id: "shoulders", d: "M58 74c-8 4-14 16-10 26 8 2 16-2 20-10 2-8-2-16-10-16z M142 74c8 4 14 16 10 26-8 2-16-2-20-10-2-8 2-16 10-16z" },
  { id: "triceps", d: "M52 100c-6 8-8 22-2 32 6 2 12-2 14-10 0-10-2-18-6-24-2-2-4-2-6 2z M148 100c6 8 8 22 2 32-6 2-12-2-14-10 0-10 2-18 6-24 2-2 4-2 6 2z" },
  { id: "lower-back", d: "M90 148h20c2 10 0 24-4 34-4 4-12 4-16 0-4-10-6-24-4-34z" },
  { id: "glutes", d: "M82 178c-2 12 2 24 10 28 8 0 14-8 14-18 0-10-6-16-14-14-4 0-8 2-10 4z M118 178c2 12-2 24-10 28-8 0-14-8-14-18 0-10 6-16 14-14 4 0 8 2 10 4z" },
  { id: "hamstrings", d: "M84 210c-2 16 0 32 4 42 8 2 16-2 18-10 0-14-2-28-6-38-6-2-12 0-16 6z M116 210c2 16 0 32-4 42-8 2-16-2-18-10 0-14 2-28 6-38 6-2 12 0 16 6z" },
  { id: "calves", d: "M88 256c-2 12 0 22 4 28 6 2 12-2 12-8 0-10-2-18-6-24-4-2-8-2-10 4z M112 256c2 12 0 22-4 28-6 2-12-2-12-8 0-10 2-18 6-24 4-2 8-2 10 4z" },
];

function intensityColor(intensity = 0) {
  const t = Math.max(0, Math.min(1, intensity));
  if (t === 0) return "var(--surface-3)";
  return `color-mix(in srgb, var(--mint) ${Math.round(35 + t * 65)}%, var(--plasma) ${Math.round(t * 40)}%)`;
}

export function AnatomyBodyMap({
  view = "front",
  intensityMap = {},
  highlightedMuscles = [],
  className,
  title = "Anatomical muscle map",
}: {
  view?: "front" | "back";
  intensityMap?: MuscleIntensityMap;
  highlightedMuscles?: MuscleGroup[];
  className?: string;
  title?: string;
}) {
  const enabled = useFeatureFlag("ANATOMY_VIEW");
  if (!enabled) return null;

  const paths = view === "front" ? FRONT_PATHS : BACK_PATHS;
  const highlightSet = new Set(highlightedMuscles);

  return (
    <svg
      viewBox="0 0 200 320"
      role="img"
      aria-label={title}
      className={cn("h-auto w-full max-w-[220px]", className)}
    >
      <title>{title}</title>
      {/* silhouette */}
      <ellipse cx="100" cy="42" rx="22" ry="26" fill="var(--surface-2)" stroke="var(--surface-glass-border)" />
      <path
        d="M78 68c6-8 38-8 44 0 8 10 14 28 12 48-2 10-8 18-16 22v40c8 6 14 20 16 36 2 18-2 40-6 58-6 4-18 4-22-2-2-18 0-40 2-56-4-12-10-22-16-28v-40c-8-4-14-12-16-22-2-20 4-38 12-48z"
        fill="var(--surface-2)"
        stroke="var(--surface-glass-border)"
        opacity="0.85"
      />
      {paths.map((muscle) => {
        const intensity = intensityMap[muscle.id] ?? (highlightSet.has(muscle.id) ? 0.75 : 0);
        return (
          <path
            key={`${view}-${muscle.id}`}
            d={muscle.d}
            fill={intensityColor(intensity)}
            stroke="var(--surface-glass-border)"
            strokeWidth="1"
            className="transition-[fill] duration-[var(--duration-smooth)] ease-[var(--ease-smooth)]"
          >
            <title>{muscle.id}</title>
          </path>
        );
      })}
    </svg>
  );
}
