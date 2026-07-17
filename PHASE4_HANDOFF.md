# EsiFit — Phase 4 Handoff

## Summary

Retention layer on mock data: XP/levels/badges/missions/unlockables, reusable `CelebrationHost`, community feed (sanitized UGC + report queue), challenges/leaderboards, weekly recap with privacy toggles + `/api/og/recap`, shop cart/checkout/coupons/gifts, and a real notification center wired to the dashboard bell.

## Gamification

- Levels: `src/lib/gamification/levels.ts` — `levelFromTotalXp`, `xpRequiredForLevel`, `XP_REWARDS`
- Store: `useGamificationStore` (`esifit-gamification`) — totalXp, badge progress, mission lifecycle (Active → Completed → Claimed), themes/frames
- UI: `/achievements`, `/missions`
- Celebration: `CelebrationHost` in `AppProviders` (one effect for level/badge/mission/PR)
- Workout session awards XP + mission bumps + PR celebration

## Community

- Store: `useCommunityStore` — posts/comments/likes (optimistic), challenges join/leave, leaderboard scopes, moderation reports, post cooldown
- Sanitize: `sanitizeUserText` / `validateImageFile` (`src/lib/sanitize.ts`) — text nodes only, no raw HTML
- Routes: `/community`, `/community/challenges`, `/community/leaderboard`
- Transformation stories use `BeforeAfterCompare`

## Weekly Recap + OG

- `/recap` — opt-in privacy defaults exclude body fat
- Client download via html2canvas
- Server OG: `GET /api/og/recap?streak=&workouts=&volume=&xp=&bf=&level=` (`next/og` ImageResponse)

## Store

- `useShopStore` — cart, coupons (`ESIFIT10`, `WELCOME20`, expired `OLD50`), gift codes (`GIFT50`/`GIFT25`), checkout states idle→form→processing→success/failure
- Routes: `/shop`, `/shop/cart`, `/shop/checkout`

## Notifications

- `useNotificationStore` — categorized list, mark read/clear, reminder prefs
- Bell dropdown in `DashboardShell` + full center on `/settings`
- Toasts for streak/milestone/mission pushes

## Mock vs backend (Phase 5/6 input)

| Area | Mocked now | Needs real wiring later |
|---|---|---|
| XP / badges / missions | Zustand persist | XP_LOG, BADGE, USER_MISSION tables + authoritative awards |
| Community | Local posts/likes/comments/reports | POST/COMMENT/LIKE + moderation queue API |
| Challenges / leaderboards | Seeded arrays | CHALLENGE + CHALLENGE_PARTICIPANT + ranking jobs |
| Recap / OG | Client canvas + edge OG route | Auth-scoped week aggregates |
| Shop | Cart + fake pay | Orders, Stripe/billing, inventory |
| Notifications / reminders | Local prefs + list | Push/email delivery, scheduling |

## Tests

`npm run test` — 20 passing (auth, dashboard, calculators, sanitize + levels).

## Run

```bash
npm install && npm run dev
# login → /achievements | /missions | /community | /shop | /recap | /settings
```
