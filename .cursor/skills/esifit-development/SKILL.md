---
name: esifit-development
description: Governs all development work on the EsiFit fitness platform (Next.js/TypeScript app with design system, dashboard, calculators, workouts, community, and AI assistant). Use this skill whenever the user is building, extending, reviewing, or discussing any part of EsiFit — including running a numbered phase (e.g. "run phase 3", "continue EsiFit"), adding a new component, page, or feature to it, or asking about its design system, data model, feature flags, testing, security/privacy, onboarding, installability, operations, or past product decisions. Always consult this skill before writing any EsiFit code, even for a small change, so output stays consistent with the project's established rules, design tokens, component inventory, test/security requirements, and prior decisions rather than improvising new ones.
---

# EsiFit Development

EsiFit is a premium digital fitness ecosystem (Next.js/TypeScript, frontend-first, phase-by-phase build). This skill is installed as a **global, project-wide** capability — it applies to the entirety of the EsiFit repository (no path scoping). It makes agents behave consistently across sessions by loading the right reference document before any code is written, instead of relying on the user to paste it manually each time.

## Document resolution (living docs win)

Prefer the **repository-root** living documents when they exist (`PROJECT_RULES.md`, `DESIGN_BIBLE.md`, `COMPONENT_INVENTORY.md`, `DATA_MODEL.md`, `FEATURE_FLAGS.md`, `PRODUCT_DECISIONS.md`, `TESTING_STRATEGY.md`, `SECURITY_PRIVACY.md`, `ONBOARDING_FLOW.md`, `PWA_INSTALLABILITY.md`, `OPERATIONS.md`, `CONTENT_STRATEGY.md`, `00_README.md`, and `phase-*.md`). Fall back to the bundled copies under this skill's `references/` (and `references/phases/`) only when the root file is missing. When you update a living document during work, update the root file; keep skill `references/` in sync when practical.

## Project Discovery — do this before any change, not just before reading docs

Never assume the state of the codebase; inspect it first, every time, especially in a long-running project where things drift over sessions:

1. Inspect the actual repository structure — don't assume it matches what a phase prompt describes if the repo already exists.
2. Detect the package manager in use (npm/pnpm/yarn — check lockfiles, don't guess).
3. Detect installed dependencies and their actual versions (check `package.json`, not memory of what was specified originally).
4. Detect the framework version actually in use (e.g. the real Next.js/React version installed, which may have moved on from what a phase prompt assumed).
5. Detect existing coding conventions already present in the codebase (naming, file organization, import style) and follow them rather than imposing a different convention.
6. Detect existing path aliases/import mappings (`tsconfig.json`, bundler config).
7. Detect linting/formatting configuration already in place and conform to it.
8. Detect whether a test runner (Vitest/Playwright) is already configured — check before assuming `TESTING_STRATEGY.md`'s tooling needs to be set up from scratch.

## Required reading order, every time this skill is used

**Always read, every time, regardless of phase:**

1. **Read `PROJECT_RULES.md` in full** (root, else `references/PROJECT_RULES.md`). These engineering rules (no duplicate components, no invented design values, production-ready code only, Definition of Done checklist, and the Definition of Done — Extended section summarizing the companion docs below) override convenience every time, regardless of what's being asked.
2. **Read `DESIGN_BIBLE.md` in full** (root, else `references/DESIGN_BIBLE.md`). The complete design system: layout tokens, motion bible, UX rules (3-second dashboard clarity, calculator-result-before-scroll), Dashboard Psychology ordering, Emotional Design/tone rules, and explicit library decisions (Recharts preferred, lucide-react only, SVG-only illustrations, etc.).
3. **Whenever the work touches new or restyled UI** (new pages, new components, visual rework of an existing surface — this covers most of Phases 1–4), **also check for and read `/mnt/skills/public/frontend-design/SKILL.md`** if it's available in the environment. Use the two together, not as substitutes for each other:
   - `DESIGN_BIBLE.md` is the source of truth for the actual token *values* (this project's specific colors, type scale, spacing, motion presets) — never override these with something from `frontend-design`.
   - `frontend-design` supplies the *process discipline* that keeps those tokens from being assembled into a generic, templated-looking result: brainstorm a design plan, critique it against genericness before writing code, and — critically — do a **self-critique pass with screenshots after building**, checking the actual rendered UI against the design plan and against `DESIGN_BIBLE.md`'s Emotional Design section (motivated/capable/rewarded/calm/in control, never stressful or shaming).
   - If the environment doesn't expose `frontend-design` (e.g. it's not installed), proceed with `DESIGN_BIBLE.md` alone and note the gap in the phase handoff rather than blocking.
4. **Check `COMPONENT_INVENTORY.md`** before creating any new component — reuse or extend what's listed; only add a new row if nothing existing covers the need.
5. **Check `DATA_MODEL.md`** for the ER diagram and entity lifecycles (Workout, Challenge, Mission, Goal, Subscription state machines) before inventing a new data shape or status field.
6. **Check `FEATURE_FLAGS.md`** before adding a new toggleable feature area — add a flag if one doesn't exist for it.
7. **Check `PRODUCT_DECISIONS.md`** before re-deciding something already settled (e.g. why calculators work without login, why the backend starts at Phase 6). If a request seems to conflict with a logged decision, flag the conflict rather than silently reversing it.
8. **Read `TESTING_STRATEGY.md`** — required automated test coverage (unit/component/store/E2E) by phase, active from Phase 2 onward. Check this before considering any unit of work — not just a full phase — complete.
9. **Read `SECURITY_PRIVACY.md`** — user-generated-content sanitization and sensitive health-data handling rules, mandatory from Phase 4 (Community) and Phase 5 (AI) onward, but worth checking any time the work touches user input rendering or personal health metrics.
10. **Read `OPERATIONS.md`** — git/branch workflow (active from Phase 1) and observability/error-tracking requirements (active from Phase 5 onward).

**Read conditionally, based on what's being built:**

11. **If the work is Phase 2 or touches signup/auth/first-run flows, read `ONBOARDING_FLOW.md`** — the personalization wizard between signup and the dashboard, and the profile fields it's expected to populate for later phases (calculators, AI insights) to consume.
12. **If the work is Phase 1 (manifest/icons) or Phase 3 (service worker/offline trackers), or touches either, read `PWA_INSTALLABILITY.md`** — installability requirements layered on top of the already-scoped offline support.
13. **If working through the phased build, read the relevant phase file** — `phase-1-foundation.md` through `phase-5-ai-assistant.md`, or `roadmap-next-phases.md` for anything beyond Phase 5 (root copies preferred; else `references/phases/`). Only read the phase file(s) actually relevant to the current request.

## When this applies

- Running or continuing a numbered phase ("run phase 2", "continue the dashboard build")
- Adding any new UI, page, feature, or data entity to EsiFit, however small
- Reviewing or refactoring existing EsiFit code
- Writing or reviewing tests, security/privacy handling, onboarding, PWA/installability, or git/observability setup for EsiFit
- Answering questions about EsiFit's design system, architecture, data model, testing approach, security posture, or why a past decision was made

## UI Quality Gate — required whenever new or restyled UI ships

This applies on top of the Definition of Done checklist, specifically for visual work (most of Phases 1–4):

1. Build the UI following `DESIGN_BIBLE.md`'s tokens.
2. Before declaring the work done, take a screenshot (or equivalent visual check available in the environment) of the actual rendered result — in both dark and light theme, since parity is a hard requirement — and critique it against: `DESIGN_BIBLE.md`'s Emotional Design section (does it feel calm/motivating, not stressful/shaming?), the `frontend-design` skill's genericness check (does this look like it could be any fitness app, or does it feel specifically like EsiFit?), and the 3-second/result-before-scroll UX rules where applicable.
3. If the self-critique surfaces a problem, fix it before reporting the work as complete — don't note it as a "future improvement" for something that was supposed to ship now.

## Documentation Synchronization — a standing rule, not just an end-of-phase step

Whenever an implementation change makes a reference document inaccurate — at any point during the work, not only when a phase wraps up — update it immediately:
- `COMPONENT_INVENTORY.md` the moment a component's real API differs from what was planned.
- `DATA_MODEL.md` the moment an entity, field, or lifecycle state changes.
- `FEATURE_FLAGS.md` the moment a new toggleable feature area is introduced.
- `PRODUCT_DECISIONS.md` the moment an architectural decision is actually made, not retroactively reconstructed later.
- `TESTING_STRATEGY.md`, `SECURITY_PRIVACY.md`, `ONBOARDING_FLOW.md`, `PWA_INSTALLABILITY.md`, or `OPERATIONS.md` if this phase's work reveals a gap or necessary change in the strategy those documents define (e.g. a new category of sensitive data, a new test requirement discovered mid-build) — these are living documents too, not fixed specs handed down once.

Documentation must never lag behind implementation, even mid-phase.

## After finishing any unit of work

Every completed phase (or significant unit of work) must end with a report in this exact structure, so output stays comparable across phase 1 and phase 15 alike:

```
## Summary
## Files Created
## Files Modified
## Components Added
## Documentation Updated
## Test Coverage Added
## Security / Privacy Notes
## Architectural Decisions
## Future Improvements
## Risks
## Next Phase Handoff
```

Per `PROJECT_RULES.md`'s Definition of Done (core and extended), this report must also confirm:
- `COMPONENT_INVENTORY.md` updated with real specs (variants/props/states/dependencies), and any row that's now settled flipped to `Stable: Yes`.
- `DATA_MODEL.md` updated if any entity, field, or lifecycle state changed.
- `FEATURE_FLAGS.md` updated if a new toggleable feature area was introduced.
- `PRODUCT_DECISIONS.md` updated with any non-trivial decision, in Decision / Reason / Tradeoff format.
- Test coverage added per `TESTING_STRATEGY.md`'s requirements for whatever business logic this phase introduced (calculators, auth/session, gating checks, lifecycle transitions), with `npm run test` passing.
- User-generated content and sensitive-data surfaces checked against `SECURITY_PRIVACY.md`, where this phase touched either.
- Onboarding (`ONBOARDING_FLOW.md`) and/or PWA (`PWA_INSTALLABILITY.md`) requirements confirmed, where this phase is Phase 1, 2, or 3, or otherwise touches either area.
- Work committed following `OPERATIONS.md`'s branch/commit discipline, and observability wired in per `OPERATIONS.md` where this phase is Phase 5 or later, or otherwise introduces a real external API call.
- The UI Quality Gate above completed for any new or restyled UI, with the self-critique pass actually performed, not assumed.
- The full Definition of Done checklist — core and extended — reported against explicitly, not assumed satisfied.

## Priority when instructions conflict

If a phase prompt, a user request, or example copy conflicts with `PROJECT_RULES.md` or `DESIGN_BIBLE.md`, the reference documents win. Follow `PROJECT_RULES.md`'s escalation rule exactly: make a reasonable call and state the assumption for genuinely new ambiguity; stop and wait for explicit confirmation before reversing anything already logged in `PRODUCT_DECISIONS.md`. Decision priority order when two valid approaches exist: User Experience > Maintainability > Performance > Accessibility > Visual Polish > Feature Completeness.
