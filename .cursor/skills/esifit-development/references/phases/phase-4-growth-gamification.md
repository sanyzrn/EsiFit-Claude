# EsiFit — Phase 4: Growth (Community, Gamification, Store, Notifications)

## Context

Continuing EsiFit. **Paste the Phase 3 handoff summary here** before running this prompt.

Scope: the retention/engagement layer. Still frontend-only, mock data, no backend.

## Gamification

- **XP & Levels**: a persistent XP bar (already started in Phase 2's dashboard) — build the full leveling system UI: level-up modal/celebration, XP-earning toast whenever a mock action occurs (finishing a workout, hitting a streak, etc.)
- **Badges & Achievements**: a gallery grid (locked vs unlocked states, unlock animation, progress-toward-next-badge indicators for partially-complete ones)
- **Daily / Weekly / Monthly missions**: a missions panel with clear progress bars, claim-reward interaction, countdown to reset
- **Unlockables**: cosmetic or feature unlocks tied to level (e.g. new dashboard themes, profile frames) — build at least a couple of real unlockable examples, not just placeholders
- **Animated celebrations**: build one polished, reusable celebration component (confetti/particle burst + sound-optional + haptic-style micro-animation) used consistently across PRs, level-ups, badge unlocks, and mission completions — don't build four different celebration effects

## Community

- **Feed**: posts (text/photo), like/comment interactions (optimistic UI updates against mock state), infinite scroll or paginated load
- **Transformation stories**: featured long-form posts combining before/after photos + narrative, using the transformation-slider component
- **Challenges**: joinable challenges with a description, duration, participant count, and a leaderboard scoped to that challenge; joined/not-joined states
- **Leaderboards**: global + friends-only + challenge-scoped views, current-user row always visible/sticky even if far down the list, rank-change indicators (up/down arrows since last period)
- **Weekly Recap card** — an auto-generated, beautifully designed shareable summary (Spotify-Wrapped style) of the user's week: key stats, a highlight moment (a PR, a streak milestone), rendered client-side (canvas or styled DOM-to-image) as a downloadable/shareable image. This is a growth-loop feature — make it something people would actually want to post. **Also generate a server-side Open Graph image** (e.g. via a Next.js route handler using `@vercel/og`/Satori-style rendering) for the shareable recap/challenge/profile-highlight links, so previews actually render correctly when the link is pasted into Twitter/X, Discord, or messaging apps — the client-side canvas version alone only helps with direct image download/share, it won't produce a link preview on other platforms.

## Store

- Programs, subscriptions, bundles listing (card grid, consistent with Pricing section styling from Phase 1)
- Coupon code input with mock validation (valid/invalid/expired states)
- Gift cards (purchase flow UI + redeem flow UI)
- Cart/checkout UI (mock payment step — do not build real payment integration, just the UI states: form → processing → success/failure)

## Notifications

- Notification center (the bell icon from Phase 2's topbar becomes fully functional against mock data): categorized (workout reminders, nutrition reminders, streak alerts, milestone celebrations, community activity), mark-as-read, clear-all
- Smart reminder settings page: toggles + time pickers for workout/nutrition/water reminders (UI + mock persisted preferences, no real push notifications yet)
- In-app toast system extended to cover: streak-at-risk alerts, milestone celebrations, mission-claimed confirmations

## Non-functional bar

Same as prior phases. Real-time-feeling interactions (likes, XP toasts, leaderboard rank changes) should use optimistic UI updates against the mock store so they feel instant, with graceful rollback UI for simulated failure cases.

## What NOT to do

- Don't build four different confetti/celebration implementations — one reusable component, reused everywhere
- Don't make the store feel like a generic e-commerce template — keep it in the EsiFit visual language (glass cards, same type scale, same motion presets)
- Don't skip empty states: empty feed, no challenges joined, empty notification center, empty cart — all need designed, on-brand empty states, not blank pages

## Deliverable & handoff

Give me the running app and a summary of what's been mocked vs what will need real backend wiring — this becomes the input spec for Phase 5 (backend).
