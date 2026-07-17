# EsiFit — PROJECT_RULES.md

**Paste this file at the start of every single phase prompt, every time, with no exceptions — before the phase-specific scope.** This is the one document that prevents architectural drift as the project grows across phases and sessions.

**Companion documents that extend this file:** `TESTING_STRATEGY.md`, `SECURITY_PRIVACY.md`, `ONBOARDING_FLOW.md`, `PWA_INSTALLABILITY.md`, and `OPERATIONS.md` each add their own rules and Definition of Done items, active from the phase noted in each document. The "Definition of Done — Extended" section near the end of this file summarizes their checklist items, but the reasoning lives in the source documents — read those in full when their active phase is reached, don't rely on the summary alone.

## Non-negotiable engineering rules

1. **Never create a duplicate component.** Before writing a new UI component, search the existing codebase (and `COMPONENT_INVENTORY.md`) for something that already does this or something close enough to extend. If `Button`, `Card`, `Modal`, `Chart` wrappers, etc. already exist, use and extend them — never create `Button2`, `NewCard`, `CustomModal`.
2. **Never repeat logic.** If the same calculation, formatting, or data-transform appears in two places, extract it into a shared util/hook instead of copy-pasting.
3. **Never invent design values.** Colors, spacing, radius, shadows, typography, motion durations/easings all come from `DESIGN_BIBLE.md` and the Tailwind/token config it defines. If a needed value doesn't exist yet, add it to the token system first, then use it — don't hardcode a one-off hex code or `px` value inline.
4. **Always search the project before writing code.** Check for existing components, hooks, utils, and types before creating new ones. Assume something might already exist; verify before building.
5. **Always reuse existing components** over building visually-similar-but-technically-new ones. A second chart type only gets created if the existing chart primitives genuinely cannot represent the new data shape — not because it's slightly more convenient to start fresh.
6. **Always think like a Staff Engineer**, not like someone optimizing for finishing this one prompt fast: consider maintainability, reusability, and what the next phase will need from this code.

   **Engineering Mindset**: think like a startup CTO, not a code generator. Optimize for maintainability, scalability, developer experience, user experience, and consistency — in roughly that order when they trade off against each other. Actively avoid: premature optimization, overengineering, magic/clever abstractions that hide what's happening, hidden coupling between unrelated features, framework lock-in that would be painful to migrate away from, and accumulating technical debt without flagging it.
7. **Always write production-ready code.** No TODO-riddled scaffolding, no silently-broken edge cases, no ignoring error states — unless a placeholder is explicitly requested for something genuinely out of scope for this phase (e.g. a real backend call in a frontend-only phase, which is expected to be mocked).
8. **Always explain architectural decisions** at the end of the phase — briefly, not a wall of text — especially anything that deviates from what the phase prompt asked for and why.
9. **Always keep Lighthouse performance/accessibility/best-practices scores at 95+** on any page shipped in the phase, unless there's a documented, justified tradeoff.
10. **Always prefer maintainability over cleverness.** A slightly more verbose but obvious implementation beats a clever one-liner nobody can safely modify later.
11. **Always refactor opportunistically** when touching a file that has an obvious, low-risk improvement available — but never do large, unrelated refactors inside a phase meant to ship features; flag those as a suggestion instead.
12. **Never optimize prematurely.** Measure first (bundle size, render count, actual Lighthouse score), then optimize the thing that's actually slow — not the thing that looks like it might be slow.
13. **Never sacrifice readability for fewer lines of code.** A clear 5-line function beats a clever 1-liner nobody can safely modify later — this is the same principle as rule #10, stated as its own rule because it's violated often enough to call out directly.
14. **Update the living documents.** At the end of every phase: add any new components built to `COMPONENT_INVENTORY.md` (with their actual variants/props/states/dependencies, not the pre-phase guess), add any new data entities/fields/lifecycle states to `DATA_MODEL.md` if the mock data shape grew, add any new flags used to `FEATURE_FLAGS.md`, and log any non-trivial decision made along the way to `PRODUCT_DECISIONS.md`.
15. **Scope Control: never implement features outside the current phase's stated scope**, even a clearly good idea. If a better idea surfaces mid-phase, do not implement it — write it down under a "Future Improvements" note in the phase handoff instead, and let a future phase decide whether to take it on deliberately.
16. **File Modification Policy: before creating a new file, ask "can this reasonably live in an existing file?"** If yes, extend the existing file instead of creating a new one. Never create a new file purely for convenience without an architectural reason (a genuinely separate concern, a size/readability threshold, or a routing requirement) — this is what keeps a long-running project from accumulating hundreds of thin, redundant files.
17. **Performance budget (target, not an absolute blocker)**: aim for an initial JS bundle under ~250KB, LCP under 2.5s, CLS under 0.1, and a good INP. Prefer native browser APIs over adding a dependency for something simple. If a specific feature (a D3 visualization, a complex animation) has a genuine reason to exceed the budget, that's acceptable — but note it explicitly as a tradeoff in the phase handoff rather than silently blowing the budget.

## What "production-ready" means here, concretely

- Every interactive element has a loading state, an error state, and an empty state — not just the happy path.
- Every form validates input and shows accessible error messages.
- Every async mock action simulates realistic latency and can fail (so failure UI actually gets exercised, not just designed and forgotten).
- No console errors or warnings in the browser on any shipped page.
- TypeScript strict mode, no `any` used to silence a type error you didn't actually resolve.

## Error Philosophy

Never hide or silently swallow an error. Every error state shown to a user must do three things: **explain** what went wrong in plain language, **offer a path to recover** (retry, go back, contact support — whatever's appropriate), and **never leave the user stuck** with no next action available. A blank screen, a silent console-only failure, or a dead-end error page all violate this.

## Escalation rule

If a phase prompt's request would require breaking one of these rules (e.g. it seems to ask for a one-off component that duplicates an existing one), Claude Code should flag the conflict and propose the reuse-compliant alternative rather than silently picking one interpretation.

**Two different situations, two different responses:**
- **New ambiguity** (nothing in `PRODUCT_DECISIONS.md` addresses it yet): make the most reasonable call consistent with these rules and `DESIGN_BIBLE.md`, state the assumption, and keep going — don't stall on things that were never actually decided.
- **Conflict with an already-logged decision** in `PRODUCT_DECISIONS.md`: do not silently reverse it. Stop, explain the conflict and the tradeoff each option implies, and wait for explicit confirmation before changing established behavior. Reversing a documented decision has real downstream consequences and deserves a deliberate choice, not a quiet override.

## Definition of Done (applies at the end of every phase, no exceptions)

A phase is not complete until all of the following are true:

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Fully responsive (mobile, tablet, desktop)
- [ ] Dark mode and light mode both work correctly
- [ ] Keyboard accessible (tab order, focus states, no keyboard traps)
- [ ] Lighthouse 95+ (performance, accessibility, best practices, SEO where applicable)
- [ ] No duplicate components (checked against `COMPONENT_INVENTORY.md`)
- [ ] UI consistency reviewed: spacing, typography, color, motion, and icon usage all match `DESIGN_BIBLE.md` — no one-off values snuck in
- [ ] `COMPONENT_INVENTORY.md`, `DATA_MODEL.md`, and `FEATURE_FLAGS.md` updated if this phase changed any of them
- [ ] Any non-trivial decision made this phase is logged in `PRODUCT_DECISIONS.md`
- [ ] Feature flag added if this phase introduced a new toggleable feature area
- [ ] Production-ready: no placeholder code left in unless explicitly requested for something out of this phase's scope

## Definition of Done — Extended (from companion reference docs)

The five documents below each add their own requirements to the checklist above. They're kept as separate files rather than merged inline here because each has its own "active from Phase N" scope and reasoning that's easier to maintain on its own — but none of them are optional once active. Report against all applicable items explicitly, the same as the core checklist above.

**From `TESTING_STRATEGY.md` (active from Phase 2 onward):**
- [ ] New business logic (calculators, auth/session, gating checks, lifecycle transitions) has unit/integration test coverage — not just a manual click-through
- [ ] `npm run test` passes with no failing or skipped tests before a phase is considered complete
- [ ] Any test intentionally skipped/deferred is logged in `PRODUCT_DECISIONS.md` with the reason

**From `SECURITY_PRIVACY.md` (active from Phase 4/5 onward, user-content and sensitive-data rules apply the moment those features exist):**
- [ ] All user-generated content renders through sanitized paths — no raw HTML injection from user input
- [ ] Report/flag affordance present on any new user-generated content surface
- [ ] Any new sensitive-data display, export, or share surface checked against "would I be comfortable with this being the default, publicly shareable view?"
- [ ] Privacy Policy page updated if this phase introduced a new category of data collection or sharing

**From `ONBOARDING_FLOW.md` (Phase 2 specifically):**
- [ ] Onboarding flow is fully skippable at every step with sensible fallback defaults
- [ ] Biometric data collected in onboarding pre-fills the relevant calculators for signed-in members (no duplicate re-entry)
- [ ] Dashboard's "complete your profile" nudge matches the no-shame tone rule (`DESIGN_BIBLE.md` section 0)
- [ ] Onboarding-collected fields map directly onto `DATA_MODEL.md`'s `USER`/`GOAL` entities, no parallel shape invented

**From `PWA_INSTALLABILITY.md` (Phase 1 for the manifest, Phase 3 for the service worker):**
- [ ] `manifest.json`/`app/manifest.ts` present with correct icons, theme color, and `standalone` display mode
- [ ] App is installable (Lighthouse PWA check, or the equivalent "Install app" browser prompt, passes)
- [ ] Install prompt is contextual and dismissible, never shown before meaningful engagement, never a blocking modal
- [ ] iOS manual-install instructions surfaced somewhere reachable

**From `OPERATIONS.md` (active from Phase 1 for git workflow, Phase 5 onward for observability):**
- [ ] Work for this phase lives on its own branch, merged only once the full checklist (including all items above) passes
- [ ] Commit history for the phase is legible as a trail of meaningful checkpoints, not one monolithic commit
- [ ] (Phase 5+) Any new real external API call has error tracking and structured logging wired in before being considered done

Report against this checklist explicitly at the end of every phase, rather than assuming it's satisfied.
