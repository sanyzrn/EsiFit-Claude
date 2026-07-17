# EsiFit — PWA_INSTALLABILITY.md

**Paste this alongside `PROJECT_RULES.md` when running Phase 1 (manifest/icons) and Phase 3 (service worker, since offline trackers are already scoped there).** `phase-3-core-features.md` already commits to offline-first Workout/Water/Nutrition trackers via a service worker — this document just makes the natural extension explicit: since the service-worker groundwork is being built anyway, real installability (Add to Home Screen) is nearly free and directly reinforces the stated gym-offline use case.

## Why this belongs in scope, not a "someday" idea

The product's own reasoning for offline trackers is "realistic for a gym basement" (`PRODUCT_DECISIONS.md`). A user who relies on the app mid-workout benefits far more from a home-screen icon and an app-like launch (no browser chrome, no address bar) than from offline support alone — and the incremental cost is small once a service worker already exists for the trackers.

## Scope

**Phase 1 additions:**
- `manifest.json` (or Next.js's `app/manifest.ts`): app name, short name, theme color (matching the dark-graphite palette), background color, icons (a full icon set: 192px, 512px, maskable variant), display mode `standalone`.
- App icon design consistent with the brand mark defined in Phase 1's design system — not a generic placeholder icon.
- Basic "Add to Home Screen" affordance: a dismissible, non-intrusive prompt (never a blocking modal) shown after a signed-in user has engaged meaningfully (e.g. completed onboarding or logged a first workout) — not on first landing-page visit, which would feel premature and get dismissed reflexively.

**Phase 3 additions (alongside the already-scoped offline trackers):**
- Service worker registration covers the app shell (so it loads instantly on repeat visits, standalone-launch included), in addition to the already-scoped offline queue behavior for Workout/Water/Nutrition logging.
- A visible install-state indicator (e.g. in settings: "Installed" vs. an install button) so users on desktop/Android know the option exists — iOS Safari's manual "Add to Home Screen" instructions should be surfaced contextually there, since iOS doesn't support the automatic install prompt.

## Explicit non-goals (avoid scope creep)

- This is **not** a request to build a native app (iOS/Android app store builds) — that's a genuinely separate project with its own tooling (React Native, Capacitor, etc.) and shouldn't be implied by "PWA."
- Full-app offline (every page, every feature working with no connection) is still explicitly out of scope — `PRODUCT_DECISIONS.md`'s existing decision to scope offline to the trackers only stands; installability doesn't expand that scope, it just makes the *installed app* launch instantly and feel native, with the same offline boundaries already defined.
- Push notifications via the service worker are a separate, later decision — don't bundle real push infrastructure into this; the notification center (Phase 4) remains in-app/mock until that's deliberately scoped.

## Definition of Done — addition

Add to `PROJECT_RULES.md`'s Definition of Done, active from Phase 1 (manifest) and Phase 3 (service worker) onward:

- [ ] `manifest.json`/`app/manifest.ts` present with correct icons, theme color, and `standalone` display mode
- [ ] App is installable (Chrome/Edge "Install app" prompt, or the equivalent Lighthouse PWA check, passes)
- [ ] Install prompt is contextual and dismissible, never shown before meaningful engagement, never a blocking modal
- [ ] iOS manual-install instructions are surfaced somewhere reachable (since iOS has no automatic prompt)

## Handoff note

Phase 1's handoff should include the manifest/icon set produced. Phase 3's handoff should note whether the service worker's app-shell caching and the tracker offline-queue logic share a single service worker file (preferred, per the "don't duplicate infrastructure" spirit of `PROJECT_RULES.md`) or were built separately, and why, if so.
