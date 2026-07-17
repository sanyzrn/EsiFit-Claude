"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserProfile, UserTier } from "@/lib/types";
import { DEFAULT_PROFILE, TIER_TO_ROLE } from "@/lib/types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days mock expiry
const AUTH_CHANNEL = "esifit-auth-sync";

export type AuthStatus = "anonymous" | "authenticated" | "expired";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  expiresAt: number | null;
  rememberMe: boolean;
  login: (user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setTier: (tier: UserTier) => void;
  markEmailVerified: () => void;
  hydrateFromStorage: () => void;
  checkExpiry: () => void;
};

function makeUser(partial: Partial<User> & Pick<User, "email" | "name" | "tier">): User {
  const tier = partial.tier;
  return {
    id: partial.id ?? `user_${Math.random().toString(36).slice(2, 10)}`,
    email: partial.email,
    name: partial.name,
    role_id: tier,
    role: TIER_TO_ROLE[tier],
    tier,
    created_at: partial.created_at ?? new Date().toISOString(),
    emailVerified: partial.emailVerified ?? false,
    profile: { ...DEFAULT_PROFILE, ...partial.profile },
  };
}

function broadcast(type: "login" | "logout" | "profile", payload?: unknown) {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage({ type, payload });
    channel.close();
  } catch {
    // BroadcastChannel unsupported — storage event still covers most cases via persist
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "anonymous",
      expiresAt: null,
      rememberMe: true,

      login: (user, rememberMe = true) => {
        const expiresAt = Date.now() + SESSION_TTL_MS;
        set({ user, status: "authenticated", expiresAt, rememberMe });
        broadcast("login", { user, expiresAt, rememberMe });
      },

      logout: () => {
        set({ user: null, status: "anonymous", expiresAt: null });
        broadcast("logout");
      },

      updateProfile: (patch) => {
        const { user } = get();
        if (!user) return;
        const next = {
          ...user,
          profile: { ...user.profile, ...patch },
        };
        set({ user: next });
        broadcast("profile", next);
      },

      setTier: (tier) => {
        const { user } = get();
        if (!user) return;
        const next = {
          ...user,
          tier,
          role_id: tier,
          role: TIER_TO_ROLE[tier],
        };
        set({ user: next });
        broadcast("profile", next);
      },

      markEmailVerified: () => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, emailVerified: true } });
      },

      hydrateFromStorage: () => {
        get().checkExpiry();
      },

      checkExpiry: () => {
        const { expiresAt, status, user } = get();
        if (status === "authenticated" && expiresAt && Date.now() > expiresAt) {
          set({ user: user ? { ...user } : null, status: "expired", expiresAt: null });
        }
      },
    }),
    {
      name: "esifit-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        status: s.status,
        expiresAt: s.expiresAt,
        rememberMe: s.rememberMe,
      }),
    },
  ),
);

export function createMockUser(input: {
  email: string;
  name: string;
  tier?: UserTier;
  verified?: boolean;
}): User {
  return makeUser({
    email: input.email,
    name: input.name,
    tier: input.tier ?? "free",
    emailVerified: input.verified ?? true,
  });
}

export function delay(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wire cross-tab sync once on the client */
export function initAuthCrossTabSync() {
  if (typeof window === "undefined") return () => undefined;

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = (event) => {
      const { type, payload } = event.data ?? {};
      if (type === "logout") {
        useAuthStore.setState({ user: null, status: "anonymous", expiresAt: null });
      } else if (type === "login" && payload) {
        useAuthStore.setState({
          user: payload.user,
          status: "authenticated",
          expiresAt: payload.expiresAt,
          rememberMe: payload.rememberMe,
        });
      } else if (type === "profile" && payload) {
        useAuthStore.setState({ user: payload });
      }
    };
  } catch {
    channel = null;
  }

  const onStorage = (e: StorageEvent) => {
    if (e.key !== "esifit-auth") return;
    useAuthStore.persist.rehydrate();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}

export { SESSION_TTL_MS, AUTH_CHANNEL };
