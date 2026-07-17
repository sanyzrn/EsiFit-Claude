# EsiFit — DESIGN_BIBLE.md

**Paste this file alongside `PROJECT_RULES.md` at the start of every phase.** This is the single source of truth for every visual and interaction decision — if it's not here, it needs to be added here first, not improvised inline. Phase 1 is responsible for actually implementing these as real Tailwind tokens/CSS variables; every later phase must use them, not reinvent them.

---

## 0. Emotional Design (Brand Personality)

Before any token or component: EsiFit should make users feel **motivated, capable, rewarded, calm, and in control**. This governs copy, CTAs, error messages, and even animation choice — not just the color palette.

- Never create stress. No countdown-to-doom framing, no red "you're falling behind" alerts.
- Never shame users. A missed workout or a bad week gets neutral or encouraging language, never guilt.
- Never use military or toxic-fitness-culture language ("no excuses," "destroy leg day," "no pain no gain"). This applies to microcopy, notification text, and achievement names alike.
- Progress should feel encouraging, not intimidating — a partially-filled progress ring reads as "on your way," not "you failed to finish."
- This tone rule overrides any individual phase prompt's example copy if the two ever conflict.

## 1. Layout

- **Grid**: 12-column responsive grid, max content width ~1440px, gutters that scale with breakpoint (e.g. 16px mobile → 32px desktop).
- **Spacing scale**: a single 8px-based scale (4, 8, 12, 16, 24, 32, 48, 64, 96) used everywhere — no arbitrary margin/padding values outside this scale.
- **Radius scale**: small (buttons/inputs, ~8px), medium (cards, ~16px), large (modals/hero panels, ~24px), full (pills/avatars). Never a random one-off radius.
- **Responsive rules**: mobile-first. Breakpoints: mobile (<640px), tablet (640–1024px), desktop (1024px+). Dashboard bento-grid collapses to single-column priority order below tablet width, per the priority defined in Dashboard Psychology (section 6).

## 2. Surfaces & Depth

- **Blur**: glass surfaces use a consistent backdrop-blur value (e.g. 12–16px) — never mix blur amounts arbitrarily on similar surface types.
- **Shadow scale**: 3 elevation levels (resting, raised/hover, floating/modal) as named tokens, not ad-hoc `box-shadow` per component.
- **Glow**: reserved for active/success/highlight states and the two hero widgets (Progress Score, Readiness Score) — glow is a signal, not decoration; overusing it kills its meaning.
- **Opacity rules**: surfaces use fixed opacity steps (e.g. 60%, 80%, 100%) for glass layering — don't eyeball opacity per component.
- **Gradient rules**: gradients are subtle (mint→blue or graphite tonal), used for hero backgrounds, primary CTA hover, and premium/VIP+ accents only — never loud rainbow gradients, never used on body text or large text blocks.

## 3. Typography

- Headings: geometric sans (defined in Phase 1). Body: humanist sans. Data/numbers: monospace/tabular-figure font — this three-way split is fixed and used consistently everywhere numbers appear (stats, counters, timers, chart labels).
- Fixed type scale (display, h1–h4, body-lg/md/sm, caption, data-lg/md/sm) — no free-floating font-sizes.

## 4. Motion Bible

All motion uses the 2–3 named easing/duration presets defined in Phase 1 (e.g. `snappy`, `smooth`, `spring`) — never a bespoke curve per component.

| Interaction | Rule |
|---|---|
| Hover | 150–200ms, `snappy` easing, subtle scale/glow only — no large position jumps |
| Scroll reveal | Staggered fade+rise, triggered once per element, respects `prefers-reduced-motion` (falls back to instant, no animation) |
| Page transition | Consistent cross-fade or slide, same direction logic app-wide (e.g. forward = slide-left) |
| Loading | Skeleton shimmer, never a blank white flash |
| Success | One reusable celebration primitive (confetti/glow burst) — reused for PRs, level-ups, badge unlocks, mission completions; never four different implementations |
| Error | Shake/red-glow micro-feedback on the specific field/element, plus a toast — never just a silent failure |
| Micro-interaction | Button press = subtle scale-down; toggle = spring; drag = follows cursor with slight lag for weight |
| Floating elements | Slow, subtle parallax/float (hero background layers, ambient shapes) — barely perceptible, never distracting |
| Counter animation | Numbers count up/down over 400–800ms depending on magnitude, easing `smooth` — never jump-cut |
| Chart animation | Data draws in on mount/update (line draws, bars grow, rings fill) — charts should never "pop" into existence fully formed |
| Blur transitions | Backdrop blur animates in/out with opacity, never appears/disappears instantly |

## 5. UX Rules (time-to-clarity)

These are hard product requirements, not suggestions:

- **Dashboard, 3-second rule**: within 3 seconds of landing on the dashboard, the user must be able to answer "what should I do today?" without scrolling — this drives the widget priority order (see Dashboard Psychology below).
- **Calculator result-before-scroll**: the result visualization (gauge/chart) for any calculator must be visible in the initial viewport immediately after calculating — never require a scroll to see the number you just asked for.
- **Workout-session minimalism**: while a workout is actively in progress, the tracker UI shows only what's needed for the current set (exercise name, current set number, weight/reps input, rest timer) — history, secondary stats, and navigation chrome are minimized or hidden until the session ends.
- **Every empty state is designed, never blank**: empty feed, no workouts logged yet, no challenges joined, empty cart, no notifications — each gets purposeful copy + illustration + a clear next action, never a bare "No data."

## 6. Dashboard Psychology (fixed content order)

The dashboard's vertical/priority order is fixed and must not be reordered per phase or per developer taste:

1. **Greeting** — personalized, time-of-day-aware ("Good morning, Aria")
2. **Today** — what's due today (workout, meals, water) — the single most prominent block
3. **Progress** — Progress Score / Readiness Score, the hero visual widgets
4. **Action** — clear next-step CTA (start workout, log meal, claim mission reward)
5. **History** — everything backward-looking (trends, past activity, timeline) comes last

Widget drag-and-drop reordering (from Phase 2) may let users customize *within* this framework, but the default/first-load order must always follow this sequence.

## 7. Signature Data Visualizations (curated, not everything)

Data-viz creativity has a real tension: the more novel a chart shape, the harder it is to read precise values (this is a known tradeoff in data visualization, not just an aesthetic opinion). So we commit to a **small, curated set** of signature visualizations built well, rather than many novel ones built shallowly:

**Committed (build these for real, to a high standard):**
- **Muscle Heat Body** — anatomical body-map colored by training volume (already specified in Phase 3)
- **Body Radar** — radar/spider chart of relative strength across muscle groups (standard chart type, EsiFit-themed)
- **Streak Calendar** — GitHub-style activity heatmap calendar (standard, proven pattern)
- **Recovery Orb / Readiness Ring** — the Daily Readiness Score's core visual (a glowing orb/ring whose color and pulse reflect readiness state)

**Worth prototyping if time/scope allows, not a committed requirement:**
- Progress River (area-chart variant with organic flowing fill instead of a hard line)
- Consistency Score (a single composite gauge, simpler than it sounds — don't over-engineer)
- Nutrition Wheel (a themed donut/ring set, likely already covered by the macro rings)

**Deliberately not committing to** (novelty-over-legibility risk, revisit only if there's a specific product reason): Constellation Graph, XP Galaxy, Level Map, Fitness DNA, Focus Meter, Journey Timeline-in-3D. If a future phase wants one of these, treat it as its own scoped design exercise with an explicit legibility review, not a default add-on.

## 8. Component-level Rules

- **Buttons**: primary/secondary/ghost/gradient-glow variants only; every button has hover, active, disabled, and loading states; icon-only buttons always have an accessible label.
- **Modals**: always dismissible via backdrop click, Escape key, and an explicit close button; focus-trapped; returns focus to the trigger element on close.
- **Forms & Inputs**: inline validation on blur (not just on submit); every input has a visible label (not placeholder-only); error messages are specific ("Password needs 8+ characters," not "Invalid input").
- **Navigation**: current section always visually indicated; mobile nav collapses to a bottom bar or drawer, never a cramped shrunk desktop nav.
- **Toasts**: max one visible at a time by default (queue additional ones), auto-dismiss with a visible timeout indicator, always dismissible manually.
- **Skeletons**: match the actual shape/size of the content they're replacing — never a generic gray box unrelated to what's loading.

## 9. Explicit Library & Asset Decisions

Vague instructions like "use beautiful charts" produce inconsistent output across phases. These decisions are final unless a phase prompt explicitly overrides one for a stated reason:

| Category | Preferred | Fallback | Forbidden |
|---|---|---|---|
| Charts | Recharts | D3 (for heatmap, radar, and anything Recharts can't express well) | Chart.js, unless a future phase explicitly requires it and states why |
| Icons | lucide-react | — | Mixing icon sets (Heroicons, FontAwesome, Tabler, etc. alongside Lucide) |
| Illustrations | Custom SVG | — | PNG illustrations; Lottie animations, unless a specific phase explicitly calls for a complex animated illustration and justifies the file-size/perf cost |
| Animation | Framer Motion (UI-level), GSAP (scroll/sequence-level) | — | Introducing a third animation library "just for one component" |
| Forms | React Hook Form + Zod | — | Uncontrolled forms with ad-hoc manual validation |
| State (client) | Zustand | React Context (only for narrow, rarely-changing values) | Redux, MobX, or any other global state library |
| Data fetching (mock or real) | TanStack Query | — | Bare `useEffect` + `fetch` data-loading patterns |

Anatomical body-map SVG paths may reference open-source muscle-map assets (e.g. libraries like `react-body-highlighter`) as a starting point, recolored and restyled to the EsiFit palette — never used with their default styling.

## 10. Data Visualization: Legibility Rule

There is a real, well-documented tradeoff between chart novelty and chart legibility — the more unusual the visual metaphor, the harder it is to read an exact value from it. This is why Section 7's signature-visualization list is curated rather than exhaustive. When in doubt about a new chart idea, ask: "can a user extract the precise number they need in under 2 seconds?" If not, it needs a supporting number/label overlay or it isn't ready to ship.

## 11. Accessibility & Theme Parity

- WCAG AA contrast in both dark and light themes — light mode is a real parity requirement, not an afterthought toggle.
- All interactive elements keyboard-navigable with visible focus states.
- `prefers-reduced-motion` disables non-essential animation app-wide.
- Illustrations/SVGs/icons must be legible and on-brand in both themes.
