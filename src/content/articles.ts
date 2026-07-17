export type ArticleCategory = "training" | "nutrition" | "recovery" | "science" | "success-stories";

export type Article = {
  slug: string;
  category: ArticleCategory;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  calculatorLink?: { href: string; label: string };
  author: {
    name: string;
    bio: string;
    avatar: string;
  };
  content: string[];
};

export const categoryLabels: Record<ArticleCategory, string> = {
  training: "Training",
  nutrition: "Nutrition",
  recovery: "Recovery",
  science: "Science",
  "success-stories": "Success Stories",
};

export const articles: Article[] = [
  {
    slug: "readiness-before-volume",
    category: "training",
    title: "Readiness before volume: training when your body can absorb it",
    description: "Why daily readiness beats rigid weekly volume targets for sustainable strength progress.",
    publishedAt: "2026-03-12",
    updatedAt: "2026-03-18",
    tags: ["readiness", "programming", "recovery"],
    calculatorLink: { href: "/#pricing", label: "Explore readiness scoring in VIP" },
    author: {
      name: "Dr. Lena Park",
      bio: "Exercise physiologist focused on load management and recovery markers.",
      avatar: "LP",
    },
    content: [
      "Most training plans fail not because the sets are wrong, but because the timing is.",
      "A readiness-aware week treats sleep, HRV trends, and residual soreness as inputs — not excuses.",
      "Start by protecting high-quality sessions for high-readiness days. Keep low-readiness days short, technical, and recoverable.",
      "This is the same philosophy behind EsiFit's Daily Readiness Score: clarity without guilt.",
      "When volume and readiness disagree, readiness wins. You can always add a set next week; you cannot refund a week of poor sleep.",
    ],
  },
  {
    slug: "protein-timing-without-myths",
    category: "nutrition",
    title: "Protein timing without the myths",
    description: "What actually matters for protein distribution — and what is gym folklore.",
    publishedAt: "2026-02-04",
    updatedAt: "2026-02-20",
    tags: ["protein", "nutrition", "hypertrophy"],
    calculatorLink: { href: "/#pricing", label: "Try nutrition tracking" },
    author: {
      name: "Noah Reyes, RD",
      bio: "Registered dietitian working with lifters who want simple, evidence-based fueling.",
      avatar: "NR",
    },
    content: [
      "Total daily protein still dominates outcomes. Timing is a refinement, not the foundation.",
      "Spreading intake across 3–5 meals is usually enough for most trainees — no need for midnight shakes unless it fits your life.",
      "Pair protein with training days that create demand, and keep carbs around sessions that need them.",
      "Use a calculator for targets, then adjust based on hunger, training quality, and recovery — not perfectionism.",
    ],
  },
  {
    slug: "sleep-as-a-training-variable",
    category: "recovery",
    title: "Treat sleep like a training variable",
    description: "How to log sleep quality in a way that actually changes tomorrow's plan.",
    publishedAt: "2026-01-22",
    updatedAt: "2026-01-28",
    tags: ["sleep", "recovery", "habits"],
    author: {
      name: "Aria Bennet",
      bio: "Performance coach specializing in sustainable athlete habits.",
      avatar: "AB",
    },
    content: [
      "If you track workouts but ignore sleep, you are reading half the dashboard.",
      "A simple 1–5 sleep quality score, paired with duration, is enough to steer session intensity.",
      "Missed sleep is not a moral failure — it is a programming input. Lower intensity, protect technique, and recover.",
    ],
  },
  {
    slug: "muscle-heatmaps-explained",
    category: "science",
    title: "Muscle heatmaps explained: volume you can actually see",
    description: "How anatomical volume maps turn messy set logs into a readable training picture.",
    publishedAt: "2026-04-02",
    updatedAt: "2026-04-02",
    tags: ["analytics", "anatomy", "volume"],
    author: {
      name: "Chris Okada",
      bio: "Sports scientist and data visualization nerd.",
      avatar: "CO",
    },
    content: [
      "A heatmap only helps if muscle groups map cleanly to your logged exercises.",
      "EsiFit's AnatomyBodyMap is built as a reusable SVG layer for exercise targets and later volume analytics.",
      "Color intensity should encode relative volume — not drama. Calm gradients beat neon alarms.",
    ],
  },
];

export function getArticle(category: string, slug: string) {
  return articles.find((a) => a.category === category && a.slug === slug);
}

export function getArticlesByCategory(category?: string) {
  if (!category || category === "all") return articles;
  return articles.filter((a) => a.category === category);
}

export function getRelatedArticles(article: Article, limit = 3) {
  return articles
    .filter((a) => a.slug !== article.slug && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, limit);
}

export function estimateReadingMinutes(paragraphs: string[]) {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
