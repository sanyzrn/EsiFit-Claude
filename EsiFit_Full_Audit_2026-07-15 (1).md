# EsiFit Full Product Audit — 2026-07-15

## Executive Summary

EsiFit is a functional **demo-grade** React 19 + Vite 7 fitness SPA with a polished dark/orange UI, 14 interactive calculators, and a complete route map (37 routes). The app **installs and runs** (`npm install`, `npm run dev`, `npm run build` all succeed). However, it is **not production-ready**: subscription tiers and admin/coach roles are enforced only in client-side `localStorage` (trivially bypassable), payments are simulated, most user data never reaches Firestore, auth-adjacent flows (forgot password, Google sign-up) are stubbed, and every page load emits Firebase connection errors. The design system has **drifted** from the documented pine/bone/ember/brass palette to Tailwind orange/gray tokens. Farsi i18n is **partial** — marketing pages translate, but Auth remains English-only. Bundle size is **1.6 MB JS** (495 KB gzip) with no effective code-splitting despite lazy imports on Home. **Recommended priority:** fix security gating, wire real persistence, complete auth/payment flows, then i18n and performance.

**Audit method:** `npm install`, `npm run dev` (port 5173), `npm run build`, `npm run lint`, `npx tsc --noEmit`, Playwright route crawl on preview (port 4173), calculator edge-case unit tests, localStorage bypass probe, i18n toggle verification, viewport screenshots at 375/768/1440px.

---

## STEP 0 — Project Bootstrap & Tooling

### 0.1 `npm install`

```
added 238 packages, and audited 239 packages in 5s
2 vulnerabilities (1 low, 1 high)
npm notice New major version of npm available! 10.9.7 -> 12.0.1
```

No install failures. Post-install `npm audit` reports **esbuild** (low) and **vite 7.0.0–7.3.3** (high) advisories.

### 0.2 `npm run dev`

- Dev server: **HTTP 200** at `http://localhost:5173/`
- Deep route hard-refresh `/dashboard/progress`: **HTTP 200**, SPA shell loads (Vite history fallback works); unauthenticated users see login redirect content.
- **Console errors on boot** (from `src/main.tsx:8-18` Firebase probe + Firestore init):

```
@firebase/firestore: Could not reach Cloud Firestore backend. Connection failed 1 times.
FirebaseError: [code=unavailable]: The operation could not be completed
This typically indicates that your device does not have a healthy Internet connection...
The client will operate in offline mode until it is able to successfully connect to the backend.
```

This error repeats on **every route navigation** during Playwright crawl (37 routes). Root cause: `testConnection()` calls `getDocFromServer` on every app boot (`src/main.tsx:10`), and Firebase SDK initializes even when only `localStorage` is used.

### 0.3 Route crawl (all routes from `src/App.tsx`)

Playwright verified **37/37 routes** return HTTP 200 with non-blank `#root` content. No React throw/blank-screen failures observed.

| Result | Routes |
|--------|--------|
| Renders OK | All listed in `src/App.tsx:38-61` plus `*` → `NotFound` |
| Redirect behavior | `/dashboard/*` → login form when `currentUser` is null (`src/pages/Dashboard.tsx:21`) |
| Admin/Coach guard | `/admin`, `/coach` render **null** then redirect when role mismatch — but see Security section for bypass |

### 0.4 `npm run build`

```
dist/index.html                     0.91 kB │ gzip:   0.51 kB
dist/assets/index-FM87cHkQ.css     48.50 kB │ gzip:   8.18 kB
dist/assets/index-CPqU5hQI.js   1,597.15 kB │ gzip: 494.84 kB
✓ built in 4.64s
```

**Warnings:**
- Chunks > 500 KB after minification
- Four calculator modules are both **dynamically imported** (`HomeSmartTools.tsx`) and **statically imported** (`Calculators.tsx`), defeating code-splitting:

```
(!) BodyCompositionCalculators.tsx is dynamically imported by HomeSmartTools.tsx
    but also statically imported by Calculators.tsx, dynamic import will not move module into another chunk.
```

**`vite-plugin-singlefile`:** listed in `package.json:37` but **NOT configured** in `vite.config.ts` — build uses normal multi-file output, not single-file bundling.

### 0.5 `npm run lint` & `tsc --noEmit`

**Lint (`npm run lint`):**
```
sh: 1: eslint: not found
Exit code: 127
```
ESLint is referenced in `package.json:9` scripts but **not installed** as a dependency.

**TypeScript (`npx tsc --noEmit`) — 6 errors:**
```
src/components/calculators/BodyCompositionCalculators.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/calculators/BodyCompositionCalculators.tsx(5,18): error TS6133: 'AnimatePresence' is declared but its value is never read.
src/components/calculators/EnergyNutritionCalculators.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/calculators/HealthLifestyleCalculators.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/calculators/StrengthTrainingCalculators.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/pages/Calculators.tsx(4,10): error TS6133: 'getState' is declared but its value is never read.
```

### 0.6 Firebase vs localStorage — Data Architecture

| Artifact | Present | Notes |
|----------|---------|-------|
| `src/lib/firebase.ts` | ✅ | Initializes from `firebase-applet-config.json` |
| `firebase-blueprint.json` | ✅ | Schema blueprint for User/BodyLog |
| `firestore.rules` | ✅ | Real rules (deny-all default + owner-scoped users/bodyLogs) |
| `firebase-applet-config.json` | ✅ | Live project: `symmetric-component-6sjh2`, API key present |

**What actually persists where:**

| Data | Firebase Auth | Firestore | localStorage (`esifit_store`) |
|------|--------------|-----------|-------------------------------|
| Login/register session | ✅ Real (`Auth.tsx:28-29,146-156`) | User doc on register/Google | Synced to `state.currentUser` via `syncUserFromFirebase` |
| Profile fields (age, height, etc.) | — | — | ✅ `updateProfile` → localStorage only (`store.ts:73-77`) |
| Body logs, exercise logs | — | Rules exist, **no writes from app** | ✅ `addBodyLog`, `addExerciseLog` (`store.ts:97-114`) |
| Tickets/chat | — | — | ✅ localStorage only |
| Subscription tier | Written on register as `FREE` | Could update via rules | ✅ `upgradeTier` flips locally (`store.ts:80-84`, `Pricing.tsx:22`) |
| Saved exercises | — | — | ✅ localStorage |
| Calculator results | — | — | ✅ localStorage (`addCalculatorResult`) |

**Verdict:** Firebase Auth is **wired to a real project**, but the app is predominantly a **localStorage-backed SPA**. Firestore is scaffolded (rules + blueprint) but not integrated for logs, tickets, or billing. `syncUserFromFirebase` (`store.ts:39-62`) **hardcodes** profile defaults (`age: 28`, `gender: 'male'`, etc.) instead of reading them from Firestore.

---

## STEP 1 — Feature Inventory

| Feature | Route / File | Status | Evidence |
|---------|-------------|--------|----------|
| Home / marketing | `/` · `src/pages/Home.tsx` | **Working** | Playwright: renders hero, stats, features, testimonials, `#smart-tools` calculators |
| Hero background image | `public/images/hero-bg.jpg` | **Working** (unoptimized) | File exists, 282 KB; referenced `Home.tsx:36` |
| Home calculator console (14 tools, 4 tabs) | `#smart-tools` · `HomeSmartTools.tsx` | **Working** | Tabs: Body Composition, Energy & Nutrition, Strength & Training, Health & Lifestyle; BMI gauge renders live |
| Calculator index (14 cards) | `/calculators` · `Calculators.tsx:48-76` | **Working** | 14 slugs listed `Calculators.tsx:14-27` |
| BMI Calculator | `/calculators/bmi` · `BodyCompositionCalculators.tsx:7-31` | **Working** | Slider inputs update `CircularGauge` live; edge: zero height → Infinity (`calculators.ts:5-7`) |
| Body Fat % (US Navy) | `/calculators/body-fat` | **Working** | Boundary `waist≤neck` shows error UI (`calculators.ts:23-24`, `BodyCompositionCalculators.tsx:61-68`) |
| BMR | `/calculators/bmr` | **Working** | Mifflin-St Jeor via `calcBMR` |
| TDEE | `/calculators/tdee` | **Working** | Chains BMR × activity factor |
| Macros | `/calculators/macros` | **Working** | Returns error when TDEE too low (`calculators.ts:94-96`) |
| 1RM / %1RM Table | `/calculators/one-rep-max`, `/calculators/rep-max-table` | **Working** (duplicated) | Both map to `OneRepMaxCalculator` (`Calculators.tsx:45`) |
| FFMI | `/calculators/ffmi` | **Working** | Gauge renders adjusted FFMI |
| WHR | `/calculators/whr` | **Partially working** | Zero hip → `Infinity` WHR, still shows risk string (`calculators.ts:148-152`) |
| Water Intake | `/calculators/water-intake` | **Working** | `weight × 0.033` liters |
| Goal Date Estimator | `/calculators/goal-date` | **Working** | Zero calorie delta returns error (`calculators.ts:167-168`) |
| Calories Burned | `/calculators/calories-burned` | **Working** | MET table + duration |
| Body Type Quiz | `/calculators/body-type-quiz` | **Working** | 6 questions, result on completion |
| Volume Load | `/calculators/volume-load` | **Working** | Manual set/rep/weight entry |
| Exercise library (10 exercises) | `/exercises` · `store.ts:229-240` | **Working** (seed data) | No `videoUrl`/`thumbnailUrl` populated; Dumbbell icon placeholders |
| Exercise detail | `/exercises/:slug` | **Working** | Instructions + mistakes render for `barbell-bench-press` |
| Anatomy / muscle map | `/exercises` anatomy view · `Exercises.tsx:4,141-150` | **Working** | `react-muscle-highlighter` renders; click filters by `MUSCLE_MAPPING` |
| Training programs (3) | `/programs` · `store.ts:242-327` | **Working** (seed) | Tier badges on cards; gradient placeholders not photos |
| Program detail + day tabs | `/programs/:slug` | **Working** | VIP program gated via `TierGate` when tier insufficient |
| Program exercise → exercise link | `Programs.tsx:202` | **Broken** | Links use `exerciseName.toLowerCase().replace(/ /g,'-')` not actual `slug` — e.g. "Barbell Back Squat" → `/exercises/barbell-back-squat` (404) |
| Diet plans (2) | `/diet` · `store.ts:329-382` | **Working** (seed) | Full macro breakdowns per meal |
| Blog (3 articles) | `/blog` · `store.ts:384-403` | **Working** | Cover images from Pexels CDN (external) |
| Pricing / plans | `/pricing` · `Pricing.tsx` | **Fake-stubbed payment** | `upgradeTier(tier)` local flip (`Pricing.tsx:21-23`); comment says "Simulate Stripe checkout" |
| Login (email/password) | `/login` · `Auth.tsx:9-123` | **Working** (Firebase) | `signInWithEmailAndPassword`; rejects invalid creds |
| Login (Google) | `Auth.tsx:38-64` | **Working** | `signInWithPopup` + Firestore user doc creation |
| Register (email) | `/register` · `Auth.tsx:125-226` | **Working** (Firebase) | Min 6 char password; creates Firestore user doc |
| Register (Google) | `Auth.tsx:213` | **Broken / stub** | `onClick={() => {}}` — button does nothing |
| Forgot password | `/forgot-password` · `Auth.tsx:228-265` | **Fake-stubbed** | `setSent(true)` only; no `sendPasswordResetEmail` |
| Dashboard overview | `/dashboard` · `Dashboard.tsx:74+` | **Working** (local data) | Streak, workout count from localStorage |
| Profile | `/dashboard/profile` | **Partially working** | Saves to localStorage only, not Firestore |
| My Programs | `/dashboard/programs` | **Empty state only** | Static "No active programs" (`Dashboard.tsx:268-275`) |
| Progress tracking + charts | `/dashboard/progress` | **Working** (local) | Recharts weight/1RM charts; `dir="ltr"` on chart containers (`Dashboard.tsx:431,447`) |
| Coach chat / tickets | `/dashboard/chat` | **Demo** | Local tickets; auto-reply via `setTimeout` (`Dashboard.tsx:529-539`) |
| Billing | `/dashboard/billing` | **Fake-stubbed** | Shows tier from localStorage; payment buttons inert (`Dashboard.tsx:683-687`) |
| Admin console | `/admin` · `Admin.tsx` | **Demo** | Hardcoded `demoUsers` array (`Admin.tsx:29-36`); client role check only |
| Coach console | `/coach` · `Coach.tsx` | **Demo** | Hardcoded `clients` array (`Coach.tsx:20-24`); client role check only |
| Tier gating component | `TierGate.tsx` | **Working UI / bypassable** | Blur overlay + upgrade CTA; English-only gate text (`TierGate.tsx:36-40`) |
| i18n (en/fa) | `src/lib/i18n.tsx` | **Partially working** | Nav/home/pricing translate; Auth pages **English-only** even when `lang=fa` |
| RTL layout | `i18n.tsx:145-152` | **Working** | `dir=rtl`, `farsi-font` class on `<html>` when FA selected |
| 404 page | `NotFound.tsx` | **Working** | Renders on `/nonexistent` |
| Dark/light mode | `index.html:2` | **Dark only** | `<html class="dark">`; no toggle |

### Calculator count verification

**14 calculators confirmed** in `Calculators.tsx:14-27` and embedded on Home via 4 tab groups in `HomeSmartTools.tsx:50-55`:
1. BMI, 2. Body Fat, 3. BMR, 4. TDEE, 5. Macros, 6. 1RM, 7. FFMI, 8. WHR, 9. Water, 10. Goal Date, 11. Calories Burned, 12. Body Type Quiz, 13. Volume Load, 14. %1RM Table (shares component with #6).

### Calculator edge-case test results (automated)

| Test | Result | Notes |
|------|--------|-------|
| BMI weight=0 | BMI=0, category "Underweight" | No input guard |
| BMI height=0 | `Infinity` | No guard (`calculators.ts:6-7`) |
| Body fat waist≤neck (male) | Error returned | Correct (`calculators.ts:23-24`) |
| WHR hip=0 | `Infinity` WHR | No guard (`calculators.ts:149`) |
| 1RM Brzycki reps=37 | `NaN` | Denominator `37-reps` (`calculators.ts:111`) |
| Macros low TDEE | Error returned | Correct (`calculators.ts:94-96`) |
| Goal date delta=0 | Error returned | Correct (`calculators.ts:167-168`) |

---

## STEP 2 — Bug Hunt

### [SEVERITY: Critical] Subscription tier bypass via localStorage

**File:** `src/lib/store.ts:9-33`, `src/pages/Programs.tsx:114-115`, `src/components/TierGate.tsx:17-21`  
**Repro:** 1) Open app 2) DevTools → Application → localStorage → `esifit_store` 3) Set `currentUser.subscriptionTier` to `"ELITE"` 4) Navigate to `/programs/strength-powerlifting`  
**Expected:** VIP gate blocks content  
**Actual:** Full program content visible including "Heavy Squat Day" — Playwright bypass probe: `vipProgramUnlocked: true`, `upgradeGateShown: false`  
**Suggested fix:** Enforce tier from Firebase Auth custom claims or Firestore `users/{uid}.subscriptionTier` on every gated fetch; never trust localStorage for authorization.

---

### [SEVERITY: Critical] Admin dashboard accessible via forged localStorage role

**File:** `src/pages/Admin.tsx:13-17`, `src/lib/store.ts:20-28`  
**Repro:** 1) Set `esifit_store.currentUser.role` to `"ADMIN"` in localStorage 2) Reload 3) Visit `/admin`  
**Expected:** Server-side or Firebase-verified admin check  
**Actual:** Full Admin Dashboard renders with MRR, user tables (`adminDashboardVisible: true` in Playwright probe)  
**Suggested fix:** Verify `role` from Firebase ID token custom claims; redirect if claim missing.

---

### [SEVERITY: High] Firebase Firestore error spam on every page load

**File:** `src/main.tsx:8-18`, `src/lib/firebase.ts:1-8`  
**Repro:** 1) `npm run preview` 2) Open any route 3) Check console  
**Expected:** Silent boot or graceful offline handling  
**Actual:** Red error on every navigation: `Could not reach Cloud Firestore backend`  
**Suggested fix:** Remove `testConnection()` probe from production boot; lazy-init Firestore only when needed; use `enableIndexedDbPersistence` with explicit offline UX.

---

### [SEVERITY: High] Forgot password is a UI fake

**File:** `src/pages/Auth.tsx:247-255`  
**Repro:** 1) Go to `/forgot-password` 2) Enter any email 3) Submit  
**Expected:** Firebase `sendPasswordResetEmail`  
**Actual:** Immediately shows "Check your email" with no network call (`setSent(true)` only)  
**Suggested fix:** Wire `sendPasswordResetEmail(auth, email)` with error handling.

---

### [SEVERITY: High] Register "Sign up with Google" button is dead

**File:** `src/pages/Auth.tsx:213`  
**Repro:** 1) Go to `/register` 2) Click "Sign up with Google"  
**Expected:** Same flow as login Google (`Auth.tsx:38-64`)  
**Actual:** `onClick={() => {}}` — no action  
**Suggested fix:** Reuse `handleGoogleSignIn` from Login or extract shared auth helper.

---

### [SEVERITY: Medium] Program detail exercise links 404

**File:** `src/pages/Programs.tsx:202`  
**Repro:** 1) Login 2) Open `/programs/beginner-full-body` 3) Click any exercise name link  
**Expected:** Navigate to `/exercises/barbell-squat` (actual slug `barbell-squat`)  
**Actual:** Link built from display name → `/exercises/barbell-back-squat` → Exercise not found  
**Suggested fix:** Resolve `exerciseId` to `EXERCISES.find(e => e.id === pe.exerciseId).slug`.

---

### [SEVERITY: Medium] `syncUserFromFirebase` overwrites profile with hardcoded defaults

**File:** `src/lib/store.ts:51-56`  
**Repro:** 1) Register/login 2) Inspect `state.currentUser`  
**Expected:** Profile from Firestore or empty  
**Actual:** Always sets `age: 28`, `gender: 'male'`, `heightCm: 178`, `weightKg: 80`, `goal: 'MUSCLE_GAIN'`  
**Suggested fix:** Read profile fields from Firestore document or omit until user fills profile.

---

### [SEVERITY: Medium] BMI / WHR calculators lack divide-by-zero guards

**File:** `src/lib/calculators.ts:5-7`, `148-152`  
**Repro:** Programmatic: `calcBMI(75, 0)` → Infinity; `calcWHR(85, 0, 'male')` → Infinity  
**Expected:** Validation error in UI  
**Actual:** Sliders prevent zero in UI, but pure functions return invalid numbers  
**Suggested fix:** Return `Result` error type like `calcBodyFat`.

---

### [SEVERITY: Medium] Brzycki 1RM returns NaN for reps ≥ 37

**File:** `src/lib/calculators.ts:111`  
**Repro:** `calcOneRepMax(100, 37, 'brzycki')` → `NaN`  
**Expected:** Cap reps or return error  
**Suggested fix:** Guard `reps < 37` for Brzycki formula.

---

### [SEVERITY: Medium] Tablet horizontal overflow (~830px scroll width at 768px viewport)

**File:** Layout-wide (likely hero `text-4xl md:text-6xl`, pricing table, anatomy model)  
**Repro:** Playwright viewport 768×1024 on `/`, `/pricing`, `/exercises`  
**Expected:** `scrollWidth ≤ clientWidth`  
**Actual:** `scrollWidth: 830, clientWidth: 768, overflow: true` on all tested pages at tablet breakpoint  
**Suggested fix:** Audit `min-w-*`, negative margins, and `100vw` elements; add `overflow-x-hidden` on `body` as last resort.

---

### [SEVERITY: Low] ESLint not installed — lint script broken

**File:** `package.json:9`  
**Repro:** `npm run lint`  
**Actual:** `eslint: not found` (exit 127)  
**Suggested fix:** Add `eslint` + config to devDependencies.

---

### [SEVERITY: Low] TypeScript unused import errors (6)

**Files:** `BodyCompositionCalculators.tsx:1,5`, other calculator files, `Calculators.tsx:4`  
**Suggested fix:** Remove unused imports or enable `noUnusedLocals` cleanup.

---

### [SEVERITY: Low] `Math.random()` in ID fallback path

**File:** `src/lib/store.ts:87-94`  
**Note:** Primary path uses `crypto.randomUUID()`; `Math.random()` only in legacy fallback. Collision risk is low but non-zero in old browsers.  
**Suggested fix:** Require `crypto.randomUUID` or use `crypto.getRandomValues` fallback.

---

### [SEVERITY: Low] TierGate copy not i18n-wrapped

**File:** `src/components/TierGate.tsx:36-40`  
**Actual:** "VIP Content", "Upgrade to VIP" always English  
**Suggested fix:** Wrap in `t({ en: ..., fa: ... })`.

---

## STEP 3 — UI Audit

### Design tokens — drift from pine/bone/ember/brass

**Expected (per audit brief):** pine green, bone background, ember accent, brass.  
**Actual (`src/index.css:4-13`):**

```css
--color-brand: #f97316;        /* orange-500 */
--color-surface: #111827;      /* gray-900 */
```

App uses **orange + gray-950** throughout (`Layout.tsx:36`, `Home.tsx:50-51`). No pine, bone, ember, or brass tokens found in source (only in lucide icon names in `node_modules`). **Tokens have drifted.**

### Breakpoint walk (375 / 768 / 1440)

Screenshots captured at `/opt/cursor/artifacts/audit/`:
- `mobile_home.png`, `mobile_calculators_bmi.png`, `mobile_exercises.png`, `mobile_pricing.png`, `mobile_login.png`, `mobile_dashboard_progress.png`
- `tablet_*` (same pages)
- `desktop_*` (same pages)
- `i18n-fa-home.png`, `i18n-fa-login.png`

| Page | 375px | 768px | 1440px |
|------|-------|-------|--------|
| Home | ✅ No overflow | ⚠️ Horizontal scroll (830px) | ✅ OK |
| Calculators/BMI | ✅ OK | ⚠️ Overflow | ✅ OK |
| Exercises (anatomy) | ✅ OK | ⚠️ Overflow | ✅ OK |
| Pricing (4-col table) | ✅ OK (table scrolls inside card) | ⚠️ Overflow | ✅ OK |
| Login | ✅ OK | ⚠️ Overflow | ✅ OK |
| Dashboard/progress | ✅ Redirects to login | ⚠️ Overflow | ✅ OK |

### Visual consistency

- **Spacing/typography:** Consistent `font-black` headings, `rounded-2xl` cards, `gray-900` surfaces — cohesive within the orange theme.
- **Calculator "console" vs app:** Home `#smart-tools` uses animated tabs (`motion`), circular gauges, and slider inputs (`SharedCalculatorUI.tsx`) — visually richer than dashboard forms but same color palette; feels like **one product with a premium calculator subsection**, not two bolted apps.
- **Native elements:** `<select>` filters on Exercises, Profile, Progress use styled but **native** dropdowns (`Exercises.tsx:108-128`, `Dashboard.tsx:212-246`) — functional but not custom-styled.
- **Focus rings:** Orange `focus:border-orange-500 focus:ring-1` on inputs — present and consistent.

### Images & assets

| Asset | Size | Alt text | Status |
|-------|------|----------|--------|
| `public/images/hero-bg.jpg` | 282 KB | `alt=""` empty (`Home.tsx:36`) | ⚠️ Missing alt; could compress |
| Exercise cards | — | N/A (icon placeholder) | No real photos/videos |
| Blog covers | External Pexels | Alt from article title | ✅ OK |

### Dark/light mode

- **Dark only:** `index.html:2` hardcodes `class="dark"`; `body` is `bg-gray-950`. No light theme or toggle.

### Empty / loading / error states

| State | Location | Quality |
|-------|----------|---------|
| Loading | `HomeSmartTools.tsx:105-108` | Spinner during lazy tab load ✅ |
| Empty exercises | `Exercises.tsx:214-219` | Icon + message ✅ |
| Empty body logs | `Dashboard.tsx:466-470` | Calendar icon + CTA ✅ |
| Empty programs (dashboard) | `Dashboard.tsx:268-275` | Clear CTA to `/programs` ✅ |
| 404 | `NotFound.tsx` | Friendly page ✅ |
| Error boundary | `ErrorBoundary.tsx` | Exists in App wrapper ✅ |
| Calculator error (body fat) | Red bordered box | ✅ Specific message |

---

## STEP 4 — UX Audit

### Information architecture

From home hero, primary destinations are **one click** via nav: Exercises, Programs, Diet, Calculators, Blog, Pricing. Coach path goes through Pricing CTA (`Home.tsx:15` links Coach Chat → `/pricing`). **IA is clear** for a marketing site.

**Cold → VIP coaching click count:** Home → Pricing (1) → Subscribe VIP (2) → Register if logged out (3) → Dashboard/billing (4). **4 clicks** minimum; acceptable but payment doesn't actually complete.

### Onboarding

- **No first-visit tour, checklist, or wizard.** User lands on full marketing page with CTAs. Dashboard empty states provide minimal guidance.

### Forms

| Form | Real-time validation | Error quality | Password UX |
|------|----------------------|---------------|-------------|
| Login | On submit only | Firebase error string (verbose) | No show/hide |
| Register | On submit | Name/email/password checks | Min 6 chars, no strength meter |
| Profile | On submit | None visible | N/A |
| Body log | On submit | Silent if empty | N/A |

### Feedback & confirmations

- **Upgrade:** Silent `upgradeTier` + redirect — no toast (`Pricing.tsx:22-23`)
- **Profile save:** Button text changes to "Saved!" for 2s (`Dashboard.tsx:254`) ✅
- **Coach chat:** Auto-reply after 1.5s — may feel "real" but is **demo automation** (`Dashboard.tsx:529-539`)

### Navigation memory

- `ScrollToTop` on route change (`App.tsx:22-27`) ✅
- Browser back/forward: standard React Router behavior (not explicitly tested for state loss; localStorage persists)

### i18n UX gaps

Playwright i18n test (proper globe menu flow):
- Home FA: `dir=rtl`, `farsiFont=true`, hero shows `هوشمندانه‌تر تمرین کنید` ✅
- Login FA: **still shows "Welcome Back"** in English (`loginEnglish: true`) — `Auth.tsx` has **zero** `t()` calls

### Accessibility spot-check

- **No `aria-live` regions** on calculator gauge results (grep: no matches in `src/`)
- **CircularGauge** (`SharedCalculatorUI.tsx:67-95`): visual SVG only; screen readers get slider labels but not announced result changes
- **Keyboard:** Sliders and buttons focusable; range inputs lack explicit `aria-valuenow`/`aria-valuetext`
- **Charts:** Forced `dir="ltr"` (`Dashboard.tsx:431`) — correct for chart readability in RTL pages

---

## STEP 5 — Security & Data Integrity Audit

### Client-side-only authorization (proven)

| Check | Method | Result |
|-------|--------|--------|
| VIP content after localStorage tier edit | Playwright + `esifit_store` injection | **BYPASS SUCCESS** |
| Admin dashboard after role=ADMIN injection | Same | **BYPASS SUCCESS** |
| Firestore rules | Code review `firestore.rules:1-64` | Rules are **sound** (deny default, owner-scoped) but **unused** by app for gating |
| Server-side enforcement | N/A | **None** — pure SPA |

### Secrets in repo

| File | Content | Assessment |
|------|---------|------------|
| `firebase-applet-config.json` | `apiKey`, `projectId`, `appId` | ✅ Expected public Firebase client config |
| No `.env` committed | — | ✅ |
| `index.html` | No debug overlay scripts | ✅ Clean |

### Firestore rules quality

`firestore.rules:4-6` default deny-all, then explicit `users/{userId}` and `bodyLogs/{logId}` with `isOwner`, field validation, and update allowlists. **Good rules, but app doesn't write bodyLogs to Firestore.**

### Production debug code

`src/main.tsx:8-18` runs Firestore connectivity probe on every user visit — leaks configuration issues to console and causes error noise. Should not ship to production.

---

## STEP 6 — Performance Audit

### Build output

| Asset | Raw | Gzip |
|-------|-----|------|
| `index-CPqU5hQI.js` | 1,597 KB | 495 KB |
| `index-FM87cHkQ.css` | 49 KB | 8 KB |
| `index.html` | 0.9 KB | 0.5 KB |

**Single chunk** — no route-based splitting effective.

### Lighthouse

Attempted `npx lighthouse http://localhost:4173` — **failed:**

```
runtimeError: TARGET_CRASHED — Browser tab has unexpectedly crashed.
```

Scores unavailable in this environment. Manual proxies:
- **Large JS bundle** (1.6 MB) will hurt mobile Performance
- **Viewport meta** present (`index.html:5`) ✅
- **HTTPS** N/A on localhost
- **Images:** hero 282 KB, blog images external

### Bundle contributors (dependency analysis)

| Package | Imported in `src/`? | In bundle? |
|---------|-------------------|------------|
| `firebase` | ✅ `firebase.ts`, `Auth.tsx`, `main.tsx` | Yes — significant |
| `recharts` | ✅ `Dashboard.tsx:7` | Yes |
| `motion` | ✅ calculators, `HomeSmartTools.tsx` | Yes |
| `react-muscle-highlighter` | ✅ `Exercises.tsx:4` | Yes |
| `lucide-react` | ✅ widespread | Tree-shaken icons |
| `@base-ui/react` | ❌ **not imported** | Dead dependency |
| `@date-fns/tz` | ❌ **not imported** | Dead dependency |
| `vite-plugin-singlefile` | ❌ not in vite config | Dead devDependency |

**Largest contributor:** monolithic `index-*.js` bundling Firebase + Recharts + motion + muscle highlighter + all routes. **No effective code-splitting** due to mixed static/dynamic imports of calculator modules.

### Console performance note

Firebase offline errors on **every route** add main-thread console I/O during crawl (37 errors). Remove boot probe to reduce noise and minor overhead.

---

## STEP 7 — Gap Analysis & Roadmap

### Now (this sprint) — blocks real users

| # | Item | Effort | Files / areas |
|---|------|--------|---------------|
| 1 | Server-verified tier/role gating (Firebase custom claims + Firestore reads) | **L** | `store.ts`, `TierGate.tsx`, `Admin.tsx`, `Programs.tsx`, Firestore rules |
| 2 | Remove/fix Firebase boot probe causing console errors | **S** | `main.tsx` |
| 3 | Wire forgot-password to Firebase `sendPasswordResetEmail` | **S** | `Auth.tsx:228-265` |
| 4 | Fix Register Google button (`onClick` stub) | **S** | `Auth.tsx:213` |
| 5 | Fix program → exercise slug links (404) | **S** | `Programs.tsx:202` |
| 6 | Install ESLint + fix `tsc` errors | **S** | `package.json`, calculator files |
| 7 | Stop `syncUserFromFirebase` hardcoding profile defaults | **M** | `store.ts:51-56` |

### Next (this quarter) — hardening & completeness

| # | Item | Effort | Files / areas |
|---|------|--------|---------------|
| 8 | Persist bodyLogs, exerciseLogs, tickets to Firestore (not just localStorage) | **L** | `store.ts`, new Firestore hooks |
| 9 | Stripe (or payment processor) integration replacing `upgradeTier` simulation | **L** | `Pricing.tsx`, `Dashboard.tsx` billing, backend/webhook |
| 10 | Complete Farsi i18n for Auth, TierGate, calculator categories | **M** | `Auth.tsx`, `TierGate.tsx`, `faDict` |
| 11 | Real code-splitting (route-based + fix calculator import duplication) | **M** | `vite.config.ts`, `Calculators.tsx`, `HomeSmartTools.tsx` |
| 12 | Remove dead deps (`@base-ui/react`, `@date-fns/tz`, `vite-plugin-singlefile`) | **S** | `package.json` |
| 13 | Calculator input validation (BMI/WHR/Brzycki edge cases) | **M** | `calculators.ts`, calculator components |
| 14 | `aria-live` on calculator results + chart text alternatives | **M** | `SharedCalculatorUI.tsx`, `Dashboard.tsx` |
| 15 | Fix tablet horizontal overflow | **M** | Layout, Home hero, pricing table |
| 16 | Exercise video/thumbnail content pipeline | **L** | `store.ts` EXERCISES, `Exercises.tsx` |
| 17 | Align design tokens to brand palette (pine/bone/ember/brass) or update brand docs | **M** | `index.css`, Tailwind theme |

### Later (this year) — growth features

| # | Item | Effort | Files / areas |
|---|------|--------|---------------|
| 18 | Native mobile apps (React Native / Capacitor) | **L** | New repos |
| 19 | Real coach CRM with Firestore messaging | **L** | `Coach.tsx`, `Dashboard.tsx` chat, backend |
| 20 | Admin CRUD connected to Firestore (not `demoUsers`) | **L** | `Admin.tsx` |
| 21 | Light mode theme | **M** | `index.css`, `Layout.tsx` |
| 22 | i18n beyond en/fa (ar, tr, etc.) | **L** | `i18n.tsx` |
| 23 | Content partnerships / CMS for blog & programs | **L** | New CMS integration |
| 24 | Lighthouse Performance ≥ 90 (bundle budget, image CDN) | **M** | Build config, assets |

---

## Appendix A — Routes (from `src/App.tsx`)

```
/  /exercises  /exercises/:slug  /programs  /programs/:slug  /diet  /diet/:slug
/calculators  /calculators/:slug  /blog  /blog/:slug  /pricing
/login  /register  /forgot-password
/dashboard  /dashboard/profile  /dashboard/programs  /dashboard/progress
/dashboard/chat  /dashboard/billing
/admin  /coach  *
```

## Appendix B — Runtime artifacts

| Artifact | Path |
|----------|------|
| Browser audit JSON | `/opt/cursor/artifacts/audit/browser-audit.json` |
| Calculator edge tests | `calc-edge-tests.mjs` output (15 tests) |
| Viewport screenshots | `/opt/cursor/artifacts/audit/{mobile,tablet,desktop}_*.png` |
| i18n screenshots | `/opt/cursor/artifacts/audit/i18n-fa-*.png` |
| Lighthouse attempt | `/opt/cursor/artifacts/audit/lighthouse-desktop.json` (crashed) |

## Appendix C — Intentional demo behavior (not classified as bugs)

- Coach chat auto-reply after 1.5s (`Dashboard.tsx:529-539`) — appears intentional for demo
- Admin/Coach dashboards use hardcoded demo users/clients — intentional scaffolding
- Pricing "Subscribe" without payment processor — intentional simulation per code comment
- 24/7 support stat on home — marketing copy, not verified service

---

*Audit performed 2026-07-15. No code changes were made during this pass.*
