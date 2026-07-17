"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { delay, useAuthStore } from "@/stores/auth-store";

export function VerifyEmailScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const markEmailVerified = useAuthStore((s) => s.markEmailVerified);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function resend() {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await delay(600);
      toast.success("Verification email resent.");
      setCooldown(30);
    } finally {
      setLoading(false);
    }
  }

  async function simulateVerified() {
    setLoading(true);
    try {
      await delay(500);
      markEmailVerified();
      toast.success("Email verified. Let's personalize your setup.");
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Check your inbox"
      subtitle={`We sent a verification link to ${user?.email ?? "your email"}.`}
    >
      <div className="space-y-4">
        <p className="type-body-sm text-[var(--foreground-muted)]">
          Once verified, you&apos;ll walk through a short, skippable onboarding — then your dashboard.
        </p>
        <Button className="w-full" loading={loading} onClick={simulateVerified}>
          I&apos;ve verified my email
        </Button>
        <Button variant="secondary" className="w-full" disabled={cooldown > 0 || loading} onClick={resend}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => router.push("/login")}>
          Back to sign in
        </Button>
      </div>
    </AuthShell>
  );
}
