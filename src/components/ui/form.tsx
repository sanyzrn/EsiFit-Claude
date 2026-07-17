"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="type-body-sm font-semibold text-[var(--foreground)]">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="type-caption text-[var(--foreground-subtle)]">{hint}</p> : null}
      {error ? (
        <p className="type-caption text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "h-11 w-full rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-3 type-body-md text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--foreground-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] aria-[invalid=true]:border-[var(--error)]";

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function PasswordStrength({ password }: { password: string }) {
  const score = React.useMemo(() => {
    let s = 0;
    if (password.length >= 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  }, [password]);

  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["var(--error)", "var(--warning)", "var(--plasma)", "var(--mint)", "var(--mint-bright)"];

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full bg-[var(--surface-3)]"
            style={{ background: i < score ? colors[score] : undefined }}
          />
        ))}
      </div>
      <p className="type-caption text-[var(--foreground-muted)]">{password ? labels[score] : "Use 8+ characters with mixed types"}</p>
    </div>
  );
}
