# EsiFit — Phase 2: Auth Flows & Dashboard Shell

## Context

Continuing the EsiFit build. **Paste the Phase 1 design-system summary here before running this prompt** (colors, fonts, motion presets, component library) so Claude Code stays visually consistent instead of re-deriving the brand.

Scope for this phase: **authentication UI (no real backend) + a first-run onboarding wizard + the dashboard shell** — the "Tesla dashboard" experience. Still frontend-only, mock data, no API calls. **Read `ONBOARDING_FLOW.md` in full alongside this prompt** — it defines the required wizard between signup and the dashboard in detail; this file only summarizes where it fits.

## Tech additions this phase

- React Hook Form + Zod for form validation (client-side only — no real submission target yet, simulate network delay + success/error states)
- Zustand for auth/session mock state (a fake "logged in user" object with a role field)
- TanStack Query — set it up now even though there's no real API, using mock async functions (e.g. `fetchDashboardData()` that resolves from local JSON after a simulated delay). This makes Phase 5's real-backend swap trivial.

## Authentication UI

Build these screens/flows, fully styled per the Phase 1 design system:
- Login (email/password) with validation, error states, "remember me"
- Signup (with password strength indicator)
- Social login buttons (Google/Apple — UI only, mock the click resolving to a logged-in state)
- Email verification screen (mock "check your inbox" state + resend cooldown timer)
- Password recovery flow (request → check email → reset form)
- 2FA-ready: build a 2FA code-entry screen (6-digit input, auto-advance, paste support) even though it's not wired to anything real yet — it should be a real, reusable component

All forms should have: inline validation, loading states, success/error toasts, and smooth transitions between steps (this is a flow, not isolated pages).

## Onboarding Wizard (between signup and the dashboard)

Full spec lives in `ONBOARDING_FLOW.md` — build it in this phase, sequenced as: Signup → Onboarding wizard → Dashboard (first load, personalized-or-default depending on completion). In brief: a short, skippable, 4–6 step wizard (goal, experience level, equipment access, basic biometrics, notification preference, optional wearable-connect placeholder) that writes into the same `USER`/`GOAL` mock data shapes used elsewhere — not a parallel, one-off data shape. Every step must be skippable with sensible defaults; a skipped/partial onboarding shows a persistent, low-pressure "complete your profile" nudge on the dashboard rather than blocking access. See `ONBOARDING_FLOW.md` for the full rules, rationale, and Definition of Done additions.

## Cross-tab session resilience

The mock auth/session store must survive real-world browser behavior, not just a single happy-path tab:

- Persist the session (Zustand `persist` middleware or similar) so a page refresh or new tab doesn't lose the logged-in state.
- Sync auth state **across open tabs** (via the `storage` event or `BroadcastChannel`): logging out in one tab logs out all tabs; logging in updates all tabs. This matters most for Coach/Admin-stubbed views where a stale session in a background tab could show inconsistent role state.
- Handle the "closed browser, reopened later" case explicitly: define and implement a mock session-expiry duration, with a graceful re-login prompt rather than a silent broken state.
- This is scoped to the mock store now — when Phase 6 wires real JWT auth, this same cross-tab sync behavior must carry over (token refresh instead of mock expiry), so build the sync mechanism now in a way that isn't thrown away later.

## User Roles (mock)

Support these roles in the mock auth state, each producing a **visually distinct dashboard** (via role-based widget sets and accent treatment, not entirely different codebases):
`Guest`, `Free`, `VIP`, `VIP+`, `Coach`, `Admin`, `Super Admin`

For this phase, fully build out **Free, VIP, VIP+, and Coach** dashboards. Admin/Super Admin dashboards can be stubbed with a "coming in Phase 6" placeholder that still matches the visual system.

## Dashboard Shell — "feel like a Tesla dashboard"

Build a persistent app shell: sidebar/nav (collapsible), top bar (search, notifications bell with badge, profile menu with role badge), main content grid.

Widgets required (as real, independently reusable components with mock data props — not hardcoded into the page):
- Today's Workout (progress ring, next exercise preview)
- Nutrition (macro rings: protein/carbs/fat, calories remaining)
- Water intake (animated fill indicator)
- Sleep (last night's hours + trend)
- Weight (current + trend sparkline)
- Body fat % (current + trend)
- XP / Level bar
- Streak counter (with flame-free visual treatment — use a glow/pulse metaphor instead of literal fire)
- Goals (progress bars toward active goals)
- Weekly overview (mini bar chart, 7-day activity)
- Activity timeline (recent actions, vertical timeline)
- Notifications panel
- Overall "Progress Score" (a signature hero widget — a large radial gauge/score, this should be the most visually impressive widget on the page)
- Upcoming milestones (list with countdown/progress)
- **Daily Readiness Score** (creative signature widget — a composite ring blending sleep, streak, and recent training load from mock data, paired with a one-line plain-language recommendation like "Push hard today" / "Moderate session" / "Prioritize recovery" — this is a second hero-level widget alongside Progress Score, but forward-looking/prescriptive rather than backward-looking/cumulative)

## Command Palette (⌘K / Ctrl+K)

Build a global command palette (Linear/Superhuman-style), invoked via keyboard shortcut and a visible trigger in the top bar: fuzzy search across pages, exercises, articles, and calculators, plus quick actions (log water, start rest timer, jump to a specific calculator, toggle theme). This is a real navigation layer, not a gimmick — power users should be able to do almost anything without leaving the keyboard. Build it as a reusable, extensible registry (`registerCommand(...)`) so later phases add their own actions instead of hardcoding a growing switch statement.

Requirements:
- Widgets are **draggable/reorderable and toggleable** (show/hide) — persist layout in local state (Zustand), no backend needed yet
- Each widget has its own loading skeleton (reuse the Phase 1 `<Skeleton>` primitive) and empty state
- Layout is responsive: multi-column bento-grid on desktop, single column with priority ordering on mobile
- Animate entrance (staggered reveal), animate value changes (numbers count up/down, not jump-cut)
- Role differences: VIP/VIP+ unlock extra widgets (e.g. advanced analytics teaser, coach messages) with a tasteful "upgrade to unlock" pattern for Free users — never a nagging popup, an inline elegant locked-state card

## Data layer

Create `/lib/mock/` with realistic, varied mock data (use a fixed seed or a library like `@faker-js/faker` if available) covering at least 30 days of history per metric, so charts and trends in later phases look real, not flat.

## Non-functional bar

Same as Phase 1: 95+ Lighthouse where feasible, AA accessibility, full responsiveness, dark/light parity, `prefers-reduced-motion` respected.

## What NOT to do

- Don't fake a "real" backend by hardcoding fetch() calls to nowhere — use the TanStack Query + mock async function pattern so swapping to real endpoints later is a one-line change per hook
- Don't build Admin/Super Admin dashboards in full yet — stub only
- Don't let widgets be visually identical bento boxes with just different numbers — each widget's visualization should match its data type (rings for percentages, sparklines for trends, bars for comparisons)

## Deliverable & handoff

Give me: the running app, and a short summary of the mock-data structure/shape you used (so Phase 3's calculators and analytics can consume the same shape), the widget component API (props each widget expects), and the exact onboarding-collected profile fields (goal, experience, equipment, biometrics) so Phase 5's AI insights can reference them correctly instead of a placeholder profile.
