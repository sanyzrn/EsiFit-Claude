import { createMetadata } from "@/lib/seo";
import { WorkoutSession } from "@/components/workouts/workout-session";
import { OfflineIndicator } from "@/components/offline/offline-indicator";

export const metadata = createMetadata({ title: "Live workout", path: "/workouts/session" });

export default function SessionPage() {
  return (
    <div className="container-esi mx-auto max-w-lg pb-16 pt-10">
      <h1 className="type-h1 mb-6">Live session</h1>
      <WorkoutSession />
      <OfflineIndicator />
    </div>
  );
}
