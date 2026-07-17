import Link from "next/link";
import { articles, categoryLabels, estimateReadingMinutes, type ArticleCategory } from "@/content/articles";
import { createMetadata, siteConfig } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/card";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export const metadata = createMetadata({
  title: "Articles",
  description: "Training, nutrition, recovery, and science from the EsiFit editorial desk.",
  path: "/blog",
});

const categories: Array<"all" | ArticleCategory> = ["all", "training", "nutrition", "recovery", "science", "success-stories"];

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!isFeatureEnabled("BLOG")) notFound();

  const params = await searchParams;
  const category = (params.category as ArticleCategory | "all" | undefined) ?? "all";
  const filtered = category === "all" ? articles : articles.filter((a) => a.category === category);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${siteConfig.url}/blog` },
    ],
  };

  return (
    <div className="container-esi pb-24 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Content hub</p>
      <h1 className="type-h1 mt-3">Articles</h1>
      <p className="type-body-lg mt-4 max-w-2xl text-[var(--foreground-muted)]">
        Evidence-aware writing that funnels into calculators and the product — never fluff for fluff&apos;s sake.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="navigation" aria-label="Article categories">
        {categories.map((cat) => {
          const href = cat === "all" ? "/blog" : `/blog?category=${cat}`;
          const active = category === cat;
          return (
            <Link
              key={cat}
              href={href}
              className={`rounded-[var(--radius-full)] px-3 py-1.5 type-caption font-semibold ${
                active
                  ? "bg-[var(--mint)] text-[#04140e]"
                  : "bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat === "all" ? "All" : categoryLabels[cat]}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {filtered.map((article) => (
          <Link key={article.slug} href={`/blog/${article.category}/${article.slug}`}>
            <GlassCard interactive className="h-full p-6">
              <div className="flex items-center gap-2">
                <Badge variant="status">{categoryLabels[article.category]}</Badge>
                <span className="type-caption text-[var(--foreground-subtle)]">
                  {estimateReadingMinutes(article.content)} min read
                </span>
              </div>
              <h2 className="type-h3 mt-4">{article.title}</h2>
              <p className="type-body-sm mt-3 text-[var(--foreground-muted)]">{article.description}</p>
              <p className="type-caption mt-6 text-[var(--foreground-subtle)]">
                {article.author.name} · {article.publishedAt}
              </p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
