# EsiFit — Phase 1: Foundation (Brand, Design System, Landing Page)

## Context

You are building **EsiFit**, a premium digital fitness ecosystem — think Apple Fitness+, WHOOP, Tesla's dashboard, Linear, and Strava, not a gym website. Tagline: *"Your Body. Your Data. Your Progress."*

Personality: confident, elegant, modern, scientific, motivational — **never aggressive**, never a bodybuilding cliché. No flames, no fire, no noisy gradients, no cheap effects, no outdated layouts.

This is **Phase 1 of a multi-phase build**. Scope for this phase only: **brand identity, design system, component library, and the public landing page.** No auth, no dashboard, no backend. This must run as a static/mock frontend with `npm run dev`.

## Tech Stack (frontend only, this phase)

- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- shadcn/ui as the base component layer (customize the theme, don't leave it default)
- Framer Motion for UI motion, GSAP for scroll-driven/complex sequences
- Zustand only if you need lightweight client state (e.g. theme toggle) — no data-fetching libraries needed yet
- Icons: lucide-react

## Design System — define this concretely, then use it everywhere

Build this as actual design tokens (Tailwind config + CSS variables), not just a mood board.

**Palette** — dark-first, glass-and-glow, not neon:
- Base surfaces: near-black graphite (e.g. `#0A0B0D`, `#101216`, `#16181D`) for backgrounds and cards
- Primary accent: a bio-mint/teal (e.g. `#00F5A0` family) — used sparingly for primary actions, active states, key data highlights
- Secondary accent: a cool plasma blue (e.g. `#4D9FFF` family) — used for secondary data series, links, informational states
- Premium/VIP accent: a muted warm gold (e.g. `#D4AF6A`) — reserved only for VIP/VIP+ tier UI, used sparingly
- Semantic colors (success/warning/error) that stay in-palette, not generic red/green/yellow
- Light mode variant of the whole system (not an afterthought — real parity)

**Typography:**
- Headings: a geometric, confident sans (e.g. Inter Tight, General Sans, or similar via next/font)
- Body: Inter or similar humanist sans for readability
- Data/numbers: a monospace or tabular-figure font (e.g. JetBrains Mono / IBM Plex Mono) for stats, counters, timers — this is what makes it feel like a dashboard, not a blog
- Define a full type scale (display, h1–h4, body-lg/md/sm, caption, data-lg/md/sm) as reusable classes/tokens

**Surface language:**
- Glass cards: subtle backdrop-blur, low-opacity borders, soft ambient shadow, faint inner glow on hover/focus — restrained, not glassmorphism-2016-cliché
- Consistent radius scale, consistent elevation scale (shadow tokens, not ad-hoc box-shadows)
- Breathing whitespace — generous spacing scale, nothing cramped

**Motion tokens:**
- Standard easing curves and durations (define 2–3 named presets: e.g. `snappy`, `smooth`, `spring`) used consistently instead of animators picking random values per component
- Scroll reveal, magnetic buttons (subtle cursor-follow on primary CTAs), floating cards with subtle parallax, animated counters, skeleton loaders — build these as reusable primitives (`<RevealOnScroll>`, `<MagneticButton>`, `<AnimatedCounter>`, `<Skeleton>`) so later phases reuse them instead of reinventing.

## Before you start: use available Skills

Check the environment for any available **Skills** (SKILL.md-style capability guides) — in particular a `frontend-design` skill if one is present — and follow its guidance for styling conventions, layout tokens, and component patterns before writing UI from scratch. If a skill-search/skill-finder tool is available, use it proactively to discover skills relevant to sub-tasks in this phase (e.g. chart libraries, illustration/icon conventions, animation patterns) rather than reinventing things the environment already has documented guidance for. Do this check at the start of every later phase too, not just this one.

## Visual asset system: illustrations, SVGs, anatomy

This product must feel visually rich, not text-and-cards only:

- Use custom or curated **SVG illustrations** (not generic stock photos) for empty states, onboarding, FAQ/feature sections — flat/duotone illustration style consistent with the palette (mint/blue/graphite), in the spirit of unDraw/Humaaans-style illustration systems but re-colored to match EsiFit, not left in their default colors.
- Build (or integrate an open-source) **anatomical body-map component** — an SVG-based front/back human body diagram capable of highlighting specific muscle groups (e.g. libraries like `react-body-highlighter` or similar open-source muscle-map SVG sets are a reasonable starting point/reference for the muscle-group paths). This component is foundational — build it generically (accepts a list of highlighted muscle groups + intensity/color per group) in this phase, so Phase 3 can use it for "target muscles" on exercises and a later training-volume heatmap.
- Icons stay consistent (lucide-react throughout) — don't mix icon styles.
- Every illustration/SVG must support both dark and light themes (no illustrations that only look right on one background).

## Public Content Hub (Blog/Articles + free calculator access)

Not everything lives behind login. Build a public content section, fully SEO-optimized and crawlable:

- **Articles/Blog**: an index page (filterable by category — training, nutrition, recovery, science) and an article template page (typography-focused reading layout, table of contents for long articles, related-articles section, author byline). Use MDX or a typed content structure so articles are easy to add. Populate with a handful of realistic placeholder articles.
- **SEO metadata & structured data**: every public page (landing sections, article pages, article index, calculator pages) must generate proper Next.js `metadata` (title, description, canonical, Open Graph, Twitter Card) per-page, not one static site-wide block. Article pages must emit `Article` JSON-LD (headline, author, datePublished, image); the article index should emit `BreadcrumbList`; the FAQ section should emit `FAQPage` JSON-LD. This is what makes rich snippets/search visibility actually work — treat it as a real requirement, not an afterthought bolted on later.
- **Calculators stay accessible to anonymous visitors** for the core calculation itself (this is a deliberate product decision, not an oversight) — a visitor can use any of the 16 calculators (built in Phase 3) and get their result and the static, rule-based interpretation text. Features that require an account: saving history, comparison mode, share-card generation, and — per the later AI phase — the AI-generated personalized recommendation. Design the calculator UI now (Phase 1 design system) with this two-tier state in mind: an unobtrusive "sign up to save this / get an AI-personalized read on this result" prompt, never a hard paywall blocking the calculation itself.

## Component Library Deliverable

Build a small internal library (e.g. `/components/ui-extended` on top of shadcn) including at minimum:
- Buttons (primary/secondary/ghost/gradient-glow variants, loading state, magnetic hover)
- Card / GlassCard
- Badge / Pill (tier badges: Free/VIP/VIP+/Coach visual language)
- AnimatedCounter, RadialProgress/Gauge primitive (will be reused heavily in Phase 3 for calculators/analytics — build it generically now)
- Navbar (transparent-on-hero → solid-on-scroll transition), Footer
- Modal/Dialog, Toast, Tabs, Tooltip — themed to match the system, not stock shadcn look

## Landing Page — sections required

1. **Hero** — bold headline + tagline, animated/ambient background (subtle particle or gradient mesh, NOT flames/fire, NOT busy), primary + secondary CTA, subtle 3D-inspired depth (parallax layers, not literal 3D models unless you're confident in performance cost)
2. **Feature showcase** — grid or scroll-driven sequence highlighting: dashboards, workout engine, nutrition, analytics, gamification, community — use icons/illustrations consistent with the palette
3. **Transformation slider** — before/after image comparison component (build with placeholder images, drag-to-reveal interaction)
4. **Testimonials** — carousel or masonry, placeholder names/quotes/avatars
5. **Pricing** — Free / VIP / VIP+ tiers, monthly/yearly toggle, clear differentiation, VIP+ visually elevated (gold accent)
6. **FAQ** — accordion, themed
7. **Newsletter signup** — inline form (non-functional submit is fine, show success state)
8. **Final CTA** — strong closing section
9. **Footer** — standard, on-brand

## Non-functional bar for this phase

- Lighthouse 95+ on the landing page (performance, accessibility, best practices, SEO)
- Accessibility AA: proper contrast in both themes, focus states, semantic HTML, keyboard navigable
- Fully responsive (mobile-first), dark/light mode toggle working and persisted
- No layout shift from animations; respect `prefers-reduced-motion`

## What NOT to do

- Do not use stock shadcn default theme colors/shadows unchanged
- Do not use literal flame/fire iconography or generic red-orange "energy" gradients
- Do not ship a static, non-animated landing page — motion is a requirement, not decoration
- Do not hardcode content inline everywhere — pull hero/features/testimonials/pricing/FAQ copy from typed content files (e.g. `/content/landing.ts`) so copy can be edited without touching layout code

## Deliverable & handoff

At the end, give me:
1. The running app
2. A short written summary of: the exact color tokens/hex values you chose, the fonts you chose, and the motion presets you defined — I will paste this into the Phase 2 prompt so the dashboard stays visually consistent.
