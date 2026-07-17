import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ExerciseLibrary } from "@/components/workouts/exercise-library";

export const metadata = createMetadata({
  title: "Workouts",
  description: "Exercise library with anatomical target maps and workout builder.",
  path: "/workouts",
});

export default function WorkoutsPage() {
  return (
    <DashboardShell>
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Training</p>
      <h1 className="type-h1 mt-3">Exercise library</h1>
      <p className="type-body-lg mt-4 max-w-2xl text-[var(--foreground-muted)]">
        Search, filter, and inspect target muscles on the body map — then add to your builder.
      </p>
      <div className="mt-8">
        <ExerciseLibrary />
      </div>
    </DashboardShell>
  );
}
