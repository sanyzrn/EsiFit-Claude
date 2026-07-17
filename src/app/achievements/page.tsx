import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AchievementsView } from "@/components/gamification/achievements-view";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({
  title: "Achievements",
  description: "XP, levels, badges, and unlockables.",
  path: "/achievements",
});

export default function AchievementsPage() {
  if (!isFeatureEnabled("ACHIEVEMENTS")) notFound();
  return (
    <DashboardShell>
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Growth</p>
      <h1 className="type-h1 mt-3">Achievements</h1>
      <p className="type-body-lg mt-4 max-w-2xl text-[var(--foreground-muted)]">
        Level up, unlock badges, and equip cosmetic rewards.
      </p>
      <div className="mt-8">
        <AchievementsView />
      </div>
    </DashboardShell>
  );
}
