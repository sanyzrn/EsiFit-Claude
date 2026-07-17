# EsiFit — PRODUCT_DECISIONS.md

A log of project-level decisions already made, with the reasoning and the accepted tradeoff. **Check this before re-deciding something that's already settled.** If a phase seems to call for reversing one of these, treat that as a flagged conflict (per `PROJECT_RULES.md`'s escalation rule), not a silent override — add a new entry documenting the change instead of just changing behavior.

---

**Decision:** All 16 calculators work without login (core calculate → result flow only).
**Reason:** SEO and lead generation — calculators are the primary organic-traffic entry point into the product.
**Tradeoff:** History, comparison mode, share-card generation, and AI-generated personalized insight all require an account.

---

**Decision:** Real backend does not start until Phase 6; Phases 1–5 run entirely on mock data (Phase 5's AI calls being the one real-API exception).
**Reason:** Frontend iteration speed — locking down UI/UX before backend schema exists avoids rebuilding UI around backend constraints later.
**Tradeoff:** Mock APIs (TanStack Query mock functions) must be swapped for real endpoints in Phase 6; anything that assumed an unrealistic mock shape has to be corrected then.

---

**Decision:** AI assistant (Phase 5) is free for every signed-in member, regardless of tier (Free/VIP/VIP+/Coach) — not a paid upsell.
**Reason:** Retention/acquisition hook — a genuinely useful free AI feature drives sign-ups and daily engagement.
**Tradeoff:** Cost is controlled via per-role daily quota and token-usage logging instead of a paywall; requires careful rate-limiting to avoid runaway API cost.

---

**Decision:** AI features are completely unavailable to anonymous visitors — visible and usable only after sign-in.
**Reason:** Cost control, and it doubles as a conversion incentive (sign up to unlock your AI insight).
**Tradeoff:** Anonymous visitors only get the static, rule-based interpretation text on calculators — a slightly less impressive experience pre-signup, by design.

---

**Decision:** AI provider is a swappable adapter supporting exactly four options: Anthropic, Gemini, OpenRouter, and a generic Custom (OpenAI-compatible) endpoint.
**Reason:** Avoid vendor lock-in; let whoever configures the deployment choose based on cost/quality/availability at the time.
**Tradeoff:** Added abstraction complexity, and each provider's failure modes (rate limits, timeouts, model-specific quirks) must be handled uniformly through one interface.

---

**Decision:** Offline support (Phase 3) is scoped only to the Workout Tracker and Water/Nutrition quick-log actions — not the entire application.
**Reason:** The specific, real pain point is gym connectivity during an active session; full-app offline (full PWA) is high effort for low marginal value elsewhere in the product.
**Tradeoff:** Other pages (analytics, community, store) still require a live connection; no offline-first guarantee outside the trackers.

---

**Decision:** Data visualization commits to a small, curated set of "signature" visualizations (Muscle Heat Body, Body Radar, Streak Calendar, Recovery Orb/Readiness Ring) rather than building the full list of creative chart concepts proposed during ideation.
**Reason:** There's a real legibility-vs-novelty tradeoff in data visualization — committing effort to fewer, well-executed visualizations beats shipping many shallow, hard-to-read novel ones.
**Tradeoff:** Some creative ideas (Progress River, Constellation Graph, XP Galaxy, Fitness DNA, etc.) are deliberately deferred, not committed to any phase, and would need their own scoped legibility review if revisited later.

---

**Decision:** Shareable content (Weekly Recap, Phase 4) uses both a client-side canvas-rendered card *and* a server-side Open Graph image route.
**Reason:** The client canvas version covers direct download/share-as-image; only a server-rendered OG image produces a correct link preview when shared on Twitter/X, Discord, or messaging apps.
**Tradeoff:** Two rendering implementations to maintain for what is conceptually one feature.

---

**Decision:** Project documentation is kept to a small, dense set of reference files (`PROJECT_RULES`, `DESIGN_BIBLE`, `COMPONENT_INVENTORY`, `DATA_MODEL`, `CONTENT_STRATEGY`, `FEATURE_FLAGS`, `PRODUCT_DECISIONS`) rather than an exhaustive multi-hundred-page documentation set written entirely upfront.
**Reason:** These documents have to be practically pasteable into a Claude Code session's context every phase; documentation written far ahead of implementation risks diverging from what actually gets built, creating rework.
**Tradeoff:** Some specifics (exact component props, precise hex values) are intentionally left as "fill in after implementation" rather than fully speculated in advance.

---

**Decision:** Phase 1 locks Inter Tight / Inter / JetBrains Mono and the graphite–mint–plasma–gold token set in `src/app/globals.css`.
**Reason:** Need concrete, reusable tokens before Phase 2 dashboard work; values follow `phase-1-foundation.md` examples and `DESIGN_BIBLE.md`.
**Tradeoff:** Brand fonts are Google Fonts via `next/font` (network on first load) rather than self-hosted files.

---

**Decision:** `esifit-development` is installed as a project skill (`.cursor/skills/`) with an always-apply Cursor rule, plus user-global copies under `~/.cursor/skills` (and Claude/agents compat paths).
**Reason:** Agents must load the same reading order and Definition of Done without pasting the prompt pack every session.
**Tradeoff:** Bundled skill `references/` can drift from root living docs — skill instructions prefer root files and ask to sync references when practical.

---

**Decision:** Contextual PWA install prompt is deferred until post-onboarding / first-workout engagement exists (Phase 2–3).
**Reason:** `PWA_INSTALLABILITY.md` forbids showing it on first landing-page visit; Phase 1 has no signed-in engagement signal yet.
**Tradeoff:** Manifest/icons ship in Phase 1 (installable via browser UI), but in-app prompt UX waits.

---

**Decision:** Phase 2 ships Vitest store/unit tests for auth + VIP gating now; full Playwright E2E for signup→dashboard is deferred to a focused follow-up once the dashboard layout API stabilizes.
**Reason:** Auth/session transitions are the highest-risk logic regressions called out in `TESTING_STRATEGY.md` and are covered; E2E harness adds tooling surface area mid-phase without changing the mock contract.
**Tradeoff:** Critical-path E2E is not automated yet — manual route smoke + unit/store coverage fills the gap until Playwright is added.

---

**Decision:** Onboarding profile fields live on `User.profile` (aligned to USER/GOAL), not a separate onboarding DTO.
**Reason:** Calculators (Phase 3) and AI context (Phase 5) must read one shape; avoids reconciliation debt.
**Tradeoff:** Profile grows a few optional biometric fields early.
