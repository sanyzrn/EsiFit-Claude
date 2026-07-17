"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/mock/growth";

type CartItem = { productId: string; qty: number };

type CheckoutStatus = "idle" | "form" | "processing" | "success" | "failure";

type ShopState = {
  products: ShopProduct[];
  cart: CartItem[];
  coupon: string;
  couponStatus: "idle" | "valid" | "invalid" | "expired";
  discountPct: number;
  giftBalance: number;
  checkoutStatus: CheckoutStatus;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  applyCoupon: (code: string) => void;
  redeemGift: (code: string) => void;
  clearCart: () => void;
  startCheckout: () => void;
  pay: (succeed?: boolean) => Promise<void>;
  resetCheckout: () => void;
  cartTotal: () => number;
};

const VALID_COUPONS: Record<string, number> = {
  ESIFIT10: 10,
  WELCOME20: 20,
};
const EXPIRED = new Set(["OLD50"]);
const GIFT_CODES: Record<string, number> = {
  GIFT50: 50,
  GIFT25: 25,
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      products: SHOP_PRODUCTS,
      cart: [],
      coupon: "",
      couponStatus: "idle",
      discountPct: 0,
      giftBalance: 0,
      checkoutStatus: "idle",

      addToCart: (productId) => {
        const existing = get().cart.find((c) => c.productId === productId);
        if (existing) {
          set({
            cart: get().cart.map((c) =>
              c.productId === productId ? { ...c, qty: c.qty + 1 } : c,
            ),
          });
        } else {
          set({ cart: [...get().cart, { productId, qty: 1 }] });
        }
        toast.success("Added to cart");
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((c) => c.productId !== productId) });
      },

      setQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        });
      },

      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        if (EXPIRED.has(normalized)) {
          set({ coupon: normalized, couponStatus: "expired", discountPct: 0 });
          toast.error("Coupon expired");
          return;
        }
        const pct = VALID_COUPONS[normalized];
        if (!pct) {
          set({ coupon: normalized, couponStatus: "invalid", discountPct: 0 });
          toast.error("Invalid coupon");
          return;
        }
        set({ coupon: normalized, couponStatus: "valid", discountPct: pct });
        toast.success(`${pct}% off applied`);
      },

      redeemGift: (code) => {
        const normalized = code.trim().toUpperCase();
        const amount = GIFT_CODES[normalized];
        if (!amount) {
          toast.error("Gift code not found");
          return;
        }
        set({ giftBalance: get().giftBalance + amount });
        toast.success(`$${amount} gift balance added`);
      },

      clearCart: () => set({ cart: [], coupon: "", couponStatus: "idle", discountPct: 0 }),

      startCheckout: () => {
        if (!get().cart.length) {
          toast.message("Cart is empty");
          return;
        }
        set({ checkoutStatus: "form" });
      },

      pay: async (succeed = true) => {
        set({ checkoutStatus: "processing" });
        await new Promise((r) => setTimeout(r, 900));
        if (!succeed) {
          set({ checkoutStatus: "failure" });
          toast.error("Payment failed (mock)");
          return;
        }
        set({ checkoutStatus: "success" });
        get().clearCart();
        toast.success("Order complete (mock)");
      },

      resetCheckout: () => set({ checkoutStatus: "idle" }),

      cartTotal: () => {
        const { cart, products, discountPct, giftBalance } = get();
        const sub = cart.reduce((sum, item) => {
          const p = products.find((x) => x.id === item.productId);
          return sum + (p?.price ?? 0) * item.qty;
        }, 0);
        const discounted = sub * (1 - discountPct / 100);
        return Math.max(0, Math.round((discounted - giftBalance) * 100) / 100);
      },
    }),
    { name: "esifit-shop" },
  ),
);
