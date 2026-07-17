"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { useAuthStore } from "@/stores/auth-store";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { requestAIInsight } from "@/lib/ai/client";
import { AIDisclaimer } from "@/components/ai/ai-insight-panel";
import Link from "next/link";
import { sanitizeUserText } from "@/lib/sanitize";

type Msg = { role: "user" | "assistant"; text: string };

export function AskAIBubble() {
  const enabled = isFeatureEnabled("AI_CHAT");
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signedIn = !!user && status === "authenticated";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("esifit:open-ask-ai", onOpen);
    return () => window.removeEventListener("esifit:open-ask-ai", onOpen);
  }, []);

  if (!enabled) return null;

  async function send() {
    const cleaned = sanitizeUserText(draft, 500);
    if (!cleaned || !signedIn) return;
    setDraft("");
    setMsgs((m) => [...m, { role: "user", text: cleaned }]);
    setLoading(true);
    try {
      const res = await requestAIInsight({
        touchpoint: "chat",
        prompt: cleaned,
        context: {
          name: user?.name ?? null,
          tier: user?.tier ?? null,
          goal: user?.profile.primaryGoal ?? null,
          experience: user?.profile.experienceLevel ?? null,
        },
      });
      setMsgs((m) => [...m, { role: "assistant", text: res.text }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: "AI is temporarily unavailable. Try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="fixed bottom-5 right-5 z-40 shadow-[var(--shadow-float)]"
        size="lg"
        onClick={() => setOpen(true)}
        aria-label="Ask EsiFit AI"
      >
        <MessageCircle className="size-4" />
        Ask AI
      </Button>
      {open ? (
        <div className="fixed bottom-20 right-5 z-50 flex h-[min(28rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--surface-glass-border)] bg-[var(--surface-1)] shadow-[var(--shadow-float)]">
          <div className="flex items-center justify-between border-b border-[var(--surface-glass-border)] px-4 py-3">
            <div>
              <p className="type-h4">Ask EsiFit AI</p>
              <p className="type-caption text-[var(--foreground-subtle)]">Fitness & nutrition only</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Close" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!signedIn ? (
              <div className="type-body-sm text-[var(--foreground-muted)]">
                Sign in to use Ask EsiFit AI.{" "}
                <Link href="/signup" className="text-[var(--plasma)] hover:underline">
                  Sign up
                </Link>
              </div>
            ) : msgs.length === 0 ? (
              <p className="type-body-sm text-[var(--foreground-muted)]">
                Ask about training splits, protein targets, or recovery — grounded in your profile.
              </p>
            ) : (
              msgs.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-[var(--radius-md)] px-3 py-2 type-body-sm ${
                    m.role === "user" ? "ml-6 bg-[var(--mint-dim)]" : "mr-6 bg-[var(--surface-2)]"
                  }`}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-[var(--surface-glass-border)] p-3">
            <div className="flex gap-2">
              <TextInput
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={signedIn ? "Ask a question…" : "Sign in to chat"}
                disabled={!signedIn || loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
              />
              <Button size="sm" disabled={!signedIn || loading} onClick={() => void send()}>
                Send
              </Button>
            </div>
            <AIDisclaimer />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function openAskAI() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("esifit:open-ask-ai"));
  }
}
