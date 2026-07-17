"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextInput } from "@/components/ui/form";
import { useShopStore } from "@/stores/shop-store";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { useState } from "react";

export function ShopCatalog() {
  const shopOn = isFeatureEnabled("SHOP") && isFeatureEnabled("STORE");
  const products = useShopStore((s) => s.products);
  const addToCart = useShopStore((s) => s.addToCart);
  const cart = useShopStore((s) => s.cart);
  const applyCoupon = useShopStore((s) => s.applyCoupon);
  const redeemGift = useShopStore((s) => s.redeemGift);
  const couponStatus = useShopStore((s) => s.couponStatus);
  const giftBalance = useShopStore((s) => s.giftBalance);
  const [coupon, setCoupon] = useState("");
  const [gift, setGift] = useState("");

  if (!shopOn) {
    return <p className="type-body-md text-[var(--foreground-muted)]">Store is disabled.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-body-sm text-[var(--foreground-muted)]">{cart.length} items in cart</p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/shop/cart">View cart</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <GlassCard key={p.id} interactive className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="status">{p.kind.replace("_", " ")}</Badge>
              {p.badge ? <Badge variant="vip">{p.badge}</Badge> : null}
            </div>
            <h2 className="type-h4 mt-3">{p.name}</h2>
            <p className="type-body-sm mt-2 flex-1 text-[var(--foreground-muted)]">{p.description}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="type-data-md">${p.price}</span>
              <Button size="sm" onClick={() => addToCart(p.id)}>
                Add
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-4">
          <h3 className="type-h4">Coupon</h3>
          <p className="type-caption mt-1 text-[var(--foreground-subtle)]">Try ESIFIT10, WELCOME20, or OLD50 (expired)</p>
          <div className="mt-3 flex gap-2">
            <TextInput value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Code" />
            <Button size="sm" variant="secondary" onClick={() => applyCoupon(coupon)}>
              Apply
            </Button>
          </div>
          {couponStatus !== "idle" ? (
            <p className="type-caption mt-2 text-[var(--foreground-muted)]">Status: {couponStatus}</p>
          ) : null}
        </GlassCard>
        <GlassCard className="p-4">
          <h3 className="type-h4">Redeem gift card</h3>
          <p className="type-caption mt-1 text-[var(--foreground-subtle)]">Try GIFT50 or GIFT25 · Balance ${giftBalance}</p>
          <div className="mt-3 flex gap-2">
            <TextInput value={gift} onChange={(e) => setGift(e.target.value)} placeholder="Gift code" />
            <Button size="sm" variant="secondary" onClick={() => redeemGift(gift)}>
              Redeem
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
