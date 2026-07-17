import { notFound } from "next/navigation";
import Link from "next/link";
import { CALCULATOR_CONFIGS, getCalculator } from "@/lib/calculators/config";
import { CalculatorShell } from "@/components/calculators/calculator-shell";
import { createMetadata } from "@/lib/seo";
import { isFeatureEnabled } from "@/lib/feature-flags";

type Params = { slug: string };

export function generateStaticParams() {
  return CALCULATOR_CONFIGS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) return {};
  return createMetadata({
    title: calc.name,
    description: calc.description.slice(0, 155),
    path: `/calculators/${calc.slug}`,
  });
}

export default async function CalculatorPage({ params }: { params: Promise<Params> }) {
  if (!isFeatureEnabled("CALCULATORS")) notFound();
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) notFound();

  return (
    <div className="container-esi pb-24 pt-28">
      <nav className="type-caption text-[var(--foreground-subtle)]">
        <Link href="/calculators" className="hover:text-[var(--foreground)]">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span>{calc.name}</span>
      </nav>
      <div className="mt-6">
        <CalculatorShell slug={calc.slug} />
      </div>
    </div>
  );
}
