# EsiFit — Phase 3: Core Product (Workout, Nutrition, Calculators, Analytics)

## Context

Continuing EsiFit. **Paste the Phase 2 handoff summary here** (mock data shapes, widget component API, design tokens) before running this prompt.

Scope: the features users actually manage their fitness with. Still frontend-only, mock data, no backend. This is the largest phase — if needed, tell Claude Code it may propose splitting this into two sequential sub-sessions (Workout+Nutrition first, then Calculators+Analytics), but the spec below is the full scope.

## Interactive Calculators

Each calculator is a **mini application**, not a form with one output. Build:

BMI, BMR, TDEE, Body Fat %, Lean Mass, FFMI, Macro Calculator, Water Calculator, Protein Calculator, Calorie Deficit Simulator, Weight Goal Simulator, One Rep Max, Heart Rate Zones, Ideal Weight, Pace Calculator, Energy Expenditure.

**Access tiers (important product requirement):** every calculator's core input → calculate → result-visualization flow works for **anonymous visitors**, no login required — this is public, SEO-relevant, lead-generation surface. History, comparison mode, share-card, and the AI-generated personalized recommendation (added in Phase 5) are gated behind sign-in, shown as an inline "sign up to unlock" affordance next to the result, never a hard blocker on the calculation itself.

Every calculator must include:
- Interactive sliders (not just number inputs) with live-updating results as you drag
- An animated gauge or radial visualization of the result, not just a number
- A real-time chart where relevant (e.g. deficit simulator shows a projected weight-over-time line as you adjust inputs)
- A short recommendation/interpretation text that changes based on the result band (e.g. BMI category, TDEE-based goal suggestion)
- History (mock: store last N calculations in local state/localStorage-free — use Zustand persisted store) so returning users see their past results
- Comparison mode (overlay a previous result against the current one)
- "Share result" (generate a shareable card/image preview — client-side canvas or styled component, download or copy-as-image is enough, no real social posting needed)

Build one **generic `<Calculator>` shell/pattern** (inputs config → compute function → result visualization) and implement all 16 as configurations of it, rather than 16 fully separate one-off pages — this keeps it maintainable and is exactly the kind of architectural judgment call you should make.

## Workout Module

- **Exercise library**: searchable/filterable (by muscle group, equipment, difficulty) grid of exercises, each with: video or GIF placeholder, step-by-step instructions, target muscles **shown on the anatomical body-map component from Phase 1** (highlighted front/back view, not just a text tag list), common mistakes, personal notes field
- **Workout builder**: drag-and-drop or click-to-add interface to assemble a workout from the library, supports supersets and drop-sets grouping, save as a named routine
- **Workout tracker** (the "live session" view): set-by-set logging (weight/reps), rest timer between sets (auto-starts, notification/sound at 0), previous-performance reference shown inline ("last time: 60kg × 8"), personal-record detection with a celebration moment when a PR is hit (confetti/glow micro-interaction, not a full-screen takeover). Include **voice-powered set logging** as an alternative input (Web Speech API — e.g. saying "60 kilos, 8 reps" fills the current set) since hands are often full or sweaty mid-workout; always keep manual entry as the reliable fallback.
- **Completion celebration**: an end-of-workout summary screen (duration, volume, PRs hit, XP earned) with a satisfying animated reveal

## Nutrition Module

- **Meal planner**: calendar/day view to assign meals to slots (breakfast/lunch/dinner/snacks)
- **Food database**: searchable list with macros per serving, add-to-meal flow with serving-size adjustment
- **Macro tracking**: daily rings (protein/carbs/fat/calories) that update as meals are logged, reuse the ring component from the dashboard for consistency
- **Water tracking**: quick-add UI (tap to log a glass/bottle), animated fill
- **Meal timeline**: chronological view of the day's eating
- **Recipe cards**: styled cards with ingredients/macros/steps, save/favorite
- **Shopping list**: auto-generated from planned meals for the week, checkable items, grouped by category

## Progress Analytics

This is where the "every graph tells a story" principle matters most. Build a dedicated Analytics page with:
- Line charts and area charts for weight/body-fat/measurements over time (Recharts)
- Radar chart comparing multiple metrics at once (e.g. strength across muscle groups)
- Heatmap (e.g. GitHub-style activity heatmap for workout consistency)
- Radial gauges / circular progress for goal completion
- Animated counters for headline stats
- Goal projection (trend line extrapolated forward with a confidence band)
- Comparison mode (this month vs last month, or two custom date ranges, side by side)
- Before/After photo gallery with the transformation-slider component from Phase 1 reused here with real (mock) user photos over time
- **Muscle Volume Heatmap** — the anatomical body-map component from Phase 1, color-intensity-coded by training volume per muscle group over the selected period, so over-trained and neglected muscle groups are immediately, visually obvious — this is a signature visualization, give it real design attention
- Weekly and monthly trend summaries with auto-generated plain-language insights (e.g. "Your average sleep improved 8% this month") computed from the mock data, not hardcoded strings

Use D3 directly (not just Recharts) for at least the heatmap and radar chart if Recharts' defaults feel generic — this is a place to show real data-visualization craft.

## Offline support for Trackers + seed data script

- **Offline-first Trackers**: the Workout Tracker and Water/Nutrition quick-log actions must keep working with no network connection (realistic for a gym basement) — use a service worker + local persistence (IndexedDB or similar) to queue logged sets/meals/water taps offline, then sync/reconcile once connectivity returns, with a visible "offline — will sync" indicator. Scope this to the actively-logging-mid-session flows specifically; the full app does not need to be offline-capable, just the trackers where losing a set of data mid-workout would be genuinely frustrating.
- **Seed data script**: build a single script (e.g. `pnpm seed` or `scripts/seed.ts`) that deterministically generates the full mock dataset used across Phases 2–4 (30+ days of workouts, nutrition, weight, sleep, water, XP/streaks, community activity) from one place, instead of each phase inventing its own ad-hoc mock data inline. Re-running it should reset to a consistent, realistic demo state — this is what makes the project demoable and keeps later phases' data shapes honest against a single source of truth.

## Non-functional bar

Same as prior phases. Additionally: charts must handle empty/sparse data gracefully (meaningful empty states, not broken axes), and must remain performant with months of daily data points (aggregate/downsample for wide date ranges rather than rendering thousands of raw points).

## What NOT to do

- Don't build 16 calculators as 16 unrelated implementations — use the shared pattern described above
- Don't use default Recharts styling unchanged — theme every chart to the Phase 1 design tokens
- Don't make the workout tracker feel like a spreadsheet — it should feel like a coached session (clear focus on "current set," minimal chrome, big touch targets for gym/mobile use)

## Deliverable & handoff

Give me: the running app, and a summary of the calculator config schema, the chart theming utilities you built, and any new shared data shapes — needed for Phase 4.
