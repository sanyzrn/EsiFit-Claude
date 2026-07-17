import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MissionsView } from "@/components/gamification/missions-view";

export const metadata = createMetadata({
  title: "Missions",
  description: "Daily, weekly, and monthly missions with claimable XP rewards.",
  path: "/missions",
});

export default function MissionsPage() {
  return (
    <DashboardShell>
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Growth</p>
      <h1 className="type-h1 mt-3">Missions</h1>
      <p className="type-body-lg mt-4 max-w-2xl text-[var(--foreground-muted)]">
        Clear objectives with progress bars and claimable rewards.
      </p>
      <div className="mt-8">
        <MissionsView />
      </div>
    </DashboardShell>
  );
}
