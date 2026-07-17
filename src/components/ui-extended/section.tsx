import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-3)]",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="type-caption mb-3 font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">{eyebrow}</p>
      ) : null}
      <h2 className="type-h2 text-[var(--foreground)]">{title}</h2>
      {description ? <p className="type-body-lg mt-4 text-[var(--foreground-muted)]">{description}</p> : null}
    </div>
  );
}
