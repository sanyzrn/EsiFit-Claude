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

Status legend: `open` · `fixed` · `deferred` · `investigated-not-reproducible` · `intentional-demo` · `verified-alt`

| ID | Severity | Phase | Status | Title |
|----|----------|-------|--------|-------|
| SEC-1 | Critical | 1 | fixed | Firestore rules allow users to self-write `role` and `subscriptionTier` |
| SEC-2 | Critical | 1 | fixed | Tier/role gating reads client-controlled `localStorage` only |
| SEC-3 | High | 3 | fixed | Fake payment upgrade (`upgradeTier` local flip only) |
| AUTH-1 | High | 2 | fixed | Register "Sign up with Google" is a no-op |
| AUTH-2 | High | 2 | fixed | Forgot password never calls `sendPasswordResetEmail` |
| AUTH-3 | Medium | 2 | fixed | `syncUserFromFirebase` hardcodes fake profile defaults |
| DATA-1 | Medium | 4 | fixed | Body/exercise logs, tickets, saves, calculator history are localStorage-only |
| DATA-2 | Medium | 4 | fixed | Profile fields not persisted to Firestore |
| CALC-1 | Low | 5 | fixed | Home has 13 widgets / 14 slugs (`rep-max-table` not separate on Home) |
| CALC-2 | Medium | 5 | fixed | BMI `height=0` → Infinity (no guard) |
| CALC-3 | Medium | 5 | fixed | WHR `hip=0` → Infinity (no guard) |
| CALC-4 | Medium | 5 | fixed | Brzycki 1RM `reps≥37` → NaN |
| BUG-1 | Medium | 7 | fixed | Program detail exercise links use wrong slug (404) |
| BUG-2 | Low | 7 | fixed | Anatomy "Neck" maps to muscle group with zero exercises |
| BUG-3 | Low | 7 | fixed | `TierGate` gate copy not i18n-wrapped |
| BUG-4 | Medium | 7 | fixed | Auth pages (Login/Register/Forgot) have zero `t()` calls |
| BUG-5 | Low | 8 | fixed | `TierGate` renders gated content in DOM behind blur |
| BUG-6 | Medium | 8 | fixed | Tablet 768px horizontal overflow (scrollWidth 830px) |
| BUG-7 | Low | 8 | fixed | Hero image `alt=""` empty |
| BUG-8 | Medium | 8 | fixed | Calculator gauges lack `aria-live` / sliders lack `aria-valuenow` |
| BUG-9 | Low | 8 | fixed | Silent upgrade with no toast/confirmation |
| BUG-10 | Low | 8 | fixed | Register: no password show/hide or strength indicator |
| BUG-11 | Low | 8 | fixed | Firebase raw `err.message` shown in Auth (not localized) |
| BUG-12 | Low | 2 | fixed | `main.tsx` unconditional `testConnection()` boot probe |
| TOOL-1 | Medium | 6 | fixed | `npm run lint` fails — ESLint not installed |
| TOOL-2 | Low | 6 | fixed | `tsc --noEmit` — 6 TS6133 unused-import errors |
| TOOL-3 | Medium | 6 | fixed | Static+dynamic import duplication defeats code-splitting |
| TOOL-4 | Low | 6 | fixed | Dead deps: `@base-ui/react`, `@date-fns/tz`, `vite-plugin-singlefile` |
| TOOL-5 | Medium | 6 | fixed | Main JS bundle 1,597 KB (495 KB gzip), single chunk |
| TOOL-6 | Low | 6 | fixed | Debug scripts `check.mjs` / `check.cjs` at repo root |
| TOOL-7 | Low | 6 | fixed | `Math.random()` in `generateId` UUID fallback (`store.ts:91`) |
| CONTENT-1 | Medium | 9 | fixed | Seed content (exercises/programs/diet/articles) not translated to Farsi |
| CONTENT-2 | Medium | 9 | fixed | Thin catalog: 10 exercises, 3 programs, 2 diets, 3 articles |
| CONTENT-3 | Low | 9 | intentional-demo | Admin/Coach dashboards use hardcoded demo data |
| CONTENT-4 | Low | 9 | intentional-demo | Coach chat auto-reply via `setTimeout` (demo) |
| UI-1 | — | 8 | fixed | Design token decision: orange/gray vs pine/bone/ember/brass |
| UI-11 | — | 11 | fixed | Modernize & Iranize UI: Persian teal accent, layout split, mobile bottom nav |
| UI-12 | — | 12 | fixed | Iranian visual identity: saffron/firuze palette, patterns, charts, photography |
| PERF-1 | Low | 10 | verified-alt | Lighthouse CLI unavailable; build metrics + a11y static checks used |

---

## Detailed Issues

### SEC-1 — Firestore rules allow users to self-write `role` and `subscriptionTier`
- **Severity:** Critical
- **Phase:** 1
- **Status:** fixed (2026-07-15)
- **Files:** `firestore.rules`, `functions/src/index.ts`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:65-72`) — B does not cite this separately (B focuses on localStorage bypass)
- **Before:** `allow update` permitted `incoming().diff(existing()).affectedKeys().hasOnly(['name', 'role', 'subscriptionTier'])` — any signed-in user could self-promote.
- **After:** Create enforces `role == 'USER'` and `subscriptionTier == 'FREE'` only. Update allows `name` changes only; `role` and `subscriptionTier` must remain unchanged. Cloud Functions (`syncUserClaims`, `setUserEntitlements`, `paymentWebhookStub`) are the trusted write path via Admin SDK.
- **Verification:** Rules logic reviewed; client `updateDoc` for role/tier rejected by `hasOnly(['name'])` + immutable field checks. Deploy rules + functions to Firebase project to enforce in production.

### SEC-2 — Tier/role gating reads client-controlled `localStorage` only
- **Severity:** Critical
- **Phase:** 1
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/entitlements.ts`, `src/lib/store.ts`, `src/components/TierGate.tsx`, `src/pages/Admin.tsx`, `src/pages/Coach.tsx`, `src/pages/Programs.tsx`, `src/pages/Diet.tsx`, `src/components/Layout.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Pricing.tsx`, `src/components/AuthBootstrap.tsx`
- **Reports:** A SEC-2 (`EsiFit_Full_Audit_2026-07-15.md:74-80`) · B Critical tier bypass (`(1).md:182-188`) · B Critical admin bypass (`(1).md:192-198`)
- **Before:** Set `esifit_store.currentUser.subscriptionTier='ELITE'` or `role='ADMIN'` in localStorage → reload → VIP program content and Admin dashboard rendered.
- **After:** `role`/`subscriptionTier` stripped from localStorage persistence. All gating reads `useEntitlements()` → custom claims (primary) or live Firestore read (fallback). `upgradeTier()` is a no-op for authorization.
- **Verification (2026-07-15, `phase1-auth-verify.mjs` on preview:4173):**
  - localStorage ADMIN bypass → Admin panel did not render ✓
  - localStorage ELITE bypass → VIP program remains locked ✓
  - `/admin` without auth → redirected to `/` ✓
  - Anonymous user on VIP program → upgrade gate shown ✓

### SEC-3 — Fake payment upgrade (`upgradeTier` local flip only)
- **Severity:** High
- **Phase:** 3
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Pricing.tsx`, `src/lib/payments.ts`, `functions/src/payments.ts`, `src/lib/store.ts`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:82-85`) · B (`(1).md:141, PAY-1 equivalent`)
- **Before:** `upgradeTier()` patched localStorage only; no payment processor.
- **After:** `upgradeTier` removed; Pricing uses `startCheckout()` → Stripe Checkout Cloud Function or honest coming-soon notice via `PaymentsNotice`.
- **Verification:** `phase3-payments-verify.mjs`

### AUTH-1 — Register "Sign up with Google" is a no-op
- **Severity:** High
- **Phase:** 2
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Auth.tsx`, `src/lib/auth.ts`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:48,87-90`) · B (`(1).md:145,222-228`)
- **Before:** Register Google button had `onClick={() => {}}`.
- **After:** Register uses `handleGoogleSignUp` → shared `signInWithGoogle()` helper.
- **Verification:** `phase2-auth-verify.mjs`

### AUTH-2 — Forgot password never sends email
- **Severity:** High
- **Phase:** 2
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Auth.tsx`, `src/lib/auth.ts`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:49,92-95`) · B (`(1).md:146,212-218`)
- **Before:** Forgot password only called `setSent(true)` with no Firebase API.
- **After:** `requestPasswordReset(email)` calls `sendPasswordResetEmail`; success UI only after await.
- **Verification:** `phase2-auth-verify.mjs`

### AUTH-3 — `syncUserFromFirebase` hardcodes fake profile defaults
- **Severity:** Medium
- **Phase:** 2
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/store.ts`
- **Reports:** B (`(1).md:108,242-248`) · A mentions hybrid auth (`EsiFit_Full_Audit_2026-07-15.md:35`)
- **Before:** Always set `age: 28`, `gender: 'male'`, etc. on every sync.
- **After:** `mergeProfileFromFirestore()` preserves Firestore/local profile fields; no hardcoded defaults.
- **Verification:** `phase2-auth-verify.mjs`

### DATA-1 — User activity data is localStorage-only
- **Severity:** Medium
- **Phase:** 4
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/store.ts`, `src/lib/firestore-data.ts`, `firestore.rules`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:35`) · B (`(1).md:96-106,102-103`)
- **Before:** bodyLogs, exerciseLogs, calculatorResults, tickets, savedExercises never reached Firestore.
- **After:** `firestore-data.ts` fetch/persist helpers; store writes on mutation; `loadActivityFromFirestore` on login.
- **Verification:** `phase4-firestore-verify.mjs`

### DATA-2 — Profile fields not persisted to Firestore
- **Severity:** Medium
- **Phase:** 4
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/store.ts`, `src/lib/firestore-data.ts`, `src/pages/Dashboard.tsx`
- **Reports:** B (`(1).md:148`) · A (`EsiFit_Full_Audit_2026-07-15.md:35`)
- **Before:** Dashboard profile edits stayed in local state only.
- **After:** `persistUserProfile` + `updateProfile` writes age/gender/goal/etc. to `users/{uid}`.
- **Verification:** `phase4-firestore-verify.mjs`

### CALC-1 — Home: 13 widgets vs 14 calculator slugs
- **Severity:** Low (product consistency, not broken math)
- **Phase:** 5
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/calculators/HomeSmartTools.tsx`, `src/pages/Calculators.tsx:27,45`, `src/pages/Home.tsx`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:44`) vs B (`(1).md:163-164`) — **resolved in Phase 0** (see above)
- **Before:** Home marketing claimed "14 calculators" while Home mounts 13 widgets; `rep-max-table` is a duplicate slug for the embedded %1RM table inside `OneRepMaxCalculator`.
- **After:** Home copy documents "13 interactive tools on Home; 14 dedicated calculator pages". Stats hero shows "13 Home tools". `/calculators` `rep-max-table` description clarifies it shares the 1RM component with `one-rep-max`.
- **Verification:** `phase5-calculator-verify.mjs` static checks; no separate Home widget added (functionality already present in 1RM calculator).

### CALC-2 — BMI `height=0` → Infinity
- **Severity:** Medium
- **Phase:** 5
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/calculators.ts`, `src/components/calculators/BodyCompositionCalculators.tsx`
- **Reports:** B (`(1).md:170-171`) · A notes sliders floor weight at 40kg (`EsiFit_Full_Audit_2026-07-15.md:191`)
- **Before:** `calcBMI` divided by zero height → `Infinity`; UI rendered it as a valid gauge value.
- **After:** `calcBMI` returns `Result<{ bmi, category }>`; rejects `heightCm <= 0`, `weightKg <= 0`, and non-finite BMI. `BmiCalculator` shows error message on failure.
- **Verification:** `src/lib/calculators.test.ts` + `phase5-calculator-verify.mjs` runtime check.

### CALC-3 — WHR `hip=0` → Infinity
- **Severity:** Medium
- **Phase:** 5
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/calculators.ts`, `src/components/calculators/BodyCompositionCalculators.tsx`
- **Reports:** B (`(1).md:173,252-258`)
- **Before:** `calcWHR` divided by zero hip → `Infinity`.
- **After:** `calcWHR` returns `Result<{ whr, risk }>`; rejects `hipCm <= 0` and `waistCm <= 0`. `WhrCalculator` shows error message on failure.
- **Verification:** `src/lib/calculators.test.ts` + `phase5-calculator-verify.mjs` runtime check.

### CALC-4 — Brzycki 1RM `reps≥37` → NaN
- **Severity:** Medium
- **Phase:** 5
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/calculators.ts`, `src/components/calculators/StrengthTrainingCalculators.tsx`
- **Reports:** B (`(1).md:174,262-266`)
- **Before:** Brzycki formula `weight * 36 / (37 - reps)` produced `NaN` when `reps >= 37`.
- **After:** `calcOneRepMax` returns `Result<number>`; rejects Brzycki when `reps >= 37`, non-positive weight, and non-finite results. `OneRepMaxCalculator` shows error and empty table on failure.
- **Verification:** `src/lib/calculators.test.ts` + `phase5-calculator-verify.mjs` runtime check.

### BUG-1 — Program exercise links 404 (wrong slug)
- **Severity:** Medium
- **Phase:** 7
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Programs.tsx`, `src/lib/store.ts`
- **Reports:** B (`(1).md:138,232-238`)
- **Before:** Program detail linked to `/exercises/${exerciseName.slugified}` (e.g. `barbell-back-squat`) instead of canonical slugs (`barbell-squat`).
- **After:** Added `getExerciseSlugById()`; links use `pe.exerciseId` to resolve the real exercise slug from `EXERCISES`.
- **Verification:** `phase7-bugs-verify.mjs` static checks.

### BUG-2 — Anatomy "Neck" hotspot → empty exercise list
- **Severity:** Low
- **Phase:** 7
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Exercises.tsx`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:107-110`) — B does not list
- **Before:** Anatomy `neck` hotspot mapped to `Neck` muscle group; no exercises tagged `Neck` → zero results.
- **After:** `neck` maps to `Back` (upper-back/trap exercises) until dedicated neck content exists.
- **Verification:** `phase7-bugs-verify.mjs` static check.

### BUG-3 — TierGate English-only copy
- **Severity:** Low
- **Phase:** 7
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/TierGate.tsx`
- **Reports:** B (`(1).md:155,305-309`)
- **Before:** Gate title, description, upgrade button, and loading text were hardcoded English.
- **After:** All user-facing strings wrapped with `useI18n()` / `t()` including localized tier labels.
- **Verification:** `phase7-bugs-verify.mjs` static check.

### BUG-4 — Auth pages not translated
- **Severity:** Medium
- **Phase:** 7
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Auth.tsx`
- **Reports:** B (`(1).md:156-157`) · A (`EsiFit_Full_Audit_2026-07-15.md:137`)
- **Before:** Login, Register, and Forgot Password had zero `t()` calls — English only.
- **After:** All headings, labels, buttons, validation errors, and success messages use `t({ en, fa })`.
- **Verification:** `phase7-bugs-verify.mjs` static check.

### BUG-5 — TierGate blur leaks gated content in DOM
- **Severity:** Low
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/TierGate.tsx`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:138,175`)
- **Before:** Locked tier content was still mounted in the DOM inside `.content-locked` blur — readable in DevTools and by screen readers.
- **After:** When access is denied, gated `children` are not rendered; a dashed placeholder panel and upgrade card are shown instead (`role="region"`).
- **Verification:** `phase8-ux-verify.mjs` static check.

### BUG-6 — Tablet 768px horizontal overflow
- **Severity:** Medium
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/Layout.tsx`, `src/pages/Pricing.tsx`, `src/pages/Exercises.tsx`
- **Reports:** B (`(1).md:271-277`) — A says no overflow at 375px only (`EsiFit_Full_Audit_2026-07-15.md:122`)
- **Before:** At 768×1024, `scrollWidth` 830px vs `clientWidth` 768px on `/`, `/pricing`, `/exercises` — desktop nav activated too early.
- **After:** Root layout uses `overflow-x-hidden`; desktop nav deferred to `lg:` breakpoint; pricing table and anatomy model wrappers use `max-w-full min-w-0 overflow-hidden`.
- **Verification:** `phase8-ux-verify.mjs` static checks.

### BUG-7 — Hero image missing alt text
- **Severity:** Low
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Home.tsx`
- **Reports:** B (`(1).md:355`)
- **Before:** Hero background `<img alt="">` with no decorative marking.
- **After:** Decorative hero image has `alt=""` and `aria-hidden="true"` so assistive tech skips the 20% opacity background.
- **Verification:** `phase8-ux-verify.mjs` static check.

### BUG-8 — Calculator results not accessible to screen readers
- **Severity:** Medium
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/calculators/SharedCalculatorUI.tsx`
- **Reports:** B UX audit (no `aria-live` in `src/`)
- **Before:** `SliderInput` lacked `aria-valuenow` / label association; `CircularGauge` value changes were visual-only.
- **After:** Sliders use `htmlFor`/`id` and `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext`; gauges use `aria-live="polite"` sr-only announcements; results panel has `aria-live`.
- **Verification:** `phase8-ux-verify.mjs` static check.

### BUG-9 — Silent upgrade (no toast/confirmation)
- **Severity:** Low
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Pricing.tsx`
- **Reports:** B UX section
- **Before:** FREE plan and Stripe checkout navigated/redirected with no user feedback.
- **After:** `handleSubscribe` sets localized notices before navigation/checkout; notice banner uses `role="status"` + `aria-live="polite"`.
- **Verification:** `phase8-ux-verify.mjs` static check.

### BUG-10 — Register lacks password show/hide and strength indicator
- **Severity:** Low
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/pages/Auth.tsx`
- **Reports:** B UX audit (implied in phase instructions)
- **Before:** Register password field was always `type="password"` with validation only on submit.
- **After:** Show/hide toggle with `aria-label`; live strength hint (too short / fair / strong) as user types.
- **Verification:** `phase8-ux-verify.mjs` static check.

### BUG-11 — Firebase raw errors in Auth UI
- **Severity:** Low
- **Phase:** 8
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/auth.ts`, `src/pages/Auth.tsx`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:137`)
- **Before:** Catch blocks displayed raw `err.message` (e.g. `Firebase: Error (auth/invalid-credential).`).
- **After:** `getAuthErrorCode()` + `mapAuthError()` return localized user-facing messages for common Firebase auth codes.
- **Verification:** `phase8-ux-verify.mjs` static check.

### BUG-12 — `main.tsx` boot probe (downgraded)
- **Severity:** Low (was High in Report B)
- **Phase:** 2
- **Status:** fixed (2026-07-15)
- **Files:** `src/main.tsx`
- **Reports:** B High (`(1).md:202-208`) · A sandbox note (`EsiFit_Full_Audit_2026-07-15.md:26,119`)
- **Before:** Unconditional `getDocFromServer(doc(db,'test','connection'))` on every boot.
- **After:** Boot probe removed; `main.tsx` only mounts `<App />`.
- **Verification:** `phase2-auth-verify.mjs`, `phase10-reaudit-verify.mjs`

### TOOL-1 — ESLint not installed
- **Severity:** Medium
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `package.json`, `eslint.config.js`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:33,102-105`) · B (`(1).md:70-75,281-285`)
- **Before:** `npm run lint` failed because ESLint was not installed.
- **After:** Added ESLint 10 + `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, and flat config `eslint.config.js`. `npm run lint` passes with `--max-warnings 0`.
- **Verification:** `phase6-tooling-verify.mjs` runs `npm run lint`.

### TOOL-2 — TypeScript unused imports (6 errors)
- **Severity:** Low
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `BodyCompositionCalculators.tsx`, `EnergyNutritionCalculators.tsx`, `HealthLifestyleCalculators.tsx`, `StrengthTrainingCalculators.tsx`, `Calculators.tsx`, `package.json`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:34`) · B (`(1).md:77-85,290-294`)
- **Before:** `tsc --noEmit` reported 6 TS6133 unused-import errors (unused `React`, `AnimatePresence`, `getState`).
- **After:** Removed unused imports; added `npm run typecheck` script.
- **Verification:** `phase6-tooling-verify.mjs` runs `npm run typecheck`.

### TOOL-3 — Static+dynamic import duplication
- **Severity:** Medium
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/calculators/lazy.tsx`, `HomeSmartTools.tsx`, `Calculators.tsx`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:32,97-100`) · B (`(1).md:57-64`)
- **Before:** `HomeSmartTools` lazy-loaded calculator modules while `Calculators.tsx` statically imported the same modules, defeating code-splitting.
- **After:** Centralized lazy loaders in `lazy.tsx`; both Home tabs and `/calculators/:slug` routes use shared dynamic imports with `Suspense`.
- **Verification:** `phase6-tooling-verify.mjs` static checks; build emits separate calculator chunks.

### TOOL-4 — Dead dependencies
- **Severity:** Low
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `package.json`, `package-lock.json`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:155-156`) · B (`(1).md:66,518-519`)
- **Before:** `@base-ui/react`, `@date-fns/tz`, and `vite-plugin-singlefile` were listed but never used.
- **After:** Removed all three from dependencies/devDependencies.
- **Verification:** `phase6-tooling-verify.mjs` checks `package.json`.

### TOOL-5 — Oversized single JS chunk
- **Severity:** Medium
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `vite.config.ts`, `src/App.tsx`, `lazy.tsx`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:154-156`) · B (`(1).md:48-54,457-470`)
- **Before:** Single `index-*.js` chunk ~1,597 KB (495 KB gzip).
- **After:** Route-level `React.lazy` for all pages; `manualChunks` splits firebase, recharts, react, router, and motion. Build emits 37 JS chunks; largest chunk ~552 KB (firebase).
- **Verification:** `phase6-tooling-verify.mjs` build metrics check.

### TOOL-6 — Debug scripts at repo root
- **Severity:** Low
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `check.mjs`, `check.cjs` (deleted)
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:112-114`)
- **Before:** Scratch `check.mjs` / `check.cjs` debug scripts committed at repo root.
- **After:** Both files removed.
- **Verification:** `phase6-tooling-verify.mjs` confirms files absent.

### TOOL-7 — `Math.random()` in ID fallback
- **Severity:** Low
- **Phase:** 6
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/store.ts`
- **Reports:** B (`(1).md:297-301`) · A ruled low risk (`EsiFit_Full_Audit_2026-07-15.md:118`)
- **Before:** `generateId` fell back to `Math.random()` UUID generation when `crypto.randomUUID` unavailable.
- **After:** Uses `crypto.randomUUID()`, then `crypto.getRandomValues()`, then timestamp-based suffix — no `Math.random()`.
- **Verification:** `phase6-tooling-verify.mjs` static check.

### CONTENT-1 — Seed content not in Farsi
- **Severity:** Medium
- **Phase:** 9
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/content-i18n.ts`, `src/lib/seed/content-fa*.ts`, content pages
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:20,57`) · B (`(1).md:156-157`)
- **Before:** Exercise/program/diet/article copy English-only in Farsi UI.
- **After:** ID-keyed Farsi locale; `localizedExercise/Program/DietPlan/Article` helpers wired in pages.
- **Verification:** `phase9-content-verify.mjs`

### CONTENT-2 — Thin content catalog
- **Severity:** Medium
- **Phase:** 9
- **Status:** fixed (2026-07-15)
- **Files:** `src/lib/seed/*.ts`
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:21`) · B (`(1).md:133-140`)
- **Before:** 10 exercises, 3 programs, 2 diets, 3 articles.
- **After:** 20 exercises, 5 programs, 4 diets, 6 articles.
- **Verification:** `phase9-content-verify.mjs`

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
- **Status:** fixed (2026-07-15)
- **Files:** `src/index.css`, Tailwind theme
- **Reports:** B (`(1).md:315-325`) — resolved in Phase 0 #3
- **Decision:** Adopt **orange (`#f97316`) + gray surfaces** as the canonical EsiFit brand. Audit brief pine/bone/ember/brass palette not used.
- **After:** Documented in `src/index.css` `@theme` comment; existing `--color-brand` / `--color-surface` tokens retained as source of truth for future refactors.
- **Verification:** `phase8-ux-verify.mjs` static check.

### UI-11 — Modernize & Iranize UI/UX
- **Severity:** N/A (enhancement)
- **Phase:** 11
- **Status:** fixed (2026-07-15)
- **Files:** `src/components/layout/*`, `src/components/ui/*`, `src/lib/design-tokens.ts`, `src/index.css`, `src/pages/Auth.tsx`, `src/pages/Home.tsx`
- **Decision:** Persian teal (`#0d9488`) as secondary accent; orange remains primary. Desktop primary nav: Calculators, Programs, Diet, Exercises; secondary: Blog, Pricing. Mobile bottom nav: Home, Tools, Programs, Dashboard, More sheet.
- **After:** Layout split into `AppShell`, `TopNav`, `MobileBottomNav`, `MobileMoreSheet`, `Footer`, `UserMenu`. Shared UI primitives (`Button`, `Card`, `InputField`, `Skeleton`, `EmptyState`). Auth forms migrated to RTL-safe `InputField`.
- **Verification:** `phase11-ui-verify.mjs` static checks; `phase8-ux-verify.mjs` updated for new layout paths.

### PERF-1 — Lighthouse not completed
- **Severity:** Low
- **Phase:** 10
- **Status:** verified-alt (2026-07-15)
- **Reports:** A (`EsiFit_Full_Audit_2026-07-15.md:157,188`) · B (`(1).md:462-463`, crash in sandbox)
- **Phase 10 attempt:** Lighthouse CLI crashed (headless Chrome tab crash in cloud environment).
- **Substitute verification:** `vite build` — 40 JS chunks; app index chunk ~72 KB (23.6 KB gzip); Phase 8 static a11y checks pass.
- **Recommendation:** Run Lighthouse locally against `vite preview` before production launch.
- **Documented in:** `EsiFit_Fixes_Verified_2026-07-15.md`

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
| 2026-07-15 | 10 | Full re-audit; `EsiFit_Fixes_Verified_2026-07-15.md`; ISSUES reconciled; `phase10-reaudit-verify.mjs` |
| 2026-07-15 | 9 | CONTENT-1/2: expanded seed catalog; Farsi translations for exercises, programs, diets, articles |
| 2026-07-15 | 0 | Initial unified list from Reports A & B; reconciled calculator count, Firebase probe severity, design tokens |
