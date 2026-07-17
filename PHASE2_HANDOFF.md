# EsiFit — Phase 2 Handoff

## Summary

Auth UI (mock), skippable onboarding wizard, Tesla-style dashboard shell with reorderable widgets, Daily Readiness + Progress Score heroes, ⌘K command palette, TanStack Query mock layer, and Vitest coverage for auth/session + VIP gating.

## Mock data shapes (consume in Phase 3+)

See `src/lib/types.ts` and `src/lib/mock/dashboard.ts`.

- **User / UserProfile**: `id, email, name, role_id, role, tier, emailVerified, profile`
- **Profile fields from onboarding**: `primaryGoal`, `experienceLevel`, `equipment[]`, `age`, `sex`, `heightCm`, `weightKg`, `targetWeightKg`, `notificationPreference`, `wearableConnected`, `onboardingCompleted`, `onboardingSkipped`
- **Goal**: `{ id, user_id, type, target_value, current_value, target_date, status }`
- **DashboardData**: progress/readiness scores, todayWorkout, nutrition macros, water, sleep/weight/bodyFat trends (7–14 pts), xp/level/streak, goals, weeklyActivity[7], timeline, notifications, milestones, VIP unlock booleans
- History generators: `generateWeightHistory` / `generateSleepHistory` / `generateWaterHistory` (30 days, seeded)

## Widget API

All widgets accept `WidgetProps<DashboardData>` plus optional `dragHandleProps`:
`{ data?, loading?, error?, locked?, lockReason?, empty?, emptyMessage?, onRetry?, dragHandleProps? }`

Hero widgets: `ProgressScoreWidget`, `ReadinessWidget`. Locked VIP cards: `AnalyticsTeaserWidget`, `CoachMessagesWidget`.

## Auth / session

- Zustand persist (`esifit-auth`) + BroadcastChannel `esifit-auth-sync` + `storage` event
- Mock TTL: 7 days → `status: "expired"` → `/login?expired=1`
- Demo emails: `vip@…`, `vipplus@…`, `coach@…`, `admin@…`, `*new*@…` (forces onboarding)

## Command palette

`registerCommand({ id, label, group, keywords?, run })` in `src/lib/command-registry.ts`. Invoked via ⌘K / Ctrl+K.

## Tests added

- `src/stores/auth-store.test.ts` — login, logout, expiry, profile update, cross-tab logout
- `src/lib/mock/dashboard.test.ts` — trends + VIP gating
- `npm run test` — 9 passing

## Deferred

- Playwright E2E for signup→dashboard (manual path verified via routes; E2E scaffold deferred — logged in PRODUCT_DECISIONS)
- Contextual PWA install prompt (still post-engagement)

## Run

```bash
npm install && npm run dev
# then /signup or /login → /onboarding → /dashboard
```
