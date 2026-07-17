# EsiFit — OPERATIONS.md

**Paste this alongside `PROJECT_RULES.md` from Phase 1 onward.** The existing phase prompts define what to build and how to design it, but not how work is tracked across sessions (git) or how failures are noticed once real code — and from Phase 5, real API calls — exist. Both are cheap to set up early and expensive to retrofit after five phases of untracked history and silent failures.

## Git & phase workflow

- **One branch per phase**, named consistently (e.g. `phase-1-foundation`, `phase-2-auth-dashboard`), branched from the previous phase's completed branch (or `main` after merge) — never built as one long-running branch across all five phases, which makes it impossible to isolate which phase introduced a regression.
- **Commit at meaningful checkpoints within a phase**, not one giant commit at the end — e.g. "design tokens + Tailwind config," "component library," "landing page sections" as separate commits within Phase 1. This makes `git bisect` actually useful later and gives a real trail of what was built when.
- **Merge to `main` only after the phase's Definition of Done checklist (from `PROJECT_RULES.md`, plus the additions from `TESTING_STRATEGY.md`/`SECURITY_PRIVACY.md`) is fully satisfied and reported against explicitly** — not as an implicit assumption.
- **Commit messages reference the phase and, where relevant, the specific rule/decision being implemented** (e.g. "Phase 2: cross-tab session sync via BroadcastChannel, per PROJECT_RULES #cross-tab resilience") — this makes the commit history double as a decision trail alongside `PRODUCT_DECISIONS.md`, not a replacement for it.
- **Tag the end of each phase** (e.g. `v0.1-phase1`, `v0.2-phase2`) so any future session can check out exactly the state a given phase's handoff summary was describing, rather than trusting that `main` still matches an old handoff note.

## Observability (from Phase 5 onward, mandatory — earlier phases, optional but recommended)

Phase 5 introduces the project's first real external API calls (to an AI provider) and its first real place a silent failure would be invisible without instrumentation.

- **Error tracking** (e.g. Sentry, or an equivalent lightweight self-hosted option): wire this in Phase 5 at the latest, covering both client-side render errors and server-side route-handler errors (the AI provider adapter's timeout/rate-limit/invalid-key failure states, already required by `phase-5-ai-assistant.md`, should actually be captured somewhere, not just gracefully degraded in the UI with no record that it happened).
- **Structured logging**, not `console.log` scattered ad hoc: the token-usage logging already required in Phase 5 should go through one logging utility used consistently, so it's trivial to route to a real log aggregator once Phase 6 exists.
- **Basic uptime/health check**: even in the mock-data phases, a simple `/api/health` route returning `{ status: "ok" }` costs almost nothing to add now and becomes genuinely useful the moment Phase 6 introduces a real backend to monitor.
- **Do not add product analytics (PostHog/Amplitude/etc.) silently** — if added, it must go through `PRODUCT_DECISIONS.md` as its own entry, with the sensitive-data exclusion rule already defined in `SECURITY_PRIVACY.md` (no raw health metrics as event properties).

## What NOT to do

- Don't retrofit git history after the fact ("I'll clean up commits later") — the one-branch-per-phase discipline only works if followed from Phase 1, not introduced retroactively once history is already tangled.
- Don't wire a heavyweight observability stack (full APM, custom dashboards) before Phase 6 — Sentry (or equivalent) plus structured logs is the right amount of instrumentation for a still-mostly-mock-data project; anything heavier is premature for the current scope.
- Don't let the AI provider's real cost/error data go unmonitored just because "it's just for testing" — Phase 5's stated purpose is to have at least one provider wired to a real key, which means real cost and real failure modes exist from that point on, not just in a hypothetical future production deployment.

## Definition of Done — addition

Add to `PROJECT_RULES.md`'s Definition of Done:

- [ ] Work for this phase lives on its own branch, merged only once the full checklist (including `TESTING_STRATEGY.md` and `SECURITY_PRIVACY.md` additions) passes
- [ ] Commit history for the phase is legible as a trail of meaningful checkpoints, not one monolithic commit
- [ ] (Phase 5+) Any new real external API call has error tracking and structured logging wired in before being considered done — a gracefully-degraded UI is not sufficient on its own if the underlying failure is invisible to whoever's operating the app
