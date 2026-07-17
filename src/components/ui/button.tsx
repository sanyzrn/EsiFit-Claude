"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] type-body-sm font-semibold transition-[transform,box-shadow,background-color,color,opacity] duration-[var(--duration-snappy)] ease-[var(--ease-snappy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--mint)] text-[#04140e] hover:bg-[var(--mint-bright)] shadow-[var(--shadow-rest)] hover:shadow-[var(--glow-mint)]",
        secondary:
          "bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--surface-glass-border)] hover:bg-[var(--surface-3)]",
        ghost: "bg-transparent text-[var(--foreground-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
        "gradient-glow":
          "bg-gradient-to-r from-[var(--mint)] to-[var(--plasma)] text-[#04140e] shadow-[var(--glow-mint)] hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 type-body-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {children}
      </>
    );
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
