import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ChallengesView } from "@/components/community/challenges-view";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({ title: "Challenges", path: "/community/challenges" });

export default function ChallengesPage() {
  if (!isFeatureEnabled("COMMUNITY")) notFound();
  return (
    <DashboardShell>
      <h1 className="type-h1">Challenges</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">Join, compete, and track challenge leaderboards.</p>
      <div className="mt-8">
        <ChallengesView />
      </div>
    </DashboardShell>
  );
}
