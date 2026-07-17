"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { useShopStore } from "@/stores/shop-store";
import { useState } from "react";

export function CartCheckoutView({ mode }: { mode: "cart" | "checkout" }) {
  const products = useShopStore((s) => s.products);
  const cart = useShopStore((s) => s.cart);
  const setQty = useShopStore((s) => s.setQty);
  const removeFromCart = useShopStore((s) => s.removeFromCart);
  const cartTotal = useShopStore((s) => s.cartTotal);
  const discountPct = useShopStore((s) => s.discountPct);
  const giftBalance = useShopStore((s) => s.giftBalance);
  const checkoutStatus = useShopStore((s) => s.checkoutStatus);
  const startCheckout = useShopStore((s) => s.startCheckout);
  const pay = useShopStore((s) => s.pay);
  const resetCheckout = useShopStore((s) => s.resetCheckout);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!cart.length && checkoutStatus !== "success") {
    return (
      <GlassCard className="p-8 text-center">
        <p className="type-h4">Cart is empty</p>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">Browse programs and bundles in the store.</p>
        <Button className="mt-4" asChild>
          <Link href="/shop">Back to shop</Link>
        </Button>
      </GlassCard>
    );
  }

  if (checkoutStatus === "success") {
    return (
      <GlassCard className="p-8 text-center">
        <p className="type-caption text-[var(--mint)]">Order confirmed</p>
        <h2 className="type-h2 mt-2">You&apos;re all set</h2>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">Mock payment succeeded. No card was charged.</p>
        <Button className="mt-6" asChild>
          <Link href="/shop" onClick={resetCheckout}>
            Continue shopping
          </Link>
        </Button>
      </GlassCard>
    );
  }

  if (checkoutStatus === "failure") {
    return (
      <GlassCard className="p-8 text-center">
        <p className="type-caption text-[var(--gold)]">Payment failed</p>
        <h2 className="type-h2 mt-2">Try again</h2>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => void pay(true)}>Retry success</Button>
          <Button variant="secondary" onClick={resetCheckout}>
            Cancel
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        {cart.map((item) => {
          const p = products.find((x) => x.id === item.productId);
          if (!p) return null;
          return (
            <GlassCard key={item.productId} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="type-h4">{p.name}</p>
                <p className="type-body-sm text-[var(--foreground-muted)]">${p.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <TextInput
                  type="number"
                  className="w-20"
                  value={item.qty}
                  min={1}
                  onChange={(e) => setQty(item.productId, Number(e.target.value))}
                />
                <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.productId)}>
                  Remove
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="h-fit p-5">
        <h2 className="type-h4">Summary</h2>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
          Discount {discountPct}% · Gift credit ${giftBalance}
        </p>
        <p className="type-data-lg mt-4">${cartTotal()}</p>

        {mode === "cart" ? (
          <Button className="mt-4 w-full" asChild>
            <Link href="/shop/checkout" onClick={() => startCheckout()}>
              Checkout
            </Link>
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            {checkoutStatus === "processing" ? (
              <p className="type-body-sm text-[var(--plasma)]">Processing mock payment…</p>
            ) : (
              <>
                <TextInput placeholder="Name on card" value={name} onChange={(e) => setName(e.target.value)} />
                <TextInput placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextInput placeholder="Card •••• •••• •••• 4242" readOnly />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => void pay(true)} disabled={!name || !email}>
                    Pay
                  </Button>
                  <Button variant="secondary" onClick={() => void pay(false)}>
                    Fail
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
