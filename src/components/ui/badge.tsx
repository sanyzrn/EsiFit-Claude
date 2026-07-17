import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 type-caption font-semibold tracking-wide",
  {
    variants: {
      variant: {
        free: "bg-[var(--surface-2)] text-[var(--foreground-muted)]",
        vip: "bg-[var(--plasma-dim)] text-[var(--plasma-bright)]",
        "vip-plus": "bg-[var(--gold-dim)] text-[var(--gold-bright)]",
        coach: "bg-[var(--mint-dim)] text-[var(--mint)]",
        status: "bg-[var(--surface-3)] text-[var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "status",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
