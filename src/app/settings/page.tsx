import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsInstallPanel } from "@/components/settings/install-panel";
import { ReminderSettings, NotificationCenter } from "@/components/notifications/notification-center";
import { AISettingsPanel } from "@/components/ai/ai-settings-panel";

export const metadata = createMetadata({ title: "Settings", path: "/settings" });

export default function SettingsPage() {
  return (
    <DashboardShell>
      <h1 className="type-h1">Settings</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">
        Installability, AI usage, reminders, and notifications.
      </p>
      <div className="mt-8 max-w-2xl space-y-6">
        <SettingsInstallPanel />
        <AISettingsPanel />
        <ReminderSettings />
        <div>
          <h2 className="type-h4 mb-3">Notification center</h2>
          <NotificationCenter />
        </div>
      </div>
    </DashboardShell>
  );
}
