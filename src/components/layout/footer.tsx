import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/blog", label: "Articles" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/#newsletter", label: "Newsletter" },
      { href: "/api/health", label: "Status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
      { href: "#", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--surface-glass-border)] bg-[var(--surface-1)]">
      <div className="container-esi grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-bold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--mint)] to-[var(--plasma)] text-[#04140e] type-data-sm font-bold">
              E
            </span>
            EsiFit
          </div>
          <p className="type-body-sm mt-4 max-w-xs text-[var(--foreground-muted)]">
            Your Body. Your Data. Your Progress. Calm, scientific coaching for people who train with intention.
          </p>
        </div>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h3 className="type-caption mb-4 font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              {col.title}
            </h3>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="type-body-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-esi border-t border-[var(--surface-glass-border)] py-6 type-caption text-[var(--foreground-subtle)]">
        © {new Date().getFullYear()} EsiFit. Built for clarity, not chaos.
      </div>
    </footer>
  );
}
