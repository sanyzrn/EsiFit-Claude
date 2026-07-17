# EsiFit — TESTING_STRATEGY.md

**Paste this alongside `PROJECT_RULES.md` from Phase 2 onward.** Phase 1 has almost no logic to break (mostly static UI), but from Phase 2 (auth/session state) onward, every phase adds behavior that the *next* phase can silently regress. Lighthouse and manual review catch visual/perf issues, not logic regressions — this document exists to catch those.

## Why this exists

The original phase prompts define a Definition of Done that checks Lighthouse, accessibility, and visual consistency — but nothing verifies that a shared util, a Zustand store, or a calculator's math still behaves correctly after a later phase touches adjacent code. Five phases of cumulative code, with no automated safety net, means regressions are discovered by eyeballing the UI, which misses anything that still *renders* fine but computes or persists wrong.

## Test types & what they're for

| Type | Tool | Covers | Required from |
|---|---|---|---|
| Unit tests | Vitest | Pure logic: calculator formulas (BMI/BMR/TDEE/etc.), XP/level math, streak logic, data-transform utils | Phase 3 (first real business logic) |
| Component tests | Vitest + React Testing Library | Shared components in isolation: `Button`, `Modal`, `Calculator` shell, form validation states, empty/error/loading states | Phase 1 for shared UI primitives, every phase for new ones |
| Store tests | Vitest | Zustand stores: auth/session persistence, cross-tab sync logic, widget layout persistence, calculator history | Phase 2 onward |
| Integration/E2E | Playwright | Critical user flows end-to-end: signup → dashboard, anonymous calculator → result, workout session start → log set → complete → celebration, AI insight gated for logged-out users | Phase 2 onward (auth flow), expanding each phase |
| Visual regression | Playwright screenshot assertions (or Chromatic if available) | Catches unintended visual drift in shared components across phases | Optional but recommended from Phase 2 |

## Non-negotiable test coverage per phase

- **Every calculator's compute function** (Phase 3) has a unit test with at least 3 known input/output pairs, including a boundary case (e.g. BMI category edges). Calculator math is the one place a silent bug directly misinforms a user about their body/health — this is not optional polish.
- **Every auth/session state transition** (Phase 2) has a test: login, logout, expired session, cross-tab sync. This is exactly the kind of state that "looks fine" in a five-minute manual click-through but breaks on the edge case nobody manually tries.
- **Every gated feature check** (calculator history, AI insight, VIP-only widgets) has a test asserting the *denied* path renders the correct locked/upsell state — not just that the allowed path works. Gating bugs are easy to miss visually because the "allowed" screenshot looks identical to the "should-have-been-denied" screenshot.
- **Every lifecycle state** defined in `DATA_MODEL.md` (Workout, Challenge, Mission, Goal, Subscription) has at least one test or story per state, including terminal/edge states (Abandoned, Expired, PastDue) — these are exactly the states real manual testing skips because they're annoying to set up by hand.

## What does NOT need a test

- Static marketing copy, landing page section content, illustration rendering — visual review is sufficient.
- One-off animation timing/easing — covered by the Motion Bible review, not unit tests.
- Anything Phase 6+ will replace wholesale (mock-only plumbing with no real logic) — don't over-invest in testing code with a known short lifespan; note it as a testing gap to close when the real implementation lands instead.

## Definition of Done — addition

Add this line to `PROJECT_RULES.md`'s existing Definition of Done checklist, applied from Phase 2 onward:

- [ ] New business logic (calculators, auth/session, gating checks, lifecycle transitions) has unit/integration test coverage — not just a manual click-through
- [ ] `npm run test` passes with no failing or skipped tests before a phase is considered complete
- [ ] Any test intentionally skipped/deferred is logged in `PRODUCT_DECISIONS.md` with the reason, the same way any other scope tradeoff is logged

## Handoff requirement

Each phase's handoff summary should note: what test suites were added, current coverage of calculator/state logic specifically, and any known untested edge case carried forward — so the next phase doesn't assume coverage that doesn't exist.
