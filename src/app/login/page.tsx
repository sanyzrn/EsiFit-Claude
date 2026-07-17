import { Suspense } from "react";
import { createMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = createMetadata({ title: "Sign in", path: "/login" });

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center type-body-sm text-[var(--foreground-muted)]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
