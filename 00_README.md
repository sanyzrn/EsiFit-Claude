# EsiFit — START HERE (Master Orchestration Prompt for Claude Code)

You are building **EsiFit**, a premium digital fitness ecosystem (think Apple Fitness+, WHOOP, Tesla's dashboard, Linear — not a gym website). This prompt pack is organized as a set of reference documents plus a sequence of phase prompts. Read this file first, every time, before touching any other file in this pack.

## What this project is

A frontend-first, phase-by-phase build. Phases 1–5 are **frontend only, mock data, no real backend** (Phase 5 is the one exception: it makes real calls to an LLM provider through a server-side route, because that's the only place a real external API is unavoidable this early). Real backend, admin panel, and advanced AI come later, in Phases 6+, which are only roadmapped, not yet written as executable prompts.

## File map — read in this order

**Reference documents (read fully, every phase, before writing code):**

1. `PROJECT_RULES.md` — non-negotiable engineering rules (no duplicate components, no invented design values, production-ready code only, etc.). These override convenience every time.
2. `DESIGN_BIBLE.md` — the entire design system: grid/spacing/radius/shadow/glow tokens, typography, motion presets, UX rules (3-second dashboard clarity rule, calculator-result-before-scroll rule), Dashboard Psychology (fixed content order: Greeting → Today → Progress → Action → History), and the curated list of signature data visualizations.
3. `COMPONENT_INVENTORY.md` — a living list of components that already exist (or are planned). Check this before creating any new component. Update it at the end of every phase with what you actually built.
4. `DATA_MODEL.md` — the ER diagram (Mermaid) all mock data shapes must conform to, so the real backend in Phase 6 is a direct translation rather than a redesign.
5. `CONTENT_STRATEGY.md` — governs the blog/articles hub (Phase 1): categories, SEO/JSON-LD rules, slugs, internal linking, calculator linking, CTA placement.
6. `FEATURE_FLAGS.md` — the flag registry. Every major feature area is gated behind a flag from Phase 1 onward.
7. `PRODUCT_DECISIONS.md` — a log of project-level decisions already made, with reasons and tradeoffs. Check this before re-litigating a decision that was already settled (e.g. "why do calculators work without login").
8. `TESTING_STRATEGY.md` — required automated test coverage per phase (unit/component/store/E2E), active from Phase 2 onward. Read before considering any phase complete.
9. `SECURITY_PRIVACY.md` — rules for user-generated content sanitization and sensitive health-data handling. Mandatory from Phase 4 (Community) and Phase 5 (AI) onward.
10. `ONBOARDING_FLOW.md` — the first-run personalization wizard (goal, experience, equipment, biometrics) that sits between signup and the dashboard. Part of Phase 2's scope.
11. `PWA_INSTALLABILITY.md` — manifest/icons (Phase 1) and installability on top of the already-scoped service worker (Phase 3).
12. `OPERATIONS.md` — git/branch workflow per phase, and observability (error tracking, structured logging) required from Phase 5 onward.

**Phase prompts (execute in order, one at a time):**

| Phase file | Builds |
|---|---|
| `phase-1-foundation.md` | Brand identity, design system implementation, landing page, public blog/articles hub, SVG illustration + anatomical body-map system |
| `phase-2-auth-dashboard.md` | Auth UI (mock), first-run onboarding wizard (see `ONBOARDING_FLOW.md`), Tesla-style dashboard shell, Command Palette, Daily Readiness Score, cross-tab session resilience |
| `phase-3-core-features.md` | Workout + nutrition modules, 16 interactive calculators (public access, gated depth), progress analytics, muscle volume heatmap, offline-first trackers, seed data script |
| `phase-4-growth-gamification.md` | Community, gamification, store, notifications, shareable weekly recap with server-rendered OG images |
| `phase-5-ai-assistant.md` | Member-only AI assistant (Anthropic / Gemini / OpenRouter / Custom provider adapter), usage quotas, token logging |

`roadmap-next-phases.md` — Phase 6+ (real backend, admin/business layer, advanced AI). Reference only; not yet a prompt to execute.

## Operating procedure for every phase

When asked to run a phase, follow this exact sequence:

1. Read `PROJECT_RULES.md` and `DESIGN_BIBLE.md` in full. These apply regardless of what the phase prompt says.
2. Read `COMPONENT_INVENTORY.md`, `DATA_MODEL.md`, and `FEATURE_FLAGS.md` to understand what already exists.
3. Read `TESTING_STRATEGY.md`, `SECURITY_PRIVACY.md`, and `OPERATIONS.md` — these add requirements (test coverage, content-sanitization/privacy rules, git workflow, observability) on top of every phase from the point each becomes active, per each document's own "active from Phase N" note. For Phase 2 specifically, also read `ONBOARDING_FLOW.md`; for Phase 1 and Phase 3, also read `PWA_INSTALLABILITY.md`.
4. Read the handoff summary from the previous phase, if provided (a short note on design tokens, data shapes, and component APIs from what was actually built).
5. Read the current phase's prompt file and implement it, obeying `PROJECT_RULES.md` and `DESIGN_BIBLE.md` at every decision point — treat any conflict between a phase prompt's phrasing and these two documents as resolved in favor of the documents.
6. At the end of the phase, produce:
   - The running app.
   - A short handoff summary (design decisions, data shapes, component APIs) for the next phase.
   - Updates to `COMPONENT_INVENTORY.md` (real specs for what was built), and to `DATA_MODEL.md` / `FEATURE_FLAGS.md` if anything new was introduced.
   - Confirmation against the Definition of Done checklist, including the additions specified in `TESTING_STRATEGY.md`, `SECURITY_PRIVACY.md`, and `OPERATIONS.md`.

## Hard rules that apply across all phases

- No real backend before Phase 6, except the LLM calls in Phase 5, which must go through a server-side route so API keys never reach the client.
- Every calculator's core calculate → result flow works for anonymous, logged-out visitors. Saved history, comparison mode, share cards, and AI-generated insights are gated to signed-in members.
- Never invent a design token, component, or data shape that isn't already in the reference documents — extend the documents first, then use what you added.
- Lighthouse 95+, WCAG AA, full responsiveness, dark/light theme parity, and `prefers-reduced-motion` support are required on every page shipped, in every phase, not just Phase 1.

## If anything is ambiguous

Prefer the interpretation most consistent with `PROJECT_RULES.md` and `DESIGN_BIBLE.md`. If a genuine conflict exists between a phase prompt and these documents, flag it explicitly and propose the compliant alternative rather than silently picking one path.

## Development Principles (how to decide, not just what to build)

Every implementation must satisfy these priorities, in this order — highest first:

1. **User Experience** — does this feel clear, fast, and pleasant to use?
2. **Maintainability** — can this be safely extended in a later phase without a rewrite?
3. **Performance** — is this fast and light, not just functionally correct?
4. **Accessibility** — is this usable by keyboard, screen reader, and reduced-motion users?
5. **Visual Polish** — does this match `DESIGN_BIBLE.md` and feel premium?
6. **Feature Completeness** — is every edge case and nice-to-have covered?

When two implementation approaches are both valid, choose the one that ranks higher on this list. A more maintainable-but-slightly-less-feature-complete solution beats a feature-complete-but-fragile one. See `PRODUCT_DECISIONS.md` for the project-level decisions already made using this ordering.
