"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchAIUsage } from "@/lib/ai/client";
import { DAILY_AI_QUOTA } from "@/lib/ai/quota";
import { useAuthStore } from "@/stores/auth-store";

type UsagePayload = {
  status: { provider: string; model: string; configured: boolean };
  quota?: { used: number; limit: number; remaining: number; resetsAt: string };
  usage: {
    id: string;
    touchpoint: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    createdAt: string;
    ok: boolean;
    error?: string;
  }[];
};

export function AISettingsPanel() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<UsagePayload | null>(null);

  useEffect(() => {
    void fetchAIUsage().then((d) => setData(d as UsagePayload | null));
  }, [user?.id]);

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <h2 className="type-h4">AI provider (server config)</h2>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
          Keys live in environment variables only — never in the browser. Set{" "}
          <code className="type-caption">AI_PROVIDER</code>, model, and the matching API key.
        </p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 type-body-sm">
          <div>
            <dt className="type-caption text-[var(--foreground-subtle)]">Active provider</dt>
            <dd className="mt-1 font-semibold">{data?.status.provider ?? "…"}</dd>
          </div>
          <div>
            <dt className="type-caption text-[var(--foreground-subtle)]">Model</dt>
            <dd className="mt-1 font-semibold">{data?.status.model ?? "…"}</dd>
          </div>
        </dl>
        <p className="type-caption mt-3 text-[var(--foreground-subtle)]">
          Supported: anthropic · gemini · openrouter · custom · mock (auto when no key)
        </p>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="type-h4">Your daily quota</h2>
        {data?.quota ? (
          <p className="type-body-sm mt-2">
            {data.quota.used}/{data.quota.limit} used · resets{" "}
            {new Date(data.quota.resetsAt).toLocaleString()}
          </p>
        ) : (
          <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">Sign in to see quota.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(DAILY_AI_QUOTA).map(([tier, n]) => (
            <Badge key={tier} variant="status">
              {tier}: {n}/day
            </Badge>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="type-h4">Token usage log</h2>
        <p className="type-caption mt-1 text-[var(--foreground-subtle)]">
          Prompt/completion counts only — full prompt text is not stored.
        </p>
        {!data?.usage?.length ? (
          <p className="type-body-sm mt-3 text-[var(--foreground-muted)]">No AI calls logged yet.</p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-auto">
            {data.usage.map((u) => (
              <li key={u.id} className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-2 type-caption">
                <span className="font-semibold">{u.touchpoint}</span> · {u.provider}/{u.model} ·{" "}
                {u.promptTokens}+{u.completionTokens} tok · {new Date(u.createdAt).toLocaleString()}
                {!u.ok ? ` · fail (${u.error})` : ""}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
