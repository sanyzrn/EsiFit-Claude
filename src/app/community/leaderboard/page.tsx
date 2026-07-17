import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LeaderboardView } from "@/components/community/leaderboard-view";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({ title: "Leaderboard", path: "/community/leaderboard" });

export default function LeaderboardPage() {
  if (!isFeatureEnabled("COMMUNITY")) notFound();
  return (
    <DashboardShell>
      <h1 className="type-h1">Leaderboard</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">Global and friends views — your rank stays visible.</p>
      <div className="mt-8">
        <LeaderboardView />
      </div>
    </DashboardShell>
  );
}
