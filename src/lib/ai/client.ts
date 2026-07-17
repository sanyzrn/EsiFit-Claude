"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { AITouchpoint } from "@/lib/ai/types";

export type ClientAIResult = {
  text: string;
  provider: string;
  model: string;
  degraded: boolean;
  fallbackReason?: string;
  quota?: { used: number; limit: number; resetsAt: string };
};

function authHeaders() {
  const { user, status, expiresAt } = useAuthStore.getState();
  if (!user || status !== "authenticated" || !expiresAt) return null;
  return {
    "content-type": "application/json",
    "x-esifit-user-id": user.id,
    "x-esifit-user-tier": user.tier,
    "x-esifit-expires-at": String(expiresAt),
  };
}

export async function requestAIInsight(input: {
  prompt: string;
  touchpoint: AITouchpoint;
  context: Record<string, string | number | boolean | null>;
}): Promise<ClientAIResult> {
  const headers = authHeaders();
  if (!headers) {
    throw new Error("auth_required");
  }
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (res.status === 401) throw new Error("auth_required");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "AI request failed");
  }
  return res.json() as Promise<ClientAIResult>;
}

export async function fetchAIUsage() {
  const headers = authHeaders();
  if (!headers) return null;
  const res = await fetch("/api/ai/usage", { headers, cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
