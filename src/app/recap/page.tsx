import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WeeklyRecapView } from "@/components/community/weekly-recap";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({
  title: "Weekly Recap",
  description: "Shareable weekly summary with privacy controls and OG preview.",
  path: "/recap",
});

export default function RecapPage() {
  if (!isFeatureEnabled("WEEKLY_RECAP")) notFound();
  return (
    <DashboardShell>
      <h1 className="type-h1">Weekly Recap</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">
        Choose what to share, then download or open the OG image preview.
      </p>
      <div className="mt-8">
        <WeeklyRecapView />
      </div>
    </DashboardShell>
  );
}
