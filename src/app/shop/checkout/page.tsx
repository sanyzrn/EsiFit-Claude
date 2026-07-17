import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CartCheckoutView } from "@/components/shop/cart-checkout";

export const metadata = createMetadata({ title: "Checkout", path: "/shop/checkout" });

export default function CheckoutPage() {
  return (
    <DashboardShell>
      <h1 className="type-h1">Checkout</h1>
      <p className="type-body-md mt-3 text-[var(--foreground-muted)]">Mock payment UI — no real charges.</p>
      <div className="mt-8">
        <CartCheckoutView mode="checkout" />
      </div>
    </DashboardShell>
  );
}
