import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articles,
  categoryLabels,
  estimateReadingMinutes,
  getArticle,
  getRelatedArticles,
} from "@/content/articles";
import { createMetadata, siteConfig } from "@/lib/seo";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";

type Params = { category: string; slug: string };

export function generateStaticParams() {
  return articles.map((a) => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const article = getArticle(category, slug);
  if (!article) return {};
  return createMetadata({
    title: article.title.slice(0, 55),
    description: article.description.slice(0, 155),
    path: `/blog/${article.category}/${article.slug}`,
    type: "article",
  });
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  if (!isFeatureEnabled("BLOG")) notFound();
  const { category, slug } = await params;
  const article = getArticle(category, slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);
  const minutes = estimateReadingMinutes(article.content);
  const mid = Math.floor(article.content.length / 2);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: article.author.name },
    image: siteConfig.ogImage,
    mainEntityOfPage: `${siteConfig.url}/blog/${article.category}/${article.slug}`,
  };

  return (
    <article className="container-esi max-w-3xl pb-24 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <nav className="type-caption text-[var(--foreground-subtle)]" aria-label="Breadcrumb">
        <Link href="/blog" className="hover:text-[var(--foreground)]">
          Articles
        </Link>
        <span className="mx-2">/</span>
        <span>{categoryLabels[article.category]}</span>
      </nav>

      <Badge variant="status" className="mt-6">
        {categoryLabels[article.category]}
      </Badge>
      <h1 className="type-h1 mt-4">{article.title}</h1>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mint-dim)] type-caption font-bold text-[var(--mint)]">
          {article.author.avatar}
        </div>
        <div>
          <p className="type-body-sm font-semibold">{article.author.name}</p>
          <p className="type-caption text-[var(--foreground-muted)]">{article.author.bio}</p>
        </div>
      </div>
      <p className="type-caption mt-4 text-[var(--foreground-subtle)]">
        Published {article.publishedAt} · Updated {article.updatedAt} · {minutes} min read
      </p>

      {article.content.length > 2 ? (
        <aside className="mt-10 rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-1)] p-5">
          <p className="type-caption font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">On this page</p>
          <ol className="mt-3 space-y-2">
            {article.content.slice(0, 4).map((para, i) => (
              <li key={i}>
                <a href={`#s-${i}`} className="type-body-sm text-[var(--plasma)] hover:underline">
                  {para.slice(0, 48)}…
                </a>
              </li>
            ))}
          </ol>
        </aside>
      ) : null}

      <div className="prose-esi mt-10 space-y-6">
        {article.content.map((para, i) => (
          <div key={i}>
            <p id={`s-${i}`} className="type-body-lg text-[var(--foreground)]">
              {para}
            </p>
            {i === mid && article.calculatorLink ? (
              <GlassCard className="my-8 p-5">
                <p className="type-h4">Put this into practice</p>
                <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
                  Calculators stay usable without an account — sign up later if you want history or AI insight.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={article.calculatorLink.href}>{article.calculatorLink.label}</Link>
                </Button>
              </GlassCard>
            ) : null}
          </div>
        ))}
      </div>

      <GlassCard className="mt-12 p-6">
        <p className="type-h4">Ready for your own dashboard?</p>
        <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
          Start free and keep the calm clarity you just read about.
        </p>
        <Button className="mt-4" variant="gradient-glow" asChild>
          <Link href="/#pricing">Start free</Link>
        </Button>
      </GlassCard>

      {related.length ? (
        <section className="mt-16">
          <h2 className="type-h3">Related articles</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.category}/${r.slug}`} className="type-body-sm font-semibold text-[var(--plasma)] hover:underline">
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
