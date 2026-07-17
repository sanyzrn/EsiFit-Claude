# EsiFit — Phase 3 Handoff

## Summary

Core product surfaces on mock data: 16 config-driven calculators (public core flow), workout library/builder/live tracker (voice + rest + PR), nutrition module, analytics (Recharts-themed + muscle volume body map), deterministic seed dataset, and offline queue for set/water/meal logs via IndexedDB + a shell service worker.

## Calculator config schema

`src/lib/calculators/config.ts` + formulas in `src/lib/calculators/formulas.ts`.

```ts
CalculatorConfig {
  id: CalculatorId;
  slug: string;
  name: string;
  description: string;
  category: "body" | "nutrition" | "performance";
  fields: CalculatorField[]; // key, label, min/max/step, defaultValue, unit?
  compute: (inputs: CalcInputs) => CalcResult;
  gaugeMax: number;
  showSeries?: boolean; // enables projection LineChart when result.series present
}

CalcResult {
  value: number;
  unit: string;
  band: string;
  interpretation: string;
  secondary?: Record<string, string | number>;
  series?: { x: number | string; y: number }[];
}
```

- Shell: `CalculatorShell` accepts `slug` (looks up config client-side — configs include functions and cannot cross the RSC boundary).
- History: Zustand persist `esifit-calc-history` (`useCalculatorHistoryStore`).
- Gating: anonymous can calculate; save / compare / share require sign-in. Share uses `html2canvas` with clipboard text fallback.
- Tests: `src/lib/calculators/formulas.test.ts` (Vitest).

## Chart theming

`src/lib/charts/theme.tsx` — `chartTheme` maps to CSS vars (`--mint`, `--plasma`, `--gold`, surface/axis tokens). Re-exports themed Recharts primitives + `ChartTooltipStyle()`. Analytics and calculator projection charts consume this; avoid raw Recharts defaults.

## Seed / shared mock shapes

- Catalog: `src/lib/mock/catalog.ts` (exercises + foods)
- Generator: `src/lib/mock/seed.ts` → `SeedDataset` (45 days default)
- Output: `src/lib/mock/generated/dataset.json` via `npm run seed` (`scripts/seed.ts`)
- Shape highlights: `weight`, `sleep`, `water`, `bodyFat`, `workouts[]`, `nutritionDays[]`, `xpLogs[]`, `muscleVolume`, `weeklyActivity`

## Workouts

- Library: searchable/filterable + `AnatomyBodyMap` targets + Web Speech set helper
- Builder store: `useWorkoutBuilderStore` (sets, supersets/drop-sets, named routines)
- Live session: big targets, rest timer + beep, PR glow, completion summary, offline enqueue for sets
- Routes: `/workouts`, `/workouts/builder`, `/workouts/session` (session is chrome-minimal, no dashboard shell)

## Nutrition

- Day planner slots, food search, macro rings, water quick-add, timeline, recipes, shopping list
- Offline enqueue for water/meal taps
- Route: `/nutrition` (DashboardShell)

## Analytics

- Weight/BF trends, radar, activity heatmap, muscle volume on body map, projection + insights, transformation slider reuse
- Route: `/analytics` (DashboardShell)

## Offline / PWA

- Queue: `src/lib/offline/queue.ts` (idb `esifit-offline`)
- Indicator: `OfflineIndicator` + `useOnline` / `useIsStandalone` hooks
- SW: `public/sw.js` registered by `SwRegister` in `AppProviders` — caches shell assets; tracker offline is IDB queue (not full offline app)
- Install: `/settings` → `SettingsInstallPanel` (beforeinstallprompt)

## Command palette

New nav/actions for workouts, nutrition, calculators, analytics, settings, builder, session, BMR/TDEE/1RM.

## Tests

`npm run test` — 15 passing (auth, dashboard gating, calculator formulas).

## Deferred / notes for Phase 4

- Full D3 custom heatmap/radar craft beyond Recharts themed wrappers
- Real sync reconciliation against a backend (still mock flush)
- Playwright E2E still deferred
- Calculators remain public (marketing chrome); authenticated modules use DashboardShell

## Run

```bash
npm install && npm run seed && npm run dev
# Calculators: /calculators (no login)
# App modules: login → /workouts | /nutrition | /analytics | /settings
```
