import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CommunityFeed } from "@/components/community/community-feed";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({
  title: "Community",
  description: "Feed, transformation stories, and social engagement.",
  path: "/community",
});

export default function CommunityPage() {
  if (!isFeatureEnabled("COMMUNITY")) notFound();
  return (
    <DashboardShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Community</p>
          <h1 className="type-h1 mt-3">Feed</h1>
        </div>
        <div className="flex flex-wrap gap-2 type-body-sm">
          <Link className="text-[var(--plasma)] hover:underline" href="/community/challenges">
            Challenges
          </Link>
          <Link className="text-[var(--plasma)] hover:underline" href="/community/leaderboard">
            Leaderboard
          </Link>
          <Link className="text-[var(--plasma)] hover:underline" href="/recap">
            Weekly recap
          </Link>
        </div>
      </div>
      <div className="mt-8 max-w-2xl">
        <CommunityFeed />
      </div>
    </DashboardShell>
  );
}
