import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esifit.app";

export const siteConfig = {
  name: "EsiFit",
  tagline: "Your Body. Your Data. Your Progress.",
  description:
    "EsiFit is a premium digital fitness ecosystem — dashboards, workouts, nutrition, analytics, and calm coaching that puts your data to work.",
  url: siteUrl,
  ogImage: "/og/default.png",
  twitter: "@esifit",
} as const;

export function createMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = title ? `${title} · ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  const desc = description ?? siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const og = image ?? siteConfig.ogImage;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: og, width: 1200, height: 630, alt: fullTitle }],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [og],
    },
  };
}
