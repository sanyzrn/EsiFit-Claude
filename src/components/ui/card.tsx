import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-1)] shadow-[var(--shadow-rest)]",
        className,
      )}
      {...props}
    />
  );
}

export function GlassCard({
  className,
  elevated = false,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-[var(--radius-md)] shadow-[var(--shadow-rest)] transition-[transform,box-shadow,border-color] duration-[var(--duration-snappy)] ease-[var(--ease-snappy)]",
        elevated && "shadow-[var(--shadow-raised)]",
        interactive && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] hover:border-[color-mix(in_srgb,var(--mint)_35%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
