# EsiFit — FEATURE_FLAGS.md

Every major feature area is gated behind a flag from Phase 1 onward — even while everything defaults to "on" during development, this makes each area independently toggleable for demos, staged rollouts, and later A/B or role-based rollout without a code change.

## Implementation pattern

- A single typed config object (e.g. `lib/feature-flags.ts`) exporting a `FeatureFlags` type and a `useFeatureFlag(flag)` hook.
- Default source for now: a local config file (environment-variable-backed is fine). In Phase 6+ this can move to a real flag service/admin-panel-managed table without changing call sites — the hook interface must stay stable.
- Any component gating a whole feature area behind a flag must have a sensible "disabled" state (hide the nav entry, don't just crash if the route is hit directly).

## Registry

| Flag | Controls | Introduced | Default |
|---|---|---|---|
| `BLOG` | Public articles/blog hub | Phase 1 | on |
| `AI_CHAT` | Free-form "Ask EsiFit AI" entry point | Phase 5 | on |
| `AI_ANALYTICS` | AI-generated insights on calculators/workouts/analytics | Phase 5 | on |
| `SHOP` | Store, subscriptions, gift cards, checkout UI | Phase 4 | on |
| `COMMUNITY` | Feed, challenges, leaderboards | Phase 4 | on |
| `VOICE` | Voice-powered workout set logging | Phase 3 | on |
| `NOTIFICATIONS` | Notification center + reminder settings | Phase 4 | on |
| `OFFLINE_TRACKERS` | Offline-first workout/water tracking | Phase 3 | on |
| `COMMAND_PALETTE` | ⌘K global command palette | Phase 2 | on |
| `WEEKLY_RECAP` | Shareable weekly recap card + OG image generation | Phase 4 | on |
| `READINESS_SCORE` | Daily Readiness Score widget | Phase 2 | on |
| `MUSCLE_HEATMAP` | Muscle volume heatmap on Analytics | Phase 3 | on |
| `CALCULATORS` | The 16 interactive calculators (public access flow) | Phase 3 | on |
| `ANALYTICS` | Progress Analytics page (charts, insights) | Phase 3 | on |
| `STORE` | Store/checkout UI specifically (finer-grained than `SHOP` if needed) | Phase 4 | on |
| `ACHIEVEMENTS` | Badges/achievements gallery (finer-grained than the broader gamification system) | Phase 4 | on |
| `ANATOMY_VIEW` | Anatomical body-map component (exercise target muscles, heatmap) | Phase 1 | on |
| `MOTION` | Master switch for non-essential animation (independent of `prefers-reduced-motion`, e.g. for low-power-mode or a "reduce visual noise" user setting) | Phase 1 | on |
| `BLOG_SEARCH` | Search within the articles/blog hub | Phase 1 | on |
| `EXPERIMENTAL_UI` | Wraps any in-progress/unreviewed UI so it can ship to a build without being user-visible yet | Phase 1 | off |

## Adding a new flag

Whenever a phase introduces a new toggleable feature area, add a row here in that phase's handoff — don't let flags accumulate undocumented in code.

**Deliberately not added yet**: flags for features that aren't scoped in any phase prompt or roadmap item (e.g. a body-scan/photo-analysis feature, public user profiles) are intentionally excluded — an unattached flag with no feature behind it is dead code and invites scope creep. Add the flag in the same phase that actually builds the feature, not before.
