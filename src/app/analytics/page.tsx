import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AnalyticsPage } from "@/components/analytics/analytics-page";

export const metadata = createMetadata({
  title: "Analytics",
  description: "Progress charts, muscle volume heatmap, and plain-language insights.",
  path: "/analytics",
});

export default function AnalyticsRoute() {
  return (
    <DashboardShell>
      <AnalyticsPage />
    </DashboardShell>
  );
}
