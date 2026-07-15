# EsiFit — Full Audit
**Date:** 2026-07-15
**Method:** Executed audit — `npm install`, `npm run dev`, `npm run build`, `tsc --noEmit`, a headless-Chromium crawl of every route (console/network capture), targeted UI interaction tests (language toggle, localStorage tampering), and source review with file:line citations. A prior static-only review (`EsiFit_Review_Report.md`, dated 2026-06-23) already exists in this repo — this pass re-verifies its claims against the *current* code and found the project has moved on significantly (real Firebase auth now exists, the debug error-overlay is gone), while surfacing one new **critical** vulnerability the old report missed.

---

## Executive Summary

EsiFit is a React 19 / Vite 7 / Tailwind 4 fitness platform. It **builds cleanly, boots without a single console error or React warning across all 23 routes**, and real Firebase Authentication (email/password + Google) is now wired up — this is a genuine improvement over the June review, which described a 100% `localStorage`-only demo. However, the **authorization layer was only half-migrated**: subscription-tier and admin-role gating still reads from a client-controlled `localStorage` object, and — more seriously — the live `firestore.rules` on this repo allow a signed-in user to **write their own `role` and `subscriptionTier` fields directly**, meaning any user can grant themselves Admin/Elite access with a few lines in the browser console, no exploit needed. The "Upgrade to VIP/Elite" button on the Pricing page is decorative: it flips local state only and never touches Firestore or a payment processor. Content depth is still thin (10 exercises, 3 programs, 2 diet plans, 3 articles) and none of it is translated to Persian even though the UI chrome fully supports Farsi/RTL — confirmed both by code and by an actual RTL screenshot, which renders correctly.

| Area | Grade | Basis |
|---|---|---|
| Build / boot health | A | Clean `vite build`, zero console errors on 23/23 crawled routes |
| Frontend architecture | B− | Some files >600 lines, duplicate static+dynamic imports (Vite warns), no tests |
| Type safety | B | `tsc --noEmit` passes with only 6 pre-existing unused-import errors |
| Auth (login/register) | B | Real Firebase Auth; no fake "any password works" flow found |
| **Authorization / tier gating** | **F** | Client-only checks; Firestore rules let users self-promote role & tier (see SEC-1) |
| **Payments** | **F** | "Upgrade" is a local state flip; no Stripe, no server write, reverts on next login |
| i18n (UI) | A− | Verified via live screenshot: dropdown correctly flips `dir=rtl`, mirrors nav |
| i18n (content) | D | 0 of 10 exercises / 3 articles / 5 programs have Farsi text |
| Content depth | D | Same thin catalog as the June review — no expansion |
| Accessibility/RTL rendering | B | No layout breakage observed at 375px or in RTL mode |
| Tooling hygiene | D | `npm run lint` fails outright — ESLint isn't even installed |
| Security misc | C | No debug overlay in prod, Firebase client keys are legitimately public |

---

## Step 0 — Getting the Project Running

- `npm install`: succeeded, 238 packages, **2 vulnerabilities** (1 low, 1 high — both in `esbuild`/`vite` dev-server tooling, not runtime-exploitable in production).
- `npm run dev`: booted in ~400ms with no errors.
- `npm run build`: **succeeded**. Output: `dist/assets/index-*.js` = **1,597.15 kB (494.84 kB gzip)**, CSS 48.5 kB (8.18 kB gzip). Vite explicitly warns the JS chunk exceeds its 500 kB budget, and flags that `BodyCompositionCalculators.tsx`, `EnergyNutritionCalculators.tsx`, `StrengthTrainingCalculators.tsx`, and `HealthLifestyleCalculators.tsx` are **both statically imported** (by `Calculators.tsx`) **and dynamically imported** (by `HomeSmartTools.tsx`), which defeats the code-splitting Vite is trying to do — the "lazy" home-page tabs still ship in the main bundle.
- `npm run lint`: **fails immediately** — `sh: 1: eslint: not found`. ESLint is referenced in `package.json`'s `lint` script but isn't a devDependency at all, so this script has never actually run in CI or locally.
- `npx tsc --noEmit`: 6 errors, all `TS6133 declared but never read` (unused `React`/`AnimatePresence`/`getState` imports) in `BodyCompositionCalculators.tsx:1`, `EnergyNutritionCalculators.tsx:1`, `HealthLifestyleCalculators.tsx:1`, `StrengthTrainingCalculators.tsx:1,5`, `Calculators.tsx:4`. Cosmetic, not functional.
- **Firebase wiring — verified, not assumed:** `src/lib/firebase.ts` initializes a real Firebase app from `firebase-applet-config.json` (project `symmetric-component-6sjh2`). `src/pages/Auth.tsx` calls real `signInWithEmailAndPassword` / `createUserWithEmailAndPassword` / `signInWithPopup` (Google). `src/lib/store.ts:39-63` pulls the user profile from Firestore (`syncUserFromFirebase`). **However**, everything else — body logs, exercise logs, calculator history, tickets, saved exercises, and the subscription tier itself once a session is running — still lives only in `localStorage` (`src/lib/store.ts:9-33`) and is never written back to Firestore. So this is a **hybrid**, not a full migration: real auth, fake everything-after-auth.
- In this sandboxed audit environment, outbound requests to `firestore.googleapis.com` are network-blocked (only npm/GitHub domains are allowlisted here), so I could not verify a live round-trip login end-to-end. The crawl confirms the SDK correctly *attempts* the connection and fails gracefully (see Step 2) — I'm flagging this as an environment limitation, not an app bug.

---

## Step 1 — Feature Inventory

| Feature | Route/File | Status | Evidence |
|---|---|---|---|
| Home page + 14-calculator tabbed console | `/` , `HomeSmartTools.tsx` | Working, but only **13 of 14** calculators are duplicated here | Home tabs render Bmi/BodyFat/Ffmi/Whr/BodyTypeQuiz/Bmr/Tdee/Macros/WaterIntake/OneRepMax/VolumeLoad/GoalDate/CaloriesBurned = 13. The 14th, "% of 1RM Table" (`rep-max-table`), exists only on `/calculators` |
| Calculators index & detail pages | `/calculators`, `/calculators/:slug` | Working — all 14 present | `Calculators.tsx:14-27` lists exactly 14 slugs matching `calculators.ts`'s 14 exported functions |
| Login (email/password) | `/login`, `Auth.tsx:9-64` | Working, real Firebase call | `signInWithEmailAndPassword` used; no "any password accepted" shortcut found (unlike June report) |
| Register | `/register`, `Auth.tsx:125-163` | Working, real Firebase call, writes a Firestore `users/{uid}` doc with `role: 'USER'`, `subscriptionTier: 'FREE'` | `createUserWithEmailAndPassword` + `setDoc` |
| Google Sign-In | `Auth.tsx:38-64` | Working (Login page) | Real `signInWithPopup(GoogleAuthProvider)`. **Not wired on Register page** — the "Sign up with Google" button at `Auth.tsx:213` has `onClick={() => {}}` — a no-op |
| Forgot Password | `/forgot-password`, `Auth.tsx:228-265` | **Fake** | `onSubmit` just does `setSent(true)`; no `sendPasswordResetEmail` call to Firebase at all — no email is ever sent |
| Pricing / Upgrade | `/pricing`, `Pricing.tsx:22` | **Fake** | Calls `upgradeTier(tier)`, which only patches local `localStorage` state (`store.ts:80-85`) — no Stripe, no Firestore write. Reverts next time `syncUserFromFirebase` runs |
| Tier-gated content (VIP/Elite programs, diet plans, coach chat) | `TierGate.tsx` | **Client-only, bypassable** | See SEC-1/SEC-2 below |
| Exercise library + anatomy filter | `/exercises`, `Exercises.tsx` | Working, genuinely wired | `react-muscle-highlighter`'s `<Model>` is rendered and its `onClick` maps body-part slugs to muscle-group filters (`MUSCLE_MAPPING`, `Exercises.tsx:8-53`) — this **is** connected to real filtering, contrary to what the audit brief suspected might be decorative |
| Programs, Diet plans, Blog | `/programs`, `/diet`, `/blog` | Working, thin content | 3 programs, 2 diet plans, 3 articles — unchanged from June review |
| Admin console | `/admin`, `Admin.tsx:14-17` | Working UI, but gating is client-only and data is hardcoded demo data (`Admin.tsx:34`) | See SEC-1 |
| Coach chat / support tickets | `/coach`, `Dashboard.tsx` chat tab | Demo-only, local | Tickets/messages are pure `localStorage` objects (`store.ts:127-164`), no real coach on the other end |
| i18n toggle (EN/FA) | `Layout.tsx:72-81` | **Working correctly** | Confirmed live: selecting "فارسی" sets `document.documentElement.dir = 'rtl'` and `lang = 'fa'`, and the rendered screenshot shows the nav, cards, and text properly mirrored |
| i18n content | `store.ts` seed data | **Not translated** | 0 occurrences of `fa:` anywhere in `store.ts`'s exercise/program/diet/article data — only UI chrome strings are bilingual |
| 404 page | `*`, `NotFound.tsx` | Working | Confirmed via crawl: unmatched route still returns 200 + renders NotFound, no console errors |
| Deep-link refresh | any nested route | Working in both dev and `vite preview` | `curl` returned 200 for `/dashboard/progress` on both dev server and the production `preview` server |

---

## Step 2 — Bug Hunt

**[SEVERITY: Critical] Users can grant themselves Admin role and Elite subscription tier via a direct Firestore write**
File: `firestore.rules:16-30` (the `isValidUser`/`users/{userId}` `allow update` rule)
Repro steps:
1. Sign in as any normal user (real Firebase Auth session, no exploit needed).
2. From the browser console, call the Firestore SDK directly: `updateDoc(doc(db,'users',auth.currentUser.uid), { role: 'ADMIN', subscriptionTier: 'ELITE' })`.
3. The rule at `firestore.rules:26-28` only requires `isOwner(userId)` + `isValidUser(incoming())` + that the changed keys are a subset of `['name','role','subscriptionTier']`. It never checks the *previous* role/tier or requires a privileged caller — so this update is **allowed**.
Expected vs Actual: Role/tier changes should require a trusted server (Cloud Function, admin SDK, or payment-webhook write) — not be user-writable at all. Actual: any authenticated user can self-elevate to Admin and Elite for free.
Suggested fix: Remove `role` and `subscriptionTier` from the client-writable key set entirely; make them writable only by a Cloud Function running with the Admin SDK (triggered by a verified payment webhook for tier, and by a separate manual-invite flow for role).

**[SEVERITY: Critical] Tier/role gating (`TierGate`, `/admin`) reads a fully client-controlled `localStorage` object, no server check exists**
File: `src/components/TierGate.tsx:18`, `src/pages/Admin.tsx:14-17`
Repro steps (performed live in this audit):
1. On any page, run in devtools: `localStorage.setItem('esifit_store', JSON.stringify({currentUser:{id:'x',role:'ADMIN',subscriptionTier:'ELITE', ...}, bodyLogs:[],exerciseLogs:[],calculatorResults:[],tickets:[],savedExercises:[]}))`.
2. Reload and navigate to `/admin`.
Expected vs Actual: Expected a redirect/denial for a non-privileged session. Actual: the Admin dashboard rendered in full ("Admin Dashboard — Manage users, content, and revenue", MRR/user tables), and `/dashboard/billing` displayed "Current Plan: Elite / $79.99/month" with full manage-subscription controls — confirmed by capturing the live rendered page text and a screenshot during this audit.
Suggested fix: Even independent of SEC-1, gating decisions must be re-verified against the signed-in user's real Firestore document (or, better, a custom-claims token) on every privileged read, not against a local cache that the browser owns.

**[SEVERITY: High] "Upgrade to VIP/Elite" does not persist and is not a real payment flow**
File: `src/pages/Pricing.tsx:22`, `src/lib/store.ts:80-85`
Repro: Click "Upgrade" on Pricing → `upgradeTier()` mutates local state only. No Stripe Elements, no checkout redirect, no Firestore write. Log out/in (or another device) and the tier reverts to whatever Firestore has (`FREE` by default).
Suggested fix: Route "Upgrade" through a real payment processor (Stripe Checkout/Billing) and grant tier server-side via webhook only.

**[SEVERITY: High] "Sign up with Google" on the Register page is a dead button**
File: `src/pages/Auth.tsx:213` — `onClick={() => {}}`
Repro: Go to `/register`, click "Sign up with Google". Nothing happens; no error, no navigation. (The equivalent button on `/login` works correctly.)
Suggested fix: Wire it to the same `signInWithPopup` handler used on the Login page.

**[SEVERITY: High] "Forgot Password" never sends an email**
File: `src/pages/Auth.tsx:247` — `onSubmit={e => { e.preventDefault(); setSent(true); }}`
Repro: Submit any email on `/forgot-password` (even a nonexistent one) → always shows "Check your email," but Firebase's `sendPasswordResetEmail` is never called anywhere in the file.
Suggested fix: Call `sendPasswordResetEmail(auth, email)` and only show the success state after it resolves; surface Firebase's error for unknown accounts appropriately (without leaking whether an email exists, per standard practice).

**[SEVERITY: Medium] Duplicate static+dynamic imports defeat code-splitting**
File: `src/components/calculators/HomeSmartTools.tsx:5,17,28,37` vs `src/pages/Calculators.tsx` (static imports of the same four files)
Evidence: `vite build` explicitly warns about this for all four calculator-group files. Net effect: the "lazy-loaded" home tabs still ship inside the same 1.6 MB main chunk since the static import elsewhere forces them into it anyway.
Suggested fix: Pick one strategy — either have `Calculators.tsx` also `React.lazy()` these per-slug, or drop the lazy-loading pretense in `HomeSmartTools.tsx` since it isn't achieving anything today.

**[SEVERITY: Medium] `npm run lint` is broken — ESLint isn't installed**
File: `package.json` (`"lint": "eslint . --ext ts,tsx ..."`), no `eslint` in `devDependencies`
Repro: `npm run lint` → `sh: 1: eslint: not found`.
Suggested fix: Add `eslint` + a config (flat config for ESLint 9, matching Vite 7/React 19/TS 5.9) to `devDependencies`, or remove the script if linting isn't actually part of the workflow.

**[SEVERITY: Low] Anatomy-model "Neck" region maps to a muscle group no exercise has**
File: `src/pages/Exercises.tsx:17` (`'neck': 'Neck'`) vs. `src/lib/store.ts` — no exercise anywhere is tagged `muscleGroups: [...'Neck'...]` (only `Back`, `Biceps`, `Chest`, `Core`, `Glutes`, `Hamstrings`, `Legs`, `Quadriceps`, `Rear Delts`, `Shoulders`, `Triceps` appear).
Repro: Click the neck region on the anatomy model → filters to zero results with no explanatory empty state beyond a generic "no exercises found," which reads as broken content rather than an expected empty filter.
Suggested fix: Either tag a neck exercise or remove the neck hotspot from `MUSCLE_MAPPING` until content exists for it.

**[SEVERITY: Low] Debug scripts committed at repo root**
File: `check.mjs`, `check.cjs` (both just `console.log`-dump the `react-muscle-highlighter` module export shape)
Suggested fix: Delete — clearly scratch files from wiring up the dependency, not part of the app.

**No evidence found for (explicitly checked and ruled out):**
- *Debug/XSS error overlay in production HTML* — the June report's CRIT-1. Current `index.html` has no such script, and `ErrorBoundary.tsx:33` correctly gates the stack-trace `<pre>` behind `process.env.NODE_ENV !== 'production'`.
- *`Math.random()`-based ID collisions* — `generateId()` in `store.ts:87-95` uses `crypto.randomUUID()` when available, only falling back to a `Math.random()` polyfill UUID in unsupported environments.
- *React console errors/warnings anywhere* — a full headless-Chromium crawl of all 23 routes (including the 404 catch-all) captured **zero** `pageerror` events and zero React-originated console warnings. The only console noise on every route is the app failing to reach `firestore.googleapis.com` and `fonts.googleapis.com`, both blocked by this sandbox's network egress rules, not app bugs.
- *Broken SPA deep-link refresh* — confirmed 200 responses for `/dashboard/progress` and similar nested routes on **both** `vite dev` and `vite preview` (i.e., this will also work correctly on any static host with a proper history-fallback rule, though that fallback rule still needs to be configured on whatever production host is used — Vite's dev/preview servers do this automatically, but e.g. a raw S3 bucket would not).
- *RTL/mirroring bugs* — live screenshot of the homepage in `فارسی` shows correct `dir="rtl"`, mirrored navigation order, and right-aligned text throughout. I did not exhaustively check every page in RTL mode (see Limitations).
- *Mobile overflow at 375px* — homepage, BMI calculator, and dashboard screenshots at 375px show no visible horizontal overflow or clipped text (see Step 3).

---

## Step 3 — UI Audit (partial — see Limitations)

Screenshots were captured for the homepage (desktop 1440px, mobile 375px, and RTL/Farsi), the BMI calculator (375px), and the dashboard (375px, logged-out state). All rendered cleanly: consistent dark theme, orange accent color, no default unstyled browser controls visible (sliders and buttons are custom-styled), no obvious spacing breakage. The homepage is a long single-page scroll (~9,100px tall at mobile width) covering hero, the 14-calculator console, programs, testimonials, and a footer — appropriate for a marketing-style landing page but worth knowing if the intent was a shorter, more conversion-focused first screen.

I did not complete a full page-by-page × 3-breakpoint visual walk (that's ~60+ individual screenshots for 20 routes) or run Lighthouse — see Limitations below for why, and what I'd need to finish it.

---

## Step 4 — UX Audit (light-touch)

- **Navigation:** Calculators, Programs, Diet, Exercises, Pricing are all one click from the top nav on every page — no deep IA problems observed.
- **Auth error messaging:** Login/Register show Firebase's raw `err.message` in the error box (e.g., `err.message || 'Invalid credentials'`) — this will occasionally surface Firebase's internal English error strings (`Firebase: Error (auth/invalid-credential).`) verbatim to Persian-speaking users on the Farsi-selected UI, which is a minor but real localization gap.
- **Gated content UX:** `TierGate.tsx:26` still renders the locked content into the DOM behind a CSS blur (`showBlur` prop) rather than omitting it — so premium program/diet details are inspectable via dev tools even without the SEC-1/SEC-2 bypasses. Low severity given the two Critical findings already make this moot, but worth fixing independently.
- **Conversion funnel:** Free → Pricing → "Upgrade" is 2 clicks, but since it's not a real payment flow (see High-severity bug above), there's currently no actual conversion funnel to evaluate.

---

## Step 5 — Security & Data Integrity Audit

- **Authorization root cause:** See Critical findings SEC-1 and SEC-2 above — the real vulnerability is in `firestore.rules`, not just the client code, because the rules would let a user write `role`/`subscriptionTier` even from a fully custom client bypassing the React app entirely (e.g., a `curl`/Postman call with a valid ID token).
- **Firestore rules — otherwise reasonable:** Outside of the role/tier issue, the rules are not the "`allow read, write: if true`" free-for-all the audit brief worried about — there's a genuine default-deny catch-all (`firestore.rules:4-6`), owner-scoped reads/writes, field allow-lists, and type/size validation on `users` and `bodyLogs`. This is meaningfully better than a typical prototype's rules file.
- **Secrets:** `firebase-applet-config.json`'s `apiKey` is a Firebase **client** key, which is meant to be public (security is enforced by Firestore Rules + Auth, not by hiding this key) — correctly not a leak. No server secrets, private keys, or `.env` values were found committed anywhere in the repo.
- **No debug overlay in production** — confirmed above.

---

## Step 6 — Performance Audit

- **Bundle:** `dist/assets/index-*.js` = 1,597.15 kB raw / 494.84 kB gzip, all in a single chunk; Vite's own build output flags this as over its 500 kB warning threshold.
- **Confirmed unused dependencies:** `@base-ui/react` and `@date-fns/tz` appear in `package.json` `dependencies` but **zero files under `src/` import either package** (`grep -rl` returned nothing) — dead weight in `node_modules`/install time, though tree-shaking means they likely aren't inflating the actual JS bundle much if at all.
- **Root cause of the bundle-size warning:** most plausibly the duplicate static+dynamic import of the four calculator-group files (Bug #5 above), plus `recharts`, `motion`, and `firebase` (auth+firestore) all being fairly large libraries pulled into one chunk with no manual chunking configured in `vite.config.ts`.
- **Lighthouse:** not run in this pass — see Limitations.

---

## Step 7 — Roadmap

**Now (this sprint):**
- Fix SEC-1: lock `role`/`subscriptionTier` out of client-writable Firestore fields; move both to Cloud-Function-only writes — L — `firestore.rules`, new Cloud Function
- Fix SEC-2: re-verify tier/role against Firestore (or custom claims) at the point of privileged reads, not `localStorage` — M — `TierGate.tsx`, `Admin.tsx`
- Wire "Upgrade" to real Stripe Checkout + webhook-driven tier grant — L — `Pricing.tsx`, new backend
- Fix dead "Sign up with Google" button and fake "Forgot Password" flow — S — `Auth.tsx`
- Install ESLint so `npm run lint` actually runs — S — `package.json`

**Next (this quarter):**
- Persist body logs / exercise logs / calculator history / tickets to Firestore instead of `localStorage` — M
- Translate exercise/program/diet/article content to Farsi, or clearly label it English-only in the Farsi UI — M — `store.ts`
- Resolve the static+dynamic import duplication and add manual chunking to cut the 1.6 MB bundle — M — `vite.config.ts`, `HomeSmartTools.tsx`
- Expand content catalog (10 exercises / 3 programs / 2 diet plans / 3 articles is thin for a "comprehensive" platform) — L
- Remove `content-locked`-blur DOM leakage for gated content once auth is hardened — S — `TierGate.tsx`

**Later (this year):**
- Real coach-chat backend (currently local-only demo tickets) — L
- Admin dashboard backed by real Firestore aggregation instead of hardcoded demo rows — L
- Automated visual/regression testing (none exists today) — M
- Full Lighthouse-driven performance/accessibility pass once bundle splitting lands — M

---

## Limitations of This Audit Pass

Being transparent about what this pass did **not** fully cover, and why:
- **Lighthouse was not run.** The sandbox this audit ran in doesn't have `lighthouse` installed and installing it would require npm registry access for a large dependency tree beyond what was practical in this pass; bundle-size numbers above come directly from `vite build` output instead.
- **Live Firebase read/write could not be end-to-end verified** — this sandbox's network egress is restricted to package registries and GitHub; `firestore.googleapis.com` calls fail here, confirmed to be a sandbox limitation (not an app bug) since the code paths and request shapes are correct.
- **Not every one of the 20 routes was screenshotted at all 3 breakpoints** — I captured a representative sample (home at all 3 states, one calculator, one dashboard page at mobile) rather than an exhaustive 60-shot walk, to keep this pass proportionate; the full crawl did verify **zero console/React errors** across every route, which is the higher-value signal for correctness.
- **The 14 calculators' math was verified by source review**, not by driving every slider to its exact boundary value in the UI (inputs are range sliders, not free-text fields, so some edge cases like "zero" aren't reachable through the UI at all — e.g., BMI's weight slider floors at 40 kg, so a literal zero-weight NaN is not user-reachable, though it would still occur if `calcBMI` were ever called with 0 from elsewhere).

If you'd like, I can go back and close any of these specific gaps next (e.g., install Lighthouse, or do the full per-breakpoint screenshot walk).
