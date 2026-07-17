import Link from "next/link";
import { CALCULATOR_CONFIGS } from "@/lib/calculators/config";
import { createMetadata } from "@/lib/seo";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({
  title: "Calculators",
  description: "16 free fitness calculators — BMI, TDEE, macros, 1RM, and more. No account required for core results.",
  path: "/calculators",
});

export default function CalculatorsIndexPage() {
  if (!isFeatureEnabled("CALCULATORS")) notFound();

  return (
    <div className="container-esi pb-24 pt-28">
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Tools</p>
      <h1 className="type-h1 mt-3">Calculators</h1>
      <p className="type-body-lg mt-4 max-w-2xl text-[var(--foreground-muted)]">
        Every calculator&apos;s core flow works without login. Save history, compare, and share after you sign in.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATOR_CONFIGS.map((c) => (
          <Link key={c.id} href={`/calculators/${c.slug}`}>
            <GlassCard interactive className="h-full p-5">
              <Badge variant="status">{c.category}</Badge>
              <h2 className="type-h4 mt-3">{c.name}</h2>
              <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">{c.description}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
