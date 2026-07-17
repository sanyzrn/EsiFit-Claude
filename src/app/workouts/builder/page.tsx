import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkoutBuilder } from "@/components/workouts/workout-builder";

export const metadata = createMetadata({ title: "Workout builder", path: "/workouts/builder" });

export default function BuilderPage() {
  return (
    <DashboardShell>
      <h1 className="type-h1">Workout builder</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">
        Assemble supersets and drop-sets, save routines, start a session.
      </p>
      <div className="mt-8">
        <WorkoutBuilder />
      </div>
    </DashboardShell>
  );
}
