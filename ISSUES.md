# EsiFit — Unified Issue Tracker

**Created:** 2026-07-15 (Phase 0 reconciliation)  
**Sources:** `EsiFit_Full_Audit_2026-07-15.md` (Report A) · `EsiFit_Full_Audit_2026-07-15 (1).md` (Report B)  
**Method:** Re-read both reports, inspected source, re-ran preview + Playwright probes on 2026-07-15.

---

## Phase 0 — Reconciliation Notes (Ground Truth)

### 1. Home page calculator count (Report A vs Report B)

| Report | Claim |
|--------|-------|
| **A** (`EsiFit_Full_Audit_2026-07-15.md:44`) | Home has **13 of 14** calculators; missing separate `% of 1RM Table` (`rep-max-table` slug) |
| **B** (`EsiFit_Full_Audit_2026-07-15 (1).md:118,163-164`) | All **14** present across 4 tabs |

**Verified ground truth (source + runtime, 2026-07-15):**

- `HomeSmartTools.tsx` mounts **13 distinct calculator components** across 4 tabs:
  - Body (5): BMI, Body Fat, FFMI, WHR, Body Type Quiz
  - Energy (4): BMR, TDEE, Macros, Water Intake
  - Strength (2): One-Rep Max, Volume Load
  - Health (2): Goal Date, Calories Burned
- `/calculators` index lists **14 slugs** (`Calculators.tsx:14-27`); `rep-max-table` maps to the same `OneRepMaxCalculator` as `one-rep-max` (`Calculators.tsx:45`).
- `OneRepMaxCalculator` **embeds the %1RM percentage table** in its results UI (`StrengthTrainingCalculators.tsx:31-46`).
- Playwright on Strength tab: `has1RM: true`, `hasPctTable: true` (%, 90%, 95% visible).

**Resolution:** Report A is **correct** that there is no *separate* 14th home widget for `rep-max-table`. Report B is **correct** that the %1RM table **functionality** is available on Home inside the 1RM calculator. Not a broken calculator — a **naming/routing duplication** only on `/calculators`.  
**Phase assignment:** **Phase 5** — optional: add explicit `rep-max-table` tab entry on Home OR document that 13 widgets cover 14 slugs (`CALC-1`).

---

### 2. Firebase boot-probe / Firestore console errors (Report A vs Report B)

| Report | Claim | Severity |
|--------|-------|----------|
| **A** (`EsiFit_Full_Audit_2026-07-15.md:26,119`) | Firestore failures in audit sandbox are **network egress limitation**, not app bugs | N/A (environment) |
| **B** (`EsiFit_Full_Audit_2026-07-15 (1).md:27-36,202-208`) | `testConnection()` in `main.tsx` causes **red Firestore errors on every route** | High |

**Verified ground truth (re-run 2026-07-15):**

- Outbound HTTPS to `firestore.googleapis.com` **succeeds** in this environment (`curl` → HTTP 404 at root, connection OK).
- Playwright cold boot on `http://127.0.0.1:4174/` + navigation to `/calculators/bmi`: **`bootLogs: []`, `navLogs: []`** — zero console errors/warnings.
- Report B's errors were observed in a **network-restricted** prior run (Playwright crawl logged `Could not reach Cloud Firestore backend` on every route).
- `main.tsx:8-18` still runs unconditional `getDocFromServer(doc(db,'test','connection'))` on every boot — unnecessary round-trip; catch block only logs for offline message substring.

**Resolution:** Red error spam is **environment-dependent** (sandbox egress), **not reproducible** with open network today. The boot probe is still **undesirable production code** (wasted request, potential noise if Firestore/project misconfigured).  
**Phase assignment:** **Phase 2**, severity downgraded to **Low** (`BUG-12`). Not Phase 2 High unless errors recur with healthy network.

---

### 3. Design token identity (Report B only)

**Verified (`src/index.css:4-13`, no pine/bone/ember/brass in `src/`):**

```css
--color-brand: #f97316;   /* orange-500 */
--color-surface: #111827; /* gray-900 */
```

App uses orange + gray-950 throughout. Audit brief's pine/bone/ember/brass palette **not present** in current theme.

**Resolution:** Not a bug — **product/design decision** for Phase 8 (`UI-2`): adopt orange/gray as canonical brand OR restore documented palette.

---

## Issue Index

Status legend: `open` · `fixed` · `deferred` · `investigated-not-reproducible` · `intentional-demo`

| ID | Severity | Phase | Status | Title |
|----|----------|-------|--------|-------|
| SEC-1 | Critical | 1 | open | Firestore rules allow users to self-write `role` and `subscriptionTier` |
| SEC-2 | Critical | 1 | open | Tier/role gating reads client-controlled `localStorage` only |
| SEC-3 | High | 3 | open | Fake payment upgrade (`upgradeTier` local flip only) |
| AUTH-1 | High | 2 | open | Register "Sign up with Google" is a no-op |
| AUTH-2 | High | 2 | open | Forgot password never calls `sendPasswordResetEmail` |
| AUTH-3 | Medium | 2 | open | `syncUserFromFirebase` hardcodes fake profile defaults |
| DATA-1 | Medium | 4 | open | Body/exercise logs, tickets, saves, calculator history are localStorage-only |
| DATA-2 | Medium | 4 | open | Profile fields not persisted to Firestore |
| CALC-1 | Low | 5 | open | Home has 13 widgets / 14 slugs (`rep-max-table` not separate on Home) |
| CALC-2 | Medium | 5 | open | BMI `height=0` → Infinity (no guard) |
| CALC-3 | Medium | 5 | open | WHR `hip=0` → Infinity (no guard) |
| CALC-4 | Medium | 5 | open | Brzycki 1RM `reps≥37` → NaN |
| BUG-1 | Medium | 7 | open | Program detail exercise links use wrong slug (404) |
| BUG-2 | Low | 7 | open | Anatomy "Neck" maps to muscle group with zero exercises |
| BUG-3 | Low | 7 | open | `TierGate` gate copy not i18n-wrapped |
| BUG-4 | Medium | 7 | open | Auth pages (Login/Register/Forgot) have zero `t()` calls |
| BUG-5 | Low | 8 | open | `TierGate` renders gated content in DOM behind blur |
| BUG-6 | Medium | 8 | open | Tablet 768px horizontal overflow (scrollWidth 830px) |
| BUG-7 | Low | 8 | open | Hero image `alt=""` empty |
| BUG-8 | Medium | 8 | open | Calculator gauges lack `aria-live` / sliders lack `aria-valuenow` |
| BUG-9 | Low | 8 | open | Silent upgrade with no toast/confirmation |
| BUG-10 | Low | 8 | open | Register: no password show/hide or strength indicator |
| BUG-11 | Low | 8 | open | Firebase raw `err.message` shown in Auth (not localized) |
| BUG-12 | Low | 2 | open | `main.tsx` unconditional `testConnection()` boot probe |
| TOOL-1 | Medium | 6 | open | `npm run lint` fails — ESLint not installed |
| TOOL-2 | Low | 6 | open | `tsc --noEmit` — 6 TS6133 unused-import errors |
| TOOL-3 | Medium | 6 | open | Static+dynamic import duplication defeats code-splitting |
| TOOL-4 | Low | 6 | open | Dead deps: `@base-ui/react`, `@date-fns/tz`, `vite-plugin-singlefile` |
| TOOL-5 | Medium | 6 | open | Main JS bundle 1,597 KB (495 KB gzip), single chunk |
| TOOL-6 | Low | 6 | open | Debug scripts `check.mjs` / `check.cjs` at repo root |
| TOOL-7 | Low | 6 | open | `Math.random()` in `generateId` UUID fallback (`store.ts:91`) |
| CONTENT-1 | Medium | 9 | open | Seed content (exercises/programs/diet/articles) not translated to Farsi |
| CONTENT-2 | Medium | 9 | open | Thin catalog: 10 exercises, 3 programs, 2 diets, 3 articles |
| CONTENT-3 | Low | 9 | intentional-demo | Admin/Coach dashboards use hardcoded demo data |
| CONTENT-4 | Low | 9 | intentional-demo | Coach chat auto-reply via `setTimeout` (demo) |
| UI-1 | — | 8 | open | Design token decision: orange/gray vs pine/bone/ember/brass |
| PERF-1 | Low | 6 | deferred | Lighthouse not run (tooling crashed in Report B sandbox) |

---

## Detailed Issues

### SEC-1 — Firestore rules allow users to self-write `role` and `subscriptionTier`
- **Severity:** Critical
- **Phase:** 1
- **Status:** open
- **Files:** `firestore.rules:43-45`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:65-72`) — B does not cite this separately (B focuses on localStorage bypass)
- **Evidence:** `allow update` permits `incoming().diff(existing()).affectedKeys().hasOnly(['name', 'role', 'subscriptionTier'])` with no privileged caller check. Any signed-in user can `updateDoc` their own `role: 'ADMIN'`, `subscriptionTier: 'ELITE'`.
- **Note:** Root cause behind both localStorage bypass AND direct SDK bypass.

### SEC-2 — Tier/role gating reads client-controlled `localStorage` only
- **Severity:** Critical
- **Phase:** 1
- **Status:** open
- **Files:** `src/lib/store.ts:9-33`, `src/components/TierGate.tsx:17-21`, `src/pages/Admin.tsx:13-17`, `src/pages/Programs.tsx:114-115`, `src/pages/Coach.tsx:14-16`
- **Reports:** A SEC-2 (`EsiFit_Full_Audit_2026-07-15.md:74-80`) · B Critical tier bypass (`(1).md:182-188`) · B Critical admin bypass (`(1).md:192-198`)
- **Repro (verified in prior audit runs):** Set `esifit_store.currentUser.subscriptionTier='ELITE'` or `role='ADMIN'` in localStorage → reload → VIP program content and Admin dashboard render.
- **Conflict note:** A treats Firestore self-write (SEC-1) as primary; B emphasizes localStorage. Both are valid attack paths; fix both in Phase 1.

### SEC-3 — Fake payment upgrade (`upgradeTier` local flip only)
- **Severity:** High
- **Phase:** 3
- **Status:** open
- **Files:** `src/pages/Pricing.tsx:16-24`, `src/lib/store.ts:80-85`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:82-85`) · B (`(1).md:141, PAY-1 equivalent`)
- **Note:** Reverts on next `syncUserFromFirebase` unless localStorage tampered.

### AUTH-1 — Register "Sign up with Google" is a no-op
- **Severity:** High
- **Phase:** 2
- **Status:** open
- **Files:** `src/pages/Auth.tsx:213`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:48,87-90`) · B (`(1).md:145,222-228`)
- **Evidence:** `onClick={() => {}}` on Register; Login Google works (`Auth.tsx:38-64`).

### AUTH-2 — Forgot password never sends email
- **Severity:** High
- **Phase:** 2
- **Status:** open
- **Files:** `src/pages/Auth.tsx:247-255`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:49,92-95`) · B (`(1).md:146,212-218`)

### AUTH-3 — `syncUserFromFirebase` hardcodes fake profile defaults
- **Severity:** Medium
- **Phase:** 2
- **Status:** open
- **Files:** `src/lib/store.ts:51-56`
- **Reports:** B (`(1).md:108,242-248`) · A mentions hybrid auth (`EsiFit_Full_Audit_2026-07-15.md:35`)
- **Evidence:** Always sets `age: 28`, `gender: 'male'`, `heightCm: 178`, `weightKg: 80`, `goal: 'MUSCLE_GAIN'`.

### DATA-1 — User activity data is localStorage-only
- **Severity:** Medium
- **Phase:** 4
- **Status:** open
- **Files:** `src/lib/store.ts:97-170`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:35`) · B (`(1).md:96-106,102-103`)
- **Scope:** bodyLogs, exerciseLogs, calculatorResults, tickets, savedExercises.

### DATA-2 — Profile fields not persisted to Firestore
- **Severity:** Medium
- **Phase:** 4
- **Status:** open
- **Files:** `src/lib/store.ts:73-77`, `src/pages/Dashboard.tsx` profile form
- **Reports:** B (`(1).md:148`) · A (`EsiFit_Full_Audit_2026-07-15.md:35`)

### CALC-1 — Home: 13 widgets vs 14 calculator slugs
- **Severity:** Low (product consistency, not broken math)
- **Phase:** 5
- **Status:** open
- **Files:** `src/components/calculators/HomeSmartTools.tsx`, `src/pages/Calculators.tsx:27,45`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:44`) vs B (`(1).md:163-164`) — **resolved in Phase 0** (see above)
- **Action:** Optional separate Home entry for `rep-max-table` OR update marketing copy to "13 interactive tools (14 on /calculators)".

### CALC-2 — BMI `height=0` → Infinity
- **Severity:** Medium
- **Phase:** 5
- **Status:** open
- **Files:** `src/lib/calculators.ts:5-7`
- **Reports:** B (`(1).md:170-171`) · A notes sliders floor weight at 40kg (`EsiFit_Full_Audit_2026-07-15.md:191`)

### CALC-3 — WHR `hip=0` → Infinity
- **Severity:** Medium
- **Phase:** 5
- **Status:** open
- **Files:** `src/lib/calculators.ts:148-152`
- **Reports:** B (`(1).md:173,252-258`)

### CALC-4 — Brzycki 1RM `reps≥37` → NaN
- **Severity:** Medium
- **Phase:** 5
- **Status:** open
- **Files:** `src/lib/calculators.ts:111`
- **Reports:** B (`(1).md:174,262-266`)

### BUG-1 — Program exercise links 404 (wrong slug)
- **Severity:** Medium
- **Phase:** 7
- **Status:** open
- **Files:** `src/pages/Programs.tsx:202`
- **Reports:** B (`(1).md:138,232-238`)

### BUG-2 — Anatomy "Neck" hotspot → empty exercise list
- **Severity:** Low
- **Phase:** 7
- **Status:** open
- **Files:** `src/pages/Exercises.tsx:17`, `src/lib/store.ts` (no Neck in muscleGroups)
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:107-110`) — B does not list

### BUG-3 — TierGate English-only copy
- **Severity:** Low
- **Phase:** 7
- **Status:** open
- **Files:** `src/components/TierGate.tsx:36-40`
- **Reports:** B (`(1).md:155,305-309`)

### BUG-4 — Auth pages not translated
- **Severity:** Medium
- **Phase:** 7
- **Status:** open
- **Files:** `src/pages/Auth.tsx` (no `t()` calls)
- **Reports:** B (`(1).md:156-157`) · A (`EsiFit_Full_Audit_2026-07-15.md:137`)

### BUG-5 — TierGate blur leaks gated content in DOM
- **Severity:** Low
- **Phase:** 8
- **Status:** open
- **Files:** `src/components/TierGate.tsx:26`, `src/index.css:44-48`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:138,175`)

### BUG-6 — Tablet 768px horizontal overflow
- **Severity:** Medium
- **Phase:** 8
- **Status:** open
- **Files:** Layout-wide (hero, pricing table, anatomy model suspected)
- **Reports:** B (`(1).md:271-277`) — A says no overflow at 375px only (`EsiFit_Full_Audit_2026-07-15.md:122`)
- **Re-verified 2026-07-15:** `/`, `/pricing`, `/exercises` at 768×1024 → `scrollWidth: 830`, `clientWidth: 768`, `overflow: true`.

### BUG-7 — Hero image missing alt text
- **Severity:** Low
- **Phase:** 8
- **Status:** open
- **Files:** `src/pages/Home.tsx:36`
- **Reports:** B (`(1).md:355`)

### BUG-8 — Calculator results not accessible to screen readers
- **Severity:** Medium
- **Phase:** 8
- **Status:** open
- **Files:** `src/components/calculators/SharedCalculatorUI.tsx` (`CircularGauge`, `SliderInput`)
- **Reports:** B UX audit (no `aria-live` in `src/`)

### BUG-9 — Silent upgrade (no toast/confirmation)
- **Severity:** Low
- **Phase:** 8
- **Status:** open
- **Files:** `src/pages/Pricing.tsx:22-23`
- **Reports:** B UX section

### BUG-10 — Register lacks password show/hide and strength indicator
- **Severity:** Low
- **Phase:** 8
- **Status:** open
- **Files:** `src/pages/Auth.tsx:199-205`
- **Reports:** B UX audit (implied in phase instructions)

### BUG-11 — Firebase raw errors in Auth UI
- **Severity:** Low
- **Phase:** 8
- **Status:** open
- **Files:** `src/pages/Auth.tsx:32,159`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:137`)

### BUG-12 — `main.tsx` boot probe (downgraded)
- **Severity:** Low (was High in Report B)
- **Phase:** 2
- **Status:** open
- **Files:** `src/main.tsx:8-18`
- **Reports:** B High (`(1).md:202-208`) · A sandbox note (`EsiFit_Full_Audit_2026-07-15.md:26,119`)
- **Phase 0 resolution:** Not reproducible with open network; remove/silence anyway.

### TOOL-1 — ESLint not installed
- **Severity:** Medium
- **Phase:** 6
- **Status:** open
- **Files:** `package.json:9`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:33,102-105`) · B (`(1).md:70-75,281-285`)

### TOOL-2 — TypeScript unused imports (6 errors)
- **Severity:** Low
- **Phase:** 6
- **Status:** open
- **Files:** `BodyCompositionCalculators.tsx:1,5`, `EnergyNutritionCalculators.tsx:1`, `HealthLifestyleCalculators.tsx:1`, `StrengthTrainingCalculators.tsx:1`, `Calculators.tsx:4`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:34`) · B (`(1).md:77-85,290-294`)

### TOOL-3 — Static+dynamic import duplication
- **Severity:** Medium
- **Phase:** 6
- **Status:** open
- **Files:** `HomeSmartTools.tsx:5-44`, `Calculators.tsx:6-9`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:32,97-100`) · B (`(1).md:57-64`)

### TOOL-4 — Dead dependencies
- **Severity:** Low
- **Phase:** 6
- **Status:** open
- **Files:** `package.json` (`@base-ui/react`, `@date-fns/tz`, `vite-plugin-singlefile`)
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:155-156`) · B (`(1).md:66,518-519`)

### TOOL-5 — Oversized single JS chunk
- **Severity:** Medium
- **Phase:** 6
- **Status:** open
- **Files:** `vite.config.ts`, build output
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:154-156`) · B (`(1).md:48-54,457-470`)
- **Evidence:** `index-*.js` 1,597.15 kB / 494.84 kB gzip (build 2026-07-15).

### TOOL-6 — Debug scripts at repo root
- **Severity:** Low
- **Phase:** 6
- **Status:** open
- **Files:** `check.mjs`, `check.cjs`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:112-114`)

### TOOL-7 — `Math.random()` in ID fallback
- **Severity:** Low
- **Phase:** 6
- **Status:** open
- **Files:** `src/lib/store.ts:87-94`
- **Reports:** B (`(1).md:297-301`) · A ruled low risk (`EsiFit_Full_Audit_2026-07-15.md:118`)

### CONTENT-1 — Seed content not in Farsi
- **Severity:** Medium
- **Phase:** 9
- **Status:** open
- **Files:** `src/lib/store.ts` (EXERCISES, PROGRAMS, DIET_PLANS, ARTICLES)
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:20,57`) · B (`(1).md:156-157`)

### CONTENT-2 — Thin content catalog
- **Severity:** Medium
- **Phase:** 9
- **Status:** open
- **Files:** `src/lib/store.ts`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:21`) · B (`(1).md:133-140`)

### CONTENT-3 — Admin dashboard demo data
- **Severity:** Low
- **Phase:** 9
- **Status:** intentional-demo
- **Files:** `src/pages/Admin.tsx:29-36`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:54`) · B (`(1).md:153`)

### CONTENT-4 — Coach chat demo auto-reply
- **Severity:** Low
- **Phase:** 9
- **Status:** intentional-demo
- **Files:** `src/pages/Dashboard.tsx:529-539`
- **Reports:** B (`(1).md:151,567-571` appendix)

### UI-1 — Design token / brand palette decision
- **Severity:** N/A (decision)
- **Phase:** 8
- **Status:** open
- **Files:** `src/index.css`, Tailwind theme
- **Reports:** B (`(1).md:315-325`) — resolved in Phase 0 #3

### PERF-1 — Lighthouse not completed
- **Severity:** Low
- **Phase:** 6 (deferred to Phase 10)
- **Status:** deferred
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:157,188`) · B (`(1).md:462-463`, crash in sandbox)
- **Note:** Bundle metrics from `vite build` used instead.

---

## Investigated — Not Reproducible / Ruled Out

| Claim | Report | Resolution |
|-------|--------|------------|
| Debug XSS error overlay in `index.html` | A ruled out (`EsiFit_Full_Audit_2026-07-15.md:117`) | **Confirmed absent** in current `index.html` |
| `Math.random()` ID collisions as primary ID path | A (`EsiFit_Full_Audit_2026-07-15.md:118`) | Uses `crypto.randomUUID()` first; fallback only |
| React console errors on all routes | A zero errors in crawl | B errors were Firebase network — **environment-specific** |
| Mobile 375px overflow | A no issues · B not exhaustively tested at 768 only | 375px OK per both; **768px overflow confirmed** (BUG-6) |
| Fake "any password" login | June `EsiFit_Review_Report.md` only | **Superseded** — real Firebase auth now (`Auth.tsx`) |

---

## Changelog

| Date | Phase | Change |
|------|-------|--------|
| 2026-07-15 | 0 | Initial unified list from Reports A & B; reconciled calculator count, Firebase probe severity, design tokens |
