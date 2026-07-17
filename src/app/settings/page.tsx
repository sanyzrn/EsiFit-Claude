import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsInstallPanel } from "@/components/settings/install-panel";

export const metadata = createMetadata({ title: "Settings", path: "/settings" });

export default function SettingsPage() {
  return (
    <DashboardShell>
      <h1 className="type-h1">Settings</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">Installability and preferences.</p>
      <div className="mt-8 max-w-2xl">
        <SettingsInstallPanel />
      </div>
    </DashboardShell>
  );
}
