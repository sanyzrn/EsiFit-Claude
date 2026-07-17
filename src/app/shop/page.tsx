import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({
  title: "Store",
  description: "Programs, subscriptions, bundles, and gift cards.",
  path: "/shop",
});

export default function ShopPage() {
  if (!isFeatureEnabled("SHOP") && !isFeatureEnabled("STORE")) notFound();
  return (
    <DashboardShell>
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Store</p>
      <h1 className="type-h1 mt-3">Shop</h1>
      <p className="type-body-lg mt-4 max-w-2xl text-[var(--foreground-muted)]">
        Programs and memberships in the EsiFit visual language — mock checkout only.
      </p>
      <div className="mt-8">
        <ShopCatalog />
      </div>
    </DashboardShell>
  );
}
