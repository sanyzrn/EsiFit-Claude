# EsiFit — Phase 5: AI Assistant (Free for Members, Multi-Provider)

## Context

Continuing EsiFit. **Paste the Phase 4 handoff summary here** before running this prompt.

Scope: a lightweight AI layer, **free for all signed-in members, unavailable to anonymous visitors**. This does not require the full NestJS backend from the roadmap — implement it using Next.js server-side route handlers/server actions so API keys never reach the client. This phase introduces the first *real* external API calls in the project (everything before this was mock data).

## Product rule (must be enforced, not just described)

- Anonymous visitors can use calculators/articles (per Phase 1/3) but **never** see or trigger the AI features — the AI entry points must check the mock auth/session state from Phase 2 and render a "sign up to unlock your AI report" prompt instead of the AI output for logged-out users.
- Once signed in, AI is available to **every** role/tier (Free, VIP, VIP+, Coach) — this is a retention/acquisition hook, not a paid upsell. (VIP-tier-specific AI depth, if any, is a business decision for a later phase — don't gate it now.)

## Provider abstraction (must support exactly these four)

Build a single internal interface, e.g. `generateAIResponse({ prompt, context })`, with swappable adapters for:

1. **Anthropic** (Claude models via the Messages API)
2. **Google Gemini**
3. **OpenRouter** (which itself proxies many models — treat it as one adapter)
4. **Custom** — a generic adapter where an admin/user can supply their own OpenAI-compatible endpoint URL + API key

Requirements:
- Provider + API key + model name are configured via a settings screen (build a simple admin-facing config UI now; note that in the real backend phase this moves to a proper encrypted-storage admin panel — for now, store it server-side in an environment-variable-backed config, not exposed to the client)
- The adapter interface must be identical regardless of provider — swapping providers should never require touching call sites
- Handle failures gracefully: timeout, rate-limit, invalid-key, and model-error states should all degrade to a friendly "AI is temporarily unavailable, here's your standard result" fallback — the product must never look broken if the AI call fails
- Stream responses where the provider supports it (nicer perceived latency), fall back to non-streamed otherwise

## Where AI shows up (touchpoints)

Keep this focused — a few excellent integrations beat AI sprinkled everywhere:

1. **Post-calculator personalized report**: after a signed-in member uses any calculator (Phase 3), an "AI Insight" panel generates a short (3–5 sentence), personalized, encouraging interpretation of the result in context of their profile/history — layered on top of, not replacing, the existing static rule-based interpretation text.
2. **Post-workout summary insight**: on the workout completion celebration screen (Phase 3), add one AI-generated sentence of context ("Your squat volume is up 12% over 3 weeks — nice consistency.") using the mock history data as context.
3. **Weekly Analytics insight**: on the Analytics page (Phase 3), replace/augment the rule-based weekly summary with an AI-generated narrative paragraph, still grounded in the actual computed numbers (pass the real computed stats into the prompt — never let the model invent numbers).
4. Optionally, a small persistent "Ask EsiFit AI" entry point (e.g. reachable from the Command Palette built in Phase 2) for free-form questions, scoped to fitness/nutrition topics, with a visible disclaimer that it's not medical advice.

## Usage limits & cost control (must be built now, not deferred)

Real API calls cost real money the moment Phase 5 goes live, so this is not optional polish:

- **Daily quota per role**: define a per-role daily cap on AI calls (e.g. Free gets N/day, VIP gets more, VIP+ more still, Coach/Admin unlimited or a high ceiling) — enforce it server-side in the route handler, not just hidden in the UI. When a member hits their quota, show a clear "you've used your AI insights for today, resets at [time]" state — never a silent failure.
- **Token usage logging**: every AI call must log (server-side, e.g. to a simple structured log or a lightweight table/file for now — a full analytics pipeline is a Phase 6+ concern) the user id, provider, model, prompt/completion token counts, and timestamp. Surface a simple usage view (even just for yourself/admin during development) so token consumption per user/provider is visible and quota logic can be sanity-checked against it.
- Design the quota + logging logic as a shared middleware/wrapper around the provider adapter from earlier in this phase, so it applies uniformly no matter which of the four providers actually served the request.

## Guardrails (non-negotiable)

- Every AI prompt must include a system-level instruction that responses are motivational/educational, not medical advice, and must decline (gracefully, in-character) requests that stray into medical diagnosis, extreme calorie restriction, or unsafe training advice — surface a short in-UI disclaimer near AI content.
- Never let the model fabricate the user's actual numbers — always pass computed stats into the prompt as context and instruct the model to reference only those.
- Rate-limit AI calls per user (client-visible cooldown state is fine for now) to control cost once real keys are wired in.

## What NOT to do

- Don't hardcode a single provider and call it "done" — the adapter pattern must genuinely support switching between all four without code changes at call sites
- Don't expose API keys to client-side code under any circumstance
- Don't let AI features leak to logged-out users through a missed check on some secondary entry point (audit every touchpoint listed above)
- Don't make AI the only source of the insight — always keep the deterministic/rule-based fallback so the feature degrades gracefully

## Deliverable & handoff

Give me the running app (with at least one provider wired to a real key for testing, others stubbed-but-structurally-ready), and a summary of the adapter interface and where the config/keys are expected to live — needed before Phase 6 (real backend) moves this config into a proper secrets-managed admin panel.
