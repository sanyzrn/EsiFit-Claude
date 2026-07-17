import { createMetadata } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CartCheckoutView } from "@/components/shop/cart-checkout";

export const metadata = createMetadata({ title: "Cart", path: "/shop/cart" });

export default function CartPage() {
  return (
    <DashboardShell>
      <h1 className="type-h1">Cart</h1>
      <div className="mt-8">
        <CartCheckoutView mode="cart" />
      </div>
    </DashboardShell>
  );
}
