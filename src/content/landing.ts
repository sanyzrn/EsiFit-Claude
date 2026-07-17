export const landingContent = {
  hero: {
    brand: "EsiFit",
    headline: "Train with clarity.",
    subhead:
      "Your Body. Your Data. Your Progress. A calm fitness operating system for workouts, nutrition, recovery, and the metrics that matter.",
    primaryCta: { label: "Start free", href: "/#pricing" },
    secondaryCta: { label: "Explore articles", href: "/blog" },
  },
  features: [
    {
      title: "Tesla-grade dashboard",
      description: "Know what to do today in three seconds — readiness, today's plan, and your next action, never a wall of widgets.",
      icon: "LayoutDashboard",
    },
    {
      title: "Workout engine",
      description: "Session-first tracking that stays out of your way mid-set, then becomes rich history the moment you finish.",
      icon: "Dumbbell",
    },
    {
      title: "Nutrition with context",
      description: "Macros that connect to training load and recovery — not a guilt-driven calorie spreadsheet.",
      icon: "Apple",
    },
    {
      title: "Progress analytics",
      description: "Signature visualizations — muscle heat maps, readiness rings, streak calendars — built for legibility.",
      icon: "LineChart",
    },
    {
      title: "Quiet gamification",
      description: "Missions and streaks that reward consistency without toxic fitness culture language.",
      icon: "Trophy",
    },
    {
      title: "Community that lifts",
      description: "Challenges and shared progress with encouragement baked in — never shame for a missed week.",
      icon: "Users",
    },
  ],
  testimonials: [
    {
      quote: "I finally open an app and immediately know what matters today. No scroll treasure hunt.",
      name: "Maya Chen",
      role: "Strength coach",
      avatar: "MC",
    },
    {
      quote: "The readiness score stopped me from grinding through fatigue. Progress feels calmer and more consistent.",
      name: "Jordan Ellis",
      role: "Endurance athlete",
      avatar: "JE",
    },
    {
      quote: "Calculators that work without an account sold me — then the dashboard kept me.",
      name: "Sam Okonkwo",
      role: "Product designer",
      avatar: "SO",
    },
  ],
  pricing: {
    billingNote: "Yearly saves two months. Switch anytime.",
    tiers: [
      {
        id: "free",
        name: "Free",
        monthly: 0,
        yearly: 0,
        badge: "free" as const,
        description: "Core tracking and public calculators.",
        features: ["Dashboard basics", "16 calculators (core flow)", "Workout & water logs", "Public articles"],
        cta: "Start free",
        highlighted: false,
      },
      {
        id: "vip",
        name: "VIP",
        monthly: 19,
        yearly: 190,
        badge: "vip" as const,
        description: "Deeper analytics and saved calculator history.",
        features: ["Everything in Free", "Progress analytics", "Saved calculator history", "Comparison mode"],
        cta: "Go VIP",
        highlighted: true,
      },
      {
        id: "vip-plus",
        name: "VIP+",
        monthly: 39,
        yearly: 390,
        badge: "vip-plus" as const,
        description: "Premium coaching surface with elevated polish.",
        features: ["Everything in VIP", "Priority insights", "Weekly recap cards", "Gold-tier community badges"],
        cta: "Go VIP+",
        highlighted: false,
      },
    ],
  },
  faq: [
    {
      q: "Do I need an account to use the calculators?",
      a: "No. Every calculator's core calculate → result flow works anonymously. Saving history, comparison mode, share cards, and AI insights require an account.",
    },
    {
      q: "Is there a real backend yet?",
      a: "Phases 1–5 run on a frontend-first mock architecture so we can lock UX before schema. A production backend arrives in Phase 6.",
    },
    {
      q: "Will EsiFit work offline at the gym?",
      a: "Workout and water/nutrition quick-log support offline queues (Phase 3). Full-app offline is intentionally out of scope.",
    },
    {
      q: "How is the tone different from other fitness apps?",
      a: "We never shame a missed workout. Progress language stays calm, scientific, and encouraging — by design, not accident.",
    },
  ],
  finalCta: {
    title: "Ready when you are.",
    description: "Build a training practice that respects your data — and your nervous system.",
    cta: { label: "Create your free account", href: "/#pricing" },
  },
} as const;
