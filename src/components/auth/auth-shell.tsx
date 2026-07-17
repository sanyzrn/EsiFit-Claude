import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] gradient-hero px-4 pb-16 pt-28">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-bold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--mint)] to-[var(--plasma)] text-[#04140e] type-data-sm font-bold">
            E
          </span>
          EsiFit
        </Link>
        <div className="glass rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-raised)] sm:p-8">
          <h1 className="type-h2">{title}</h1>
          {subtitle ? <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-6 text-center type-body-sm text-[var(--foreground-muted)]">{footer}</div> : null}
      </div>
    </div>
  );
}
