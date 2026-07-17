# EsiFit — SECURITY_PRIVACY.md

**Paste this alongside `PROJECT_RULES.md` from Phase 2 onward, and mandatorily from Phase 4 (Community) and Phase 5 (AI).** The original phase prompts treat security as "a Phase 6+ concern, since this is mock data" — that's correct for auth/network security, but wrong for two things that must be handled from the moment they're introduced: user-generated content and sensitive personal data. Both exist well before Phase 6.

## Why this can't wait for Phase 6

Phase 6 is when *real* auth, real rate-limiting, and real input validation against a real attacker matter. But two categories of risk exist the moment the *feature*, not the backend, ships:

1. **User-generated content** (Phase 4 community posts/comments) — even against mock data, if the render path doesn't escape/sanitize user input, the component itself is unsafe, and that unsafe pattern gets copy-pasted forward into Phase 6 where it becomes a real XSS vector against real users.
2. **Sensitive personal data** (weight, body fat %, sleep, nutrition logs) — this is health-adjacent data. How it's displayed, exported, shared, and eventually stored has real privacy implications that are much cheaper to design correctly now than to retrofit after Phase 6 ships real storage.

## User-generated content rules (from Phase 4 onward)

- Any user-authored text (posts, comments, profile bio, workout notes) renders through a sanitization layer — never `dangerouslySetInnerHTML` on raw user input, even against mock/seeded data. Establish the pattern now so it's not an afterthought when real users post real content in Phase 6+.
- Image uploads (post photos, transformation before/afters, avatars) are validated client-side for type/size even in the mock phase, so the UI states (rejected file, too large, wrong type) exist and are tested — not just assumed to always succeed.
- A basic **report/flag** affordance on posts and comments should exist from Phase 4, even if it just writes to a mock moderation queue with no real backend yet. Community features without a visible reporting path are a known abuse vector; design the empty state ("no reports") and the flagged state now so Phase 7's Admin Panel has something real to manage instead of inventing the whole moderation UI from scratch.
- Rate-limit-shaped UI (e.g. a cooldown on posting/commenting) should be represented in the mock store now, even if not enforced against a real backend yet — same reasoning as the auth-quota pattern already established in Phase 5.

## Sensitive data handling rules (from Phase 2 onward)

- Weight, body fat %, sleep, and nutrition data are treated as sensitive throughout the UI: no third-party analytics/tracking script should receive these values even in mock form (don't wire raw health metrics into any analytics call without an explicit, later decision to do so — see Product Analytics note below).
- The **Share** and **Weekly Recap / OG image** features (Phase 4) must let the user choose what's included before generating a public-facing image or link — default to a safer subset (e.g. workout streak, not exact body-fat percentage) rather than exposing every metric by default. Log this as a `PRODUCT_DECISIONS.md` entry once implemented, since it's a real privacy-vs-shareability tradeoff.
- Export/download of personal data (calculator history, progress data) should be scoped to "your own data only" from the UI's perspective even now, so the pattern is already correct when Phase 6 makes it a real authenticated export.
- A placeholder **Privacy Policy** page (Phase 1's Footer already links somewhere — make sure it's a real, even if generic-for-now, Privacy Policy page rather than a dead link) should state, in plain language: what's collected, that health metrics are self-reported and not medical records, and that AI-generated content (Phase 5) uses the member's logged data as context. This can be genuinely placeholder copy in Phases 1–5, but it must exist and be linked, not a 404.

## AI-specific guardrails (Phase 5, in addition to what's already in `phase-5-ai-assistant.md`)

- Prompts sent to any AI provider must never include more personal data than the specific insight requires (e.g. a BMI insight doesn't need the user's full nutrition log). Scope context per-touchpoint, not "send the whole user profile every time" for convenience.
- Token usage logs (already required in Phase 5) should store token counts and metadata, not full prompt/response text, unless there's an explicit, separately-decided debugging need — logging full personal health context in a plaintext log file is a real exposure risk even in development.

## Definition of Done — addition

Add to `PROJECT_RULES.md`'s Definition of Done, active from Phase 4 onward:

- [ ] All user-generated content renders through sanitized paths — no raw HTML injection from user input
- [ ] Report/flag affordance present on any new user-generated content surface
- [ ] Any new sensitive-data display, export, or share surface has been checked against "would I be comfortable with this being the default, publicly shareable view?"
- [ ] Privacy Policy page updated if this phase introduced a new category of data collection or sharing

## Note on Product Analytics

If a product analytics tool (PostHog, Amplitude, etc.) is added in a later phase to track the calculator → signup funnel (relevant given `CONTENT_STRATEGY.md`'s stated funnel goal), that decision should go through `PRODUCT_DECISIONS.md` explicitly, with a stated rule that raw health metric values are never sent as event properties — only anonymized/bucketed signals (e.g. "completed a calculator," not "user's exact body fat % was sent to a third-party analytics tool").
