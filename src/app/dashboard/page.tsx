import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Your EsiFit dashboard — readiness, today's plan, and progress.",
  path: "/dashboard",
});

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardView />
    </DashboardShell>
  );
}
