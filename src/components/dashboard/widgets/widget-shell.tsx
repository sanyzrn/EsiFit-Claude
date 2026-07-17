"use client";

import Link from "next/link";
import { GripVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui-extended/section";
import { cn } from "@/lib/utils";

export function WidgetShell({
  title,
  children,
  loading,
  error,
  onRetry,
  empty,
  emptyMessage = "Nothing here yet — start with a small win today.",
  locked,
  lockReason = "Available on VIP",
  className,
  dragHandleProps,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  locked?: boolean;
  lockReason?: string;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <GlassCard className={cn("flex h-full flex-col p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="type-h4">{title}</h3>
        {dragHandleProps ? (
          <button
            type="button"
            className="rounded-[var(--radius-sm)] p-1 text-[var(--foreground-subtle)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            aria-label={`Reorder ${title}`}
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-2/3 max-w-[66%]" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <p className="type-body-sm text-[var(--error)]">{error}</p>
          {onRetry ? (
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      ) : locked ? (
        <div className="flex flex-1 flex-col justify-center rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)]/60 p-4">
          <p className="type-body-sm font-semibold">{lockReason}</p>
          <p className="type-caption mt-2 text-[var(--foreground-muted)]">
            Upgrade when you&apos;re ready — Free still covers the essentials.
          </p>
          <Button size="sm" className="mt-4 w-fit" variant="secondary" asChild>
            <Link href="/#pricing">See plans</Link>
          </Button>
        </div>
      ) : empty ? (
        <p className="type-body-sm text-[var(--foreground-muted)]">{emptyMessage}</p>
      ) : (
        <div className="flex-1">{children}</div>
      )}
    </GlassCard>
  );
}
