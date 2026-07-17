"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { requestAIInsight, type ClientAIResult } from "@/lib/ai/client";
import type { AITouchpoint } from "@/lib/ai/types";

export function AIDisclaimer() {
  return (
    <p className="type-caption mt-2 text-[var(--foreground-subtle)]">
      EsiFit AI is educational, not medical advice. For diagnosis or treatment, talk to a clinician.
    </p>
  );
}

export function AIInsightPanel({
  touchpoint,
  prompt,
  context,
  title = "AI Insight",
  gatedForAnonymous = true,
}: {
  touchpoint: AITouchpoint;
  prompt: string;
  context: Record<string, string | number | boolean | null>;
  title?: string;
  gatedForAnonymous?: boolean;
}) {
  const flagOn = touchpoint === "chat" ? isFeatureEnabled("AI_CHAT") : isFeatureEnabled("AI_ANALYTICS");
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signedIn = !!user && status === "authenticated";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClientAIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooling, setCooling] = useState(false);

  if (!flagOn) return null;

  async function run() {
    if (cooling) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestAIInsight({ prompt, touchpoint, context });
      setResult(res);
      setCooling(true);
      window.setTimeout(() => setCooling(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (gatedForAnonymous && !signedIn) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 text-[var(--plasma)]" />
          <div>
            <p className="type-h4">{title}</p>
            <p className="type-body-sm mt-1 text-[var(--foreground-muted)]">
              Sign up to unlock your personalized AI report — free for every member.
            </p>
            <Button size="sm" className="mt-3" asChild>
              <Link href="/signup">Sign up to unlock AI</Link>
            </Button>
            <AIDisclaimer />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-4 text-[var(--mint)]" />
          <div>
            <p className="type-h4">{title}</p>
            <p className="type-caption text-[var(--foreground-subtle)]">Uses your profile + this result only</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          loading={loading}
          disabled={cooling}
          onClick={() => void run()}
        >
          {result ? "Refresh insight" : "Generate insight"}
        </Button>
      </div>
      {error ? <p className="type-body-sm mt-3 text-[var(--gold)]">{error}</p> : null}
      {result ? (
        <div className="mt-3">
          <p className="type-body-sm whitespace-pre-wrap text-[var(--foreground)]">{result.text}</p>
          {result.degraded ? (
            <p className="type-caption mt-2 text-[var(--gold)]">
              Showing standard fallback ({result.fallbackReason || "degraded"}).
            </p>
          ) : null}
          {result.quota ? (
            <p className="type-caption mt-2 text-[var(--foreground-subtle)]">
              Today: {result.quota.used}/{result.quota.limit} · resets {new Date(result.quota.resetsAt).toLocaleTimeString()}
            </p>
          ) : null}
          <p className="type-caption mt-1 text-[var(--foreground-subtle)]">
            {result.provider}/{result.model}
          </p>
          <AIDisclaimer />
        </div>
      ) : (
        <AIDisclaimer />
      )}
    </GlassCard>
  );
}
