import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NutritionModule } from "@/components/nutrition/nutrition-module";
import { OfflineIndicator } from "@/components/offline/offline-indicator";

export const metadata = createMetadata({
  title: "Nutrition",
  description: "Meal logging, macros, water, recipes, and shopping list.",
  path: "/nutrition",
});

export default function NutritionPage() {
  return (
    <DashboardShell>
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Fuel</p>
      <h1 className="type-h1 mt-3">Nutrition</h1>
      <div className="mt-8">
        <NutritionModule />
      </div>
      <OfflineIndicator />
    </DashboardShell>
  );
}
