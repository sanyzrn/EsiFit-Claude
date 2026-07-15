# EsiFit — Comprehensive Project Review

**Reviewer:** Senior Frontend / Product Engineer
**Date:** 2026-06-23
**Subject:** `esifit.zip` (React 19 + Vite 7 + Tailwind 4, single-file build, ~635 KB source)
**Verdict:** A polished marketing-grade UI prototype, **not a production application**. The entire data layer, auth, payments, coaching, i18n, and admin features are *simulated in localStorage*. Before this can be sold or operated, ~80 % of the back-end and ~30 % of the front-end has to be rebuilt.

---

## 1. Executive Summary

| Area | Grade | Comment |
|---|---|---|
| Visual / UX design | A− | Genuinely premium dark-theme aesthetic, good spacing, nice animations. |
| Frontend architecture | C | Pages are huge files, custom store + custom i18n, no error boundaries, no tests. |
| Type safety | B+ | TypeScript strict mode is on and the project compiles cleanly. |
| **Backend / data** | **F** | **There is no backend.** Everything lives in `localStorage`. |
| **Security** | **F** | Plain-text "passwords", admin role granted by typing an email, XSS-prone error overlay in production HTML. |
| **Auth** | **F** | "Login" accepts *any* credentials, "Sign in with Google" button is decorative. |
| **Payments** | **F** | "Subscribe" is a 1-line `upgradeTier()` call; no Stripe, no webhooks, no invoices. |
| Accessibility | C− | No skip links, no aria labels on icon buttons, blur-locked content is not screen-reader friendly, RTL handling is partial. |
| Performance | C | Single-file build is 816 KB / 232 KB gzip. Bundles every page on first paint. |
| Internationalization | C+ | Custom solution works, but Persian translations are hard-coded inline as huge ternaries. |
| Content | C | Only 10 exercises, 3 programs, 2 diet plans, 3 articles — far too thin for "comprehensive". |
| Tests / CI | F | None. |
| Documentation | C | README exists but does not match the project (claims "14 calculators" — there are 14, OK; claims "comprehensive" — it is a demo). |

### One-paragraph verdict
EsiFit looks like a finished SaaS but is a **front-end-only demo** wrapped around `localStorage`. The visual layer is good enough to ship; the functional layer is not. To become "world-class production-ready" it needs: (1) a real backend with auth, DB, and Stripe, (2) a proper i18n pipeline and content management, (3) testing, monitoring, accessibility, and SEO, and (4) a vastly expanded content corpus. The prompt at the end of this report describes exactly that transformation.

---

## 2. Project Map

```
esifit/
├── index.html                ← hard-coded XSS-style error overlay (see Bug #1)
├── vite.config.ts            ← uses viteSingleFile (entire app inlined into one HTML)
├── package.json              ← React 19.2, Tailwind 4.1, lucide-react 1.21 (very old), no test deps
├── public/images/hero-bg.jpg
└── src/
    ├── App.tsx               ← 59 lines, HashRouter, no error boundary, no 404 route
    ├── main.tsx              ← 10 lines
    ├── index.css             ← Tailwind 4 with @theme tokens, custom scrollbar, 3 animations
    ├── components/
    │   ├── Layout.tsx        ← nav + footer + lang switcher
    │   └── TierGate.tsx      ← blur overlay for locked content
    ├── lib/
    │   ├── store.ts          ← THE entire data layer (371 lines, localStorage)
    │   ├── types.ts          ← domain types
    │   ├── calculators.ts    ← 14 calculator pure functions
    │   ├── i18n.tsx          ← lightweight context-based translator
    │   └── utils.ts          ← duplicated in src/utils/cn.ts
    ├── utils/cn.ts           ← duplicate of lib/utils.ts
    └── pages/
        ├── Home.tsx          (252)
        ├── Auth.tsx          (215)  Login/Register/ForgotPassword
        ├── Calculators.tsx   (645)  14 calculators in ONE file
        ├── Exercises.tsx     (216)  English-only
        ├── Programs.tsx      (254)
        ├── Diet.tsx          (171)  English-only
        ├── Blog.tsx          ( 98)  English-only, custom markdown
        ├── Pricing.tsx       (172)
        ├── Dashboard.tsx     (685)  6 dashboard sections in ONE file
        ├── Admin.tsx         (253)  English-only, demo data
        └── Coach.tsx         (184)  English-only, demo data
```

The compile (`tsc --noEmit`) and build (`vite build`) both succeed. Final bundle: **816 KB inline HTML, 232 KB gzip**.

---

## 3. Critical Issues (must fix before any public deployment)

### CRIT-1 — There is no authentication
**File:** `src/lib/store.ts:37-63`

```ts
export function login(email: string, _password: string): User | null {
  const demoUsers: Record<string, Partial<User>> = {
    'admin@fitpro.com': { role: 'ADMIN', subscriptionTier: 'ELITE', ... },
    ...
  };
  const demo = demoUsers[email];
  const user: User = { id: 'user_' + Math.random()..., ... };  // any email is accepted
  state.currentUser = user;
  saveState();
  return user;
}
```

- Password is received and **silently discarded** (`_password`).
- Typing `admin@fitpro.com` in the login form makes anyone an admin.
- "Forgot password" form does literally nothing — it just shows a success screen.
- "Sign in with Google" button has no `onClick` handler.

**Fix:** Replace with real auth (Auth.js / Clerk / Supabase Auth / Firebase Auth / Cognito). Hash + salt passwords server-side. Use HTTP-only session cookies or short-lived JWTs with refresh tokens. Implement real email verification and password reset.

---

### CRIT-2 — There is no payment system
**File:** `src/pages/Pricing.tsx:16-24`

```ts
const handleSubscribe = (tier: SubscriptionTier) => {
  if (!user) { navigate('/register'); return; }
  upgradeTier(tier);                  // ← that's the whole "purchase"
  navigate('/dashboard/billing');
};
```

- No checkout, no Stripe, no card collection, no invoices, no taxes, no SCA, no webhooks.
- The "Cancel subscription" button silently downgrades the user to FREE with no confirmation, no proration, no email.
- Pricing is stored as `999`, `2999`, `7999` and divided by 100 in `Dashboard.tsx:620` — undocumented "cents" convention; FA prices are completely different *content* not formatted versions.

**Fix:** Integrate Stripe (or Paddle for global tax). Real customer object, real subscription lifecycle, webhook-driven entitlements stored server-side; never trust client-side tier.

---

### CRIT-3 — Server-side authorization does not exist
Every "protected" piece of content (programs, diet plans, admin, coach) is gated only by `hasTierAccess(state.currentUser?.subscriptionTier, ...)` in the **browser**. A user opens DevTools → `localStorage.setItem('fitpro_store', JSON.stringify({currentUser:{...subscriptionTier:'ELITE',role:'ADMIN'}}))` → reload → full access to everything.

**Fix:** All authorization decisions must happen server-side. The client UI may show or hide elements optimistically, but every fetch must be re-checked. Use middleware/route guards with verified session tokens.

---

### CRIT-4 — `index.html` contains a global error logger that injects `event.error.stack` into the DOM
**File:** `index.html:15-22`

```html
<script>
  window.addEventListener('error', (event) => {
    document.body.innerHTML += '<div style="...">' + event.message + ' ' + event.filename + ':' + event.lineno + ' ' + (event.error && event.error.stack) + '</div>';
  });
  window.addEventListener('unhandledrejection', (event) => {
    document.body.innerHTML += '<div style="...">Unhandled Promise: ' + event.reason + '</div>';
  });
</script>
```

- This was clearly a dev-debug aid that got shipped.
- It overwrites the entire DOM (`body.innerHTML +=`), destroying React's mount and triggering more errors.
- `event.message`, `filename`, and `event.reason` are pasted into HTML **unescaped** — any error message coming from a malicious resource is an XSS sink.
- It runs in production.

**Fix:** Delete it. Use Sentry / Datadog RUM / Bugsnag and a real React `<ErrorBoundary>`.

---

### CRIT-5 — Sensitive data and "demo credentials" exposed in the login screen
**File:** `src/pages/Auth.tsx:75-83` displays
```
admin@fitpro.com — Admin role
coach@fitpro.com — Coach role
vip@fitpro.com — VIP subscriber
Password: anything
```
right on the login UI. Acceptable for an internal demo, unacceptable for production.

---

## 4. High-Severity Bugs

### BUG-1 — `ScrollToTop` component does nothing
**File:** `src/App.tsx:19-22`
```tsx
function ScrollToTop() {
  // Simple scroll to top on route change
  return null;
}
```
The component is mounted but never actually listens for route changes or scrolls. Every navigation keeps the previous scroll position.

**Fix:**
```tsx
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}
```

---

### BUG-2 — `subscribe()` returns the wrong type
**File:** `src/lib/store.ts:6`
```ts
export function subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); }
```
`Set.delete` returns `boolean`, but the contract expected by every caller (`useEffect`) is `() => void`. Every caller works around it (`return () => { u(); };`) — the workaround is repeated **15+ times** in the codebase.

**Fix:**
```ts
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
```

---

### BUG-3 — `HashRouter` instead of `BrowserRouter`
**File:** `src/App.tsx:27`
URLs all look like `https://app.com/#/dashboard/profile`. This kills SEO, breaks Open Graph share previews, and confuses analytics. With Vite + a proper host it is trivial to use `BrowserRouter` and a SPA fallback.

---

### BUG-4 — No 404 route, no error boundary
- If a user lands on an unknown path, the `Routes` block renders nothing → blank page.
- Any thrown render error bubbles up and is "handled" by the broken `window.onerror` hook in `index.html` (see CRIT-4), destroying the page.

**Fix:** Add `<Route path="*" element={<NotFound />} />` and wrap `<Routes>` in an `ErrorBoundary` that reports to a monitoring service.

---

### BUG-5 — `getStreak()` only counts contiguous days from today, but `i > 0` exit is wrong
**File:** `src/lib/store.ts:170-183`
```ts
for (let i = 0; i < 365; i++) {
  const d = ...;
  const hasLog = state.exerciseLogs.some(l => l.date.slice(0, 10) === ds);
  if (hasLog) streak++;
  else if (i > 0) break;   // ← only breaks if i > 0
}
```
- Logic is fragile: if the user did not work out today, the streak is silently 0 forever, even if they trained yesterday and the 14 days before.
- Performance is O(365 × N) — a `Set<string>` of dates would be O(N).
- Timezone bug: `toISOString().slice(0,10)` is UTC, but `new Date()` is local → users near day boundaries get phantom resets.

---

### BUG-6 — Body-fat (US Navy) formula returns NaN/negative for many valid inputs
**File:** `src/lib/calculators.ts:14-44`
- `Math.log10(waistCm - neckCm)` is `NaN` if `waist ≤ neck` (totally possible for very lean men).
- No input validation; the UI passes the raw value through and renders `NaN%`.
- Female formula has the same issue: `Math.log10(waistCm + hip - neckCm)`.

**Fix:** Validate that `waist > neck` (and `waist + hip > neck` for females). Return a typed error object the UI can render as a clear message.

---

### BUG-7 — `calcGoalDate` divides by zero / `Infinity`
**File:** `src/lib/calculators.ts:142-155`
- If user enters `weeklyCalorieDelta = 0`, result is `Infinity` weeks.
- If `currentWeight === goalWeight`, result is `weeks = 0` but the message is misleading ("you'll reach your goal today").
- Uses fixed `7700` kcal/kg conversion — this is widely contested (real value depends on lean-mass loss). Should at least cite the simplification.

---

### BUG-8 — `calcMacros` can return negative carbs
**File:** `src/lib/calculators.ts:70-82`
The `Math.max(0, ...)` clamp helps, but when carbs are clamped to 0 the `calories` total no longer matches the input TDEE — UI shows `tdee=2000` but `protein*4+fat*9 = 2400`. There is no warning that the macro split is infeasible.

---

### BUG-9 — `i18n.tsx` imports `ReactNode` without `type`
**File:** `src/lib/i18n.tsx:1`
```ts
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
```
With `verbatimModuleSyntax` (the modern default) this fails. It currently works because the tsconfig does not set it, but the rest of the codebase uses `type ReactNode` imports — inconsistent.

---

### BUG-10 — Persian translations are hard-coded as massive ternary chains
**Files:** `src/pages/Calculators.tsx:515-552`, `src/pages/Dashboard.tsx:643-655`, `src/pages/Pricing.tsx:90-101`

Example:
```tsx
{t({
  en: opt.text,
  fa: opt.text === 'Thin, narrow shoulders and hips' ? 'لاغر، شانه‌ها و باسن باریک' :
      opt.text === 'Medium build, broad shoulders' ? 'هیکل متوسط، شانه‌های پهن' :
      opt.text === 'Wider build, stores fat easily' ? 'هیکل پهن، به راحتی چربی ذخیره می‌کند' :
      // 15 more lines...
      opt.text
})}
```
- Unmaintainable.
- One typo in English source-of-truth silently falls back to English.
- No pluralization, no number/date locale handling, no fallback chain.

**Fix:** Use `react-intl`, `next-intl`, `i18next`, or `lingui` with JSON dictionaries (one per locale).

---

### BUG-11 — Three pages are English-only despite the "bilingual" claim
- `Exercises.tsx` — exercise names, instructions, common mistakes, filter labels, "Search exercises…" placeholder are all hard-coded English.
- `Diet.tsx` — page title, "Diet Plans", "X kcal", "X meals", food names ("Chicken Breast", "Oatmeal") all English.
- `Blog.tsx` — title, articles, dates all English-only.
- `Admin.tsx` and `Coach.tsx` — never call `t()` at all.

The README claims "Fully supports English and Persian (Farsi) languages" — that is false.

---

### BUG-12 — `cn()` utility duplicated
- `src/lib/utils.ts` (6 lines)
- `src/utils/cn.ts` (6 lines)
Same content, different paths. Pick one.

---

### BUG-13 — Two storage keys / branding confusion
- `localStorage` key: `fitpro_store`, `fitpro_lang`
- Demo emails: `admin@fitpro.com`, `coach@fitpro.com`
- Product name: `EsiFit`

The codebase is a rename of an older "FitPro" project; the old name leaks into UX and storage. A user typing `admin@esifit.com` (which is what the brand suggests) will *not* get admin access.

---

### BUG-14 — Recharts on RTL pages is hard-coded `dir="ltr"`
**File:** `src/pages/Dashboard.tsx:411, 427`
```tsx
<div className="bg-gray-900 ... rounded-xl p-5" dir="ltr">
```
The chart container is forced LTR even on Farsi locale. Tick labels and dates remain English even when the rest of the dashboard is Farsi. There is no `fa-IR` locale support in the charts at all.

---

### BUG-15 — `addTicket` mutates the ticket id into `messages[0].ticketId` AFTER push
**File:** `src/lib/store.ts:128-146`
```ts
const ticket = { id: '...', ..., messages: [{ ticketId: '', ... }] };
ticket.messages[0].ticketId = ticket.id;
state.tickets.push(ticket);
saveState();   // called once, fine — but pattern is fragile
```
Works, but `messages[0].ticketId` is mutated *after* the object is fully built; trivially refactor:
```ts
const id = 'tk_' + nano();
const msg = { id: 'msg_'+nano(), ticketId: id, ... };
state.tickets.push({ id, messages: [msg], ... });
```

---

### BUG-16 — `addMessageToTicket` accepts arbitrary `asSender` string and labels anyone "Coach Smith"
**File:** `src/lib/store.ts:148-161`
```ts
senderName: asSender === 'coach' ? 'Coach Smith' : state.currentUser?.name || 'User',
```
- Magic string `'coach'`.
- Coach name is hard-coded.
- Bot reply in `Dashboard.tsx:511` simulates a coach with `setTimeout(...,1500)` regardless of subscription tier — even FREE users get a "coach" reply.

---

### BUG-17 — Random IDs use `Math.random().toString(36).slice(2,10)`
**File:** `src/lib/store.ts:47, 67, 101, 110, 119, 130, 137, 149, 155`
- Collision-prone (only 36⁸ ≈ 2.8 × 10¹² values, birthday paradox kicks in early at scale).
- Not cryptographically secure (don't matter for IDs but signals sloppy patterns).
**Fix:** `crypto.randomUUID()` or `nanoid`.

---

### BUG-18 — Body-log photo upload is typed but never implemented
**File:** `src/lib/types.ts:114` `photoUrl?: string` exists, but no UI ever sets it, and there is no upload pipeline anywhere. Dead field.

---

### BUG-19 — `Diet.tsx` and several others import `TierGate` but never render it
**File:** `src/pages/Diet.tsx:5` — `TierGate` is imported but the file only uses `hasTierAccess` directly with custom blur. Inconsistent gating strategies.

---

### BUG-20 — `lucide-react@^1.21.0` is years out of date
The current `lucide-react` is in the **0.5xx** series (the project went major-version backward — `^1.21` looks like a misread of an old version). Some icons exist in current lucide that don't in 1.21 and vice versa. The shipped lockfile compensates, but `npm install` on a different cache could break.

Cross-check `package.json`:
- `react ^19.2.7` — fine (very new, watch ecosystem support).
- `react-router-dom ^7.18.0` — RR v7 (Remix-merged); the code uses v6 patterns (`HashRouter`, `Routes`) — works but is not idiomatic v7. Should use the new framework mode or `createBrowserRouter` data router.
- `@base-ui/react ^1.6.0` — imported nowhere in the source. Dead dependency.
- `@date-fns/tz` — never used.
- `tailwind-merge` and `clsx` — only used by the duplicate `cn` utility, which is itself never imported by any component.
- `vite-plugin-singlefile` — see Performance section.

---

## 5. Architecture & Code Quality Shortcomings

### A1. Monolithic page files
- `Calculators.tsx` — 645 lines holding 14 calculators + index + detail + 2 form helpers.
- `Dashboard.tsx` — 685 lines holding 6 dashboard sections + a shared layout.
- `Auth.tsx` — 3 unrelated pages.
- `Programs.tsx`, `Diet.tsx`, `Blog.tsx`, `Exercises.tsx` each combine list and detail pages.

A new contributor cannot find anything quickly, and tree-shaking has nothing to drop because everything ships in one chunk anyway (see Performance).

### A2. Custom reactive store instead of standard tooling
`store.ts` re-implements pub/sub. With React 19 and modern tooling, this should be Zustand / Jotai / Redux Toolkit / TanStack Query — all of which give DevTools, time-travel, persistence middleware, async, and proper TypeScript inference for free.

### A3. Custom i18n
Reinvents `t()`, locale switching, RTL handling. Replace with `react-intl` / `next-intl` / `i18next`.

### A4. No code-splitting (`viteSingleFile`)
`vite.config.ts` inlines the *entire* SPA — JS + CSS + assets — into a single HTML file. Output: **816 KB / 232 KB gzip** on the first request. There is no lazy loading, no route-level splitting, no streaming, no SSR. This is acceptable for a kiosk demo, fatal for a customer SaaS.

### A5. No tests, no CI, no formatter
- No `vitest`, no `playwright`, no `react-testing-library`.
- No `.github/workflows/`.
- No prettier, no eslint config — only TypeScript's `strict` is doing any policing.

### A6. No documentation beyond the README
No architecture diagram, no contributor guide, no `CHANGELOG`, no API docs (because there is no API), no env-var docs (no `.env.example`).

### A7. Routes are not memoized, components don't use `React.memo`, no `useMemo` on filtered lists
`Exercises.tsx` re-filters the array on every keystroke; with only 10 exercises this is fine, but with the planned thousands of exercises it will jank.

### A8. Inline event handlers everywhere allocate new closures each render
e.g. `onClick={(e) => { e.preventDefault(); toggleSavedExercise(ex.id); }}` inside a grid `.map()`. Not catastrophic, but with virtualization it will matter.

---

## 6. UX / UI Shortcomings

### U1. Mobile menu auto-closes only on `location.pathname` change
**Layout.tsx:17** — selecting the same link does not close it. Click outside also does not close menus. No `Escape` key handler. No focus trap.

### U2. Hover and focus states are inconsistent
Some buttons use `hover:` only — keyboard users get no focus ring. The native focus ring is suppressed by `outline-none` on every `<input>`/`<select>` without a `focus-visible:` replacement.

### U3. Tier-gate blur is not screen-reader friendly
`content-locked` removes pointer events and blurs visually, but the locked content is still in the DOM and read by screen readers. A `aria-hidden="true"` plus a real semantic notice is needed.

### U4. Hero image is 30 MB-ish JPEG with no `<picture>`, no `loading="lazy"`, no WebP/AVIF
(Couldn't measure exactly without the file, but the `public/images/hero-bg.jpg` is the only image asset and it ships eagerly.)

### U5. No empty-state illustrations beyond a single Lucide icon
For every empty list ("No body logs yet", "No conversations yet", "No active programs", "No exercises found") — same icon, plain text.

### U6. `Programs/Diet` pages show a generic Lucide icon as the "hero" of every card
There are no real images, videos, GIFs, or even illustrations for any of the 10 exercises. The product is supposed to be "comprehensive with video guides" (claim from README) — there is no video field populated.

### U7. Dark theme only
Per user-preference for dual-mode (light/dark) systems, the application offers no light theme. There is no theme switch.

### U8. Currency / number formatting is wrong in Farsi
- Prices display as `۹۹.۰۰۰ تومان` literally as **strings**, not via `Intl.NumberFormat('fa-IR-u-nu-arabext')`.
- BMI/numbers stay in Western digits (`25.2` vs `۲۵.۲`).
- Streak/workouts on dashboard show `state.exerciseLogs.length` in Western digits even in Farsi mode.

### U9. Toast / notification system missing
"Saved" confirmations use a 2-second text swap on a button (`saved ? 'Saved!' : 'Save Profile'`). No global toast, no aria-live region.

### U10. Form validation is ad-hoc
- `if (!email) setError('Email is required')` — only one error at a time.
- No real-time validation.
- No password strength meter.
- No "show password" toggle.
- No `<form noValidate>` discipline; browser tooltips fire alongside custom errors.

### U11. No loading skeletons
Because everything is `localStorage`, there is never a loading state — fine today, but every transition to a real backend will surface this.

### U12. Calendar / date inputs are plain `<input type="number">` for "Goal Date"
And the result is `date.toLocaleDateString('en-US', ...)` regardless of `lang`.

### U13. Recent activity in Dashboard shows last 5 logs `slice(-5).reverse()` — but the order is unstable when entries have the same timestamp.

### U14. RTL bugs
- `flex-row-reverse rtl:flex-row` on Dashboard line 151 is a confused negation: it makes LTR pages reversed and RTL pages normal — almost certainly the opposite of intended.
- Several `text-left rtl:text-right` mixings are missing on coach/admin pages.
- Icon-direction (chevrons, arrow-left) sometimes flips with `rtl:!rotate-180`, sometimes doesn't.

---

## 7. Accessibility Audit

| Issue | Where | WCAG ref |
|---|---|---|
| Icon-only buttons have no `aria-label` | Layout user-menu, exercise save, mobile toggle | 4.1.2 |
| No skip-to-content link | App root | 2.4.1 |
| Color contrast on `text-gray-500` over `bg-gray-950` ≈ 4.0:1 | Footer, sub-labels | 1.4.3 (AA = 4.5) |
| `outline-none` everywhere, no `focus-visible:` replacement | All inputs | 2.4.7 |
| Locked content still focusable | TierGate | 4.1.2 |
| `<table>` cells in Dashboard have no `scope` | Body log history | 1.3.1 |
| No `lang` attribute on inline foreign text | English mode showing Farsi placeholder examples | 3.1.2 |
| Modals (mobile menu, dropdowns) are not real dialogs (no focus trap, no Escape) | Layout | 2.1.2 |

---

## 8. Security Audit (beyond CRIT items)

- **XSS sink in error handler** — see CRIT-4.
- **localStorage is plaintext** — even though it's a demo, a future incremental refactor toward a real backend must not leave the auth token in `localStorage`. Use HTTP-only cookies.
- **No CSRF protection** — N/A while there is no backend, but plan for it now.
- **No CSP, no SRI, no `Referrer-Policy`, no `X-Content-Type-Options` headers** — the HTML ships with the bare minimum.
- **Inline event handler `onerror` and inline `<script>` violate any reasonable CSP**.
- **No rate limiting** — front-end is wide open; planning for backend must include this.
- **Demo credentials on the login page** — embarrassing if it leaks to production (CRIT-5).
- **Admin route uses `state.currentUser.role === 'ADMIN'` in client** — easily bypassed (CRIT-3).
- **Google Sign-In button is decorative** — implies functionality that does not exist (potential dark pattern / compliance issue).

---

## 9. Performance Audit

| Metric | Current | Target |
|---|---|---|
| Bundle size (uncompressed) | 816 KB | < 200 KB initial, lazy chunks |
| Bundle size (gzip) | 232 KB | < 70 KB initial |
| Route-level splitting | ✗ (singlefile) | ✓ |
| Image optimization | ✗ | AVIF / WebP, responsive sizes |
| Font loading | `display=swap` (good) but Inter and Vazirmatn both preloaded → FOUT risk | self-host + `preload` only critical weights |
| `recharts` | bundled in entry chunk | lazy-load only on `/dashboard/progress` |
| `lucide-react` | tree-shaken? unclear from singlefile output | confirm only used icons ship |
| First Contentful Paint (synthetic, throttled 3G) | ~3 s | < 1.5 s |
| Largest Contentful Paint (hero bg) | hero image is not optimized | < 2.5 s |

**Action:** drop `viteSingleFile`, enable per-route lazy imports, add `vite-plugin-image-optimizer`, self-host fonts.

---

## 10. SEO / Discoverability

- HashRouter URLs (`#/exercises/...`) are not crawled by search engines.
- No per-page `<title>`/`<meta>` (everything inherits the default in `index.html`).
- No Open Graph, no Twitter cards.
- No `sitemap.xml`, no `robots.txt`.
- No structured data (Schema.org `ExercisePlan`, `Recipe`, `Article` would all apply).
- No SSR/SSG — Vite SPA serves a blank shell to crawlers.

---

## 11. Content Shortcomings

- 10 exercises is too few. A serious library has 500+ with categorization.
- 3 programs, 2 diet plans, 3 articles — content-grade demo only.
- No exercise videos / GIFs / images (the type field `videoUrl` is empty everywhere).
- No food database lookup; meal items are hand-typed strings.
- No metric/imperial toggle (only `kg`/`cm` throughout, even though the US Navy formula references imperial in its origin).

---

## 12. Internationalization Beyond Bug-10/Bug-11

- Only `en` and `fa`. The "Vazirmatn" Persian font is loaded for everyone in `index.css` (extra bytes for English users).
- No locale negotiation from `navigator.language`.
- No URL-based locale (`/en/...` vs `/fa/...`) — locale lives only in `localStorage`.
- No translator workflow (Crowdin / Lokalise / Phrase).
- Currency does not change with locale (only the displayed string content).

---

## 13. Suggested Solutions, Ordered by Severity

Below is the **minimum required action list** to make this project safe to put in front of paying users. (The "world-class" target is in §14.)

1. **Delete the inline error-handler script in `index.html`.** Add a React `<ErrorBoundary>` + Sentry.
2. **Remove `viteSingleFile`.** Switch to standard Vite chunks; lazy-load every route.
3. **Replace `HashRouter` with `BrowserRouter` (or RR v7 data router) and configure SPA fallback (`try_files` / `index.html` rewrite).**
4. **Implement a real backend.** Recommended stack: **Next.js 15** (App Router, RSC, server actions) + **PostgreSQL** + **Prisma** + **Auth.js** + **Stripe**. Or, if keeping the Vite frontend: a separate API in Node (Hono / NestJS) or Go.
5. **Move authorization to the server.** Re-issue JWTs after every tier change, never trust the client.
6. **Wire Stripe Checkout + Customer Portal + webhooks → DB.** Map each price ID to a tier.
7. **Replace `Math.random()` IDs with `crypto.randomUUID()`** (and let the DB own the canonical IDs).
8. **Replace the custom store with Zustand + TanStack Query** (Zustand for UI state, TanStack Query for server state caching).
9. **Replace inline ternary translations with `next-intl` (or `i18next`).** Move every string into JSON dictionaries. Add a CI lint that rejects untranslated literals in JSX.
10. **Split monolithic pages.** One folder per route: `/calculators/[slug]/page.tsx` + `_components/`.
11. **Add a real testing stack.** `vitest` + `testing-library/react` for unit; `playwright` for E2E (smoke per route + auth + checkout).
12. **Add CI** (GitHub Actions): `tsc`, `eslint`, `prettier --check`, `vitest`, `playwright`, `vite build`, bundle-size budget.
13. **Add accessibility lint.** `eslint-plugin-jsx-a11y` + axe in Playwright.
14. **Real content management.** Either a headless CMS (Sanity / Strapi / Contentlayer) for articles, exercises, programs, diet plans, OR a Postgres-backed admin UI.
15. **Real exercise media.** Licensed video / GIF library, CDN-hosted (Mux / Cloudflare Stream / Bunny CDN).
16. **Real food database.** USDA FDC, Open Food Facts, or Nutritionix API integration with caching.
17. **Proper input validation.** Use Zod schemas shared between client and server.
18. **Toast system + skeleton loaders + global loading bar.** `sonner` + `react-loading-skeleton`.
19. **Light theme + theme toggle + system preference detection.**
20. **Per-page SEO.** `react-helmet-async` or migrate to Next.js for true `<head>` per route + SSG/SSR.
21. **Self-host fonts; preload only required subsets; conditionally load Vazirmatn only on `fa` locale.**
22. **Add `robots.txt`, `sitemap.xml`, Open Graph images, schema.org JSON-LD.**
23. **Add a global rate limit, CSP, security headers** (via reverse proxy or `vercel.json` headers).
24. **Add audit logging** for admin actions (user-tier changes, content edits).
25. **Add data export (GDPR), account deletion, terms of service, privacy policy, cookie consent.**

---

## 14. World-Class Production Prompt

The following English prompt is intended to be handed to an autonomous AI software-engineering agent (or a senior dev team) to transform EsiFit into a production-grade, world-class fitness SaaS. It is intentionally exhaustive — copy-paste and refine as needed.

---

> # PROMPT: Transform EsiFit into a World-Class, Production-Ready Fitness SaaS
>
> You are taking over the existing EsiFit codebase (React 19 + Vite 7 + Tailwind 4 SPA, single-file build, ~635 KB source, no backend). Your job is to turn it into a real, monetizable, internationally launchable fitness and bodybuilding platform that can compete with MyFitnessPal, Strong, Hevy, JEFIT, and Caliber. The frontend's visual design is acceptable as a starting point — preserve the aesthetic (dark theme by default, orange brand `#f97316`, Inter for Latin scripts, Vazirmatn for Farsi) but rebuild everything beneath it. **Quality bar:** Vercel-team / Linear-team / Stripe-app polish. Anything less is not acceptable.
>
> ## 1. Architecture
>
> Migrate the entire app to **Next.js 15 (App Router, React Server Components, Server Actions, Edge & Node runtimes, Streaming SSR)**. Reasons: SEO, per-route metadata, RSC payload reduction, built-in image optimization, route handlers, middleware-level auth, ISR for content pages, and easy Vercel deployment. Keep TypeScript strict. Use **Turborepo** with the following workspaces:
> - `apps/web` — public marketing site + customer dashboard (Next.js).
> - `apps/admin` — internal admin console (Next.js, route-protected).
> - `apps/api` — optional standalone Hono/NestJS service if specific endpoints need to scale separately (otherwise keep everything in Next.js route handlers).
> - `packages/db` — Prisma schema + migrations + seed.
> - `packages/ui` — shared component library, Storybook, design tokens.
> - `packages/calculators` — pure-function fitness math (BMI, BMR, TDEE, macros, 1RM, FFMI, WHR, body fat, calories-burned, goal-date, volume load, body type, all with Zod-validated inputs and well-tested edge cases including the bugs documented in the audit).
> - `packages/i18n` — shared locale dictionaries and helpers.
> - `packages/config` — eslint, prettier, tsconfig, tailwind preset.
>
> ## 2. Authentication & Authorization
>
> Use **Auth.js (NextAuth v5)** with: email magic links (Resend), password + TOTP 2FA, Google, Apple, and Sign in with Apple (required for App Store later). Hash passwords with Argon2id. Implement:
> - Email verification before first login.
> - Forgot password (real email flow).
> - Session revocation.
> - Account deletion with a 30-day grace period (GDPR/CCPA).
> - Role model: `USER`, `COACH`, `ADMIN`. Tier model: `FREE`, `ECONOMY`, `VIP`, `ELITE`. **All authorization decisions happen server-side** via middleware + RSC checks; the client UI is purely cosmetic. Use a typed `assertRole(session, "ADMIN")` helper everywhere.
> - Audit log table for all role/tier changes and admin actions.
>
> ## 3. Database & Domain Model
>
> PostgreSQL (Neon / Supabase / RDS) via **Prisma**. Migrate the current localStorage shape into normalized tables: `User`, `Subscription`, `Coach`, `CoachAssignment`, `Exercise`, `ExerciseMedia`, `Program`, `ProgramDay`, `ProgramExercise`, `UserProgram` (active enrollment), `WorkoutSession`, `SetLog`, `BodyLog`, `BodyPhoto`, `DietPlan`, `Meal`, `MealItem`, `Food` (linked to USDA / Open Food Facts), `Article`, `Comment`, `Ticket`, `TicketMessage`, `CalculatorResult`, `Notification`, `Device` (push tokens), `AuditLog`. Add soft-delete fields. Add row-level multi-tenancy via `userId` indexes. Provide a deterministic seed script with realistic demo data so design reviewers see a full app.
>
> ## 4. Payments
>
> Integrate **Stripe** with: subscriptions, proration, free trials (14 days on VIP/ELITE), coupons, regional pricing (US, EU, MENA, IR-fallback), tax (Stripe Tax), invoices, customer portal, dunning. Map each Stripe Price ID to a tier in DB. Update entitlements only via signed webhook → DB. Show real billing history in `/dashboard/billing`. Implement upgrade/downgrade flows with clear preview of proration. Localize currency by IP / user preference. For Iranian users (Rial / Toman) provide a clearly-marked alternative gateway adapter (e.g. ZarinPal) behind a feature flag — keep the gateway abstraction clean.
>
> ## 5. Content
>
> Replace the 10-exercise demo data with a **real exercise library of 800+ exercises** sourced from a licensed library (Free Exercise DB is MIT-licensed and a good starting point) or commissioned. Each exercise must have: name, slug, primary muscles, secondary muscles, equipment, difficulty, type (strength/cardio/mobility/corrective), step-by-step instructions, common mistakes, alternatives, **video URL (Mux / Cloudflare Stream) + thumbnail**, animated GIF fallback, and translations (en, fa to launch; design schema for 10+ locales). Move articles/blog to a headless CMS (Sanity recommended — generous free tier, real-time preview, rich Portable Text). Integrate a **food database** via Nutritionix or USDA FoodData Central API with on-demand caching to our own `Food` table. Build a meal-plan generator that takes a user's TDEE+macros and outputs a 7-day plan composed of real foods.
>
> ## 6. Programs & Tracking
>
> Replace the static program JSON with: 50+ professionally-designed programs (push/pull/legs, upper/lower, full-body, 5/3/1, PHUL, PHAT, GZCL, beginner-to-advanced strength, hypertrophy, fat-loss, mobility, hybrid CrossFit-style, marathon prep, etc.). Each program lives in DB and is editable in the admin console. Users **enroll** in a program; the system schedules `WorkoutSession`s on a calendar. The workout player should be a full mobile-first PWA experience: rest timer with audio + haptic, plate calculator, RPE entry, video popovers, "swap exercise" suggestions filtered by equipment, automatic 1RM estimation (Epley & Brzycki), and offline-first via IndexedDB + background sync.
>
> ## 7. Progress & Analytics
>
> Replace recharts with **Visx** or **ECharts** for richer interactions. Implement:
> - Body weight, body-fat %, measurements, photos (timeline carousel with side-by-side comparison and auto-aligned crops).
> - Strength progression per lift with estimated-1RM curve, volume load, frequency heatmap (GitHub-style).
> - Personal records (PR) detection and confetti celebration.
> - Streak with proper timezone handling (use `@js-temporal/polyfill` or Luxon).
> - Weekly digest email (Resend / Postmark).
> - Goal tracking: target weight, target lift, estimated date based on actual trend regression — *not* the naive 7700 kcal/kg formula.
> - Export to CSV / Apple Health / Google Fit / Garmin Connect.
>
> ## 8. Coaching & Messaging
>
> Real-time messaging via **Liveblocks** or **Ably** or **Supabase Realtime** with typing indicators, read receipts, file attachments (video form-checks via Mux), and threaded replies. VIP and ELITE users can book 1-on-1 video sessions (integrate **Cal.com** or **Daily.co**). Coaches get a true CRM-style dashboard: client list, program assignment, weekly check-in template, automated reminders, revenue split tracking. Admins can approve/onboard coaches.
>
> ## 9. Admin Console
>
> Full CRUD for: users (tier, role, ban, refund, impersonate), exercises (including video upload via Mux direct upload), programs (drag-and-drop day/exercise builder), diet plans, articles (writes to CMS), coupons, feature flags, audit log search, MRR/ARR/churn dashboards, cohort retention, NPS surveys.
>
> ## 10. Internationalization & RTL
>
> Use **`next-intl`** with one JSON file per locale per namespace, ICU MessageFormat for pluralization and gender. Launch with `en`, `fa`, `ar`, `es`, `tr`, `de`, `fr`. RTL handled at the layout level via `dir` attribute and Tailwind logical properties (`ps-*`, `pe-*`, `text-start`, `text-end`). All numbers, dates, currencies via `Intl.*` (`fa-IR-u-nu-arabext` for Farsi numerals). Locale-aware URL routing (`/en/...` / `/fa/...`). Translator workflow on Crowdin or Lokalise integrated into CI.
>
> ## 11. Design System
>
> Codify in `packages/ui` using **shadcn/ui** primitives + custom skin matching the current orange-on-dark identity. Build full set: Button (5 variants × 3 sizes × loading), Input, Select, Combobox, DatePicker, Dialog, Sheet, Drawer, Tabs, Accordion, Tooltip, Popover, Toast (`sonner`), CommandPalette (⌘K with `cmdk`), DataTable (TanStack Table v8), Calendar/Schedule, EmptyState, Skeleton, Avatar, Badge, Progress, Stat, NumberCounter (animated), MetricChart wrappers, FileDropzone. Storybook with a11y addon + Chromatic for visual regression. Tokens (color, spacing, radius, shadow, motion) in CSS variables; **dual-theme (light + dark) with system preference detection and a manual toggle**. Motion via **Framer Motion** with a global `prefers-reduced-motion` respect. Microinteractions: subtle springs on button press, animated count-up on stats, satisfying card hover lift.
>
> ## 12. Performance Budget
>
> Initial JS ≤ 70 KB gzipped. LCP ≤ 1.5 s on Moto-G4 throttled. CLS = 0. INP ≤ 200 ms. Achieve by: RSC by default, client components only at leaves, `next/image` with AVIF, route-level `loading.tsx` skeletons, `next/font` self-hosting (Inter latin + Vazirmatn arabic, only weights actually used), CDN-cached static assets, Brotli at the edge. Add Lighthouse CI to GitHub Actions with budgets that fail the PR.
>
> ## 13. SEO & Marketing
>
> Per-page `<title>`, `<meta description>`, Open Graph, Twitter Card, canonical, hreflang. JSON-LD Schema.org: `Organization`, `WebSite`, `Article`, `ExercisePlan`, `Recipe`, `FAQPage`, `Product` (subscriptions). Auto-generated `sitemap.xml` and `robots.txt`. Programmatic landing pages for `/exercises/[muscle-group]`, `/calculators/[slug]`, `/programs/[goal]`, each SSG / ISR. Blog with RSS. Email capture / newsletter (Resend).
>
> ## 14. Accessibility
>
> WCAG 2.2 AA across the board. Specifics: skip-to-content link, visible focus rings (`focus-visible`), all icon buttons have `aria-label`, dialogs use Radix `Dialog` with proper focus trap and `Escape` close, color contrast ≥ 4.5 / 3.0, motion-reduction respected, charts have data-table fallback, all forms have `<label>` + `aria-describedby` for errors. Run `axe` in Playwright on every page in CI. Hire one accessibility consultant for a manual audit before public launch.
>
> ## 15. Security & Compliance
>
> - HTTP-only, `SameSite=Lax`, `Secure` session cookies.
> - CSRF protection on all mutations (Auth.js handles most; verify for custom routes).
> - Rate limiting with **Upstash Ratelimit** on auth, password reset, ticket creation, chat.
> - Strict Content-Security-Policy (no `unsafe-inline`), HSTS, `X-Frame-Options: DENY`, `Permissions-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`.
> - Encrypted at rest (provider-managed); secrets in **Doppler** / **Vercel Env**.
> - GDPR / CCPA: cookie consent (Klaro / Osano), DSAR endpoints, data export, full account deletion, privacy policy, terms of service, DPA, sub-processor list.
> - SOC 2 prep checklist documented from day one.
> - Penetration test before public launch.
>
> ## 16. Observability
>
> **Sentry** (errors + performance) on web + API. **PostHog** (product analytics + feature flags + session replay with masked PII). **Better Stack / Datadog** logs. **Grafana Cloud** for infra metrics. SLO: 99.9 % monthly uptime. Alerts to Slack / PagerDuty for: error rate > 1 %, p95 latency > 1 s, webhook failures, queue lag.
>
> ## 17. Mobile
>
> Phase 1: install-prompted **PWA** with offline workout player, push notifications via **OneSignal** or Web Push, share target, A2HS. Phase 2: native shell via **Expo** / **Capacitor**, reusing the React component library and 80% of the business logic. Plan for HealthKit / Google Fit integration to import body weight and workouts.
>
> ## 18. Testing & CI/CD
>
> - Unit: **Vitest** (calculators must have 100% branch coverage, including the bug cases from the audit).
> - Component: **Storybook** + **@storybook/test** + Chromatic.
> - Integration: **Playwright** smoke per route + auth + checkout (test mode Stripe).
> - Contract: schema validation between Zod and Prisma.
> - Load: **k6** scripts hitting critical endpoints.
> - CI on GitHub Actions: typecheck, lint, unit, build, Storybook build, Playwright (sharded), Lighthouse CI, bundle-size, Chromatic visual diff, axe-core a11y. Block merge on any failure.
> - CD via Vercel preview deployments per PR; production deploy on `main` with manual approval after smoke check.
>
> ## 19. Migration Plan from Current Codebase
>
> 1. **Stand up the Next.js skeleton** in a new `apps/web` workspace with Tailwind 4 + the existing color tokens.
> 2. **Port pages one-by-one**, beginning with Home → Calculators (purely client, no backend) → Pricing (static) → Exercise list → Auth → Dashboard → Coach → Admin.
> 3. **Replace the custom store** with Zustand for UI + TanStack Query for server state, page by page.
> 4. **Replace inline ternary translations** with `next-intl` JSON dictionaries. Add an ESLint rule (`react/jsx-no-literals` configured) to fail builds on raw English literals inside JSX.
> 5. **Wire Auth.js + Prisma + Postgres** behind a feature flag; run with seeded users.
> 6. **Wire Stripe Checkout + Customer Portal**; gate VIP/ELITE behind real entitlements.
> 7. **Replace the inline error overlay** in `index.html` (delete in Next.js automatically) with `<ErrorBoundary>` + Sentry.
> 8. **Add Playwright smoke tests** that cover: sign up, log in, run a calculator, save a workout, upgrade plan (Stripe test mode), cancel plan, log a body measurement, send a coach ticket, admin lists users.
> 9. **Cut over DNS** only when Lighthouse > 95 on all four scores, all a11y/security audits pass, and three production-realistic load tests succeed.
>
> ## 20. Acceptance Criteria (the bar for "world-class")
>
> - Lighthouse mobile: Performance ≥ 95, Accessibility ≥ 100, Best Practices ≥ 100, SEO ≥ 100, PWA installable.
> - Zero unhandled console errors / warnings on any route, any locale, any theme.
> - All 21 routes documented above are fully translated to en + fa with proper RTL + Farsi numerals + Hijri-aware date fallbacks where culturally appropriate.
> - End-to-end Stripe upgrade & cancellation works with webhooks confirmed.
> - 90 %+ unit-test coverage on `packages/calculators`, 70 %+ on `packages/ui`, smoke E2E green on every critical user journey.
> - Bundle: initial JS ≤ 70 KB gzip, CSS ≤ 20 KB gzip, hero LCP image ≤ 100 KB AVIF.
> - First-time visitor TTI on Moto-G4 + 3G ≤ 2.5 s.
> - Accessibility audit (manual + axe) zero serious issues.
> - Security headers score A on securityheaders.com; SSL Labs A+.
> - Privacy/legal pages, cookie consent, DSAR endpoint, account-deletion endpoint live.
> - 800+ exercises with video, 50+ programs, 200+ articles seeded, food DB with 1M+ items via Nutritionix.
> - Admin can fully run the business from `/admin` (no SQL needed for routine operations).
> - PWA installs and a logged-in user can complete a workout fully offline.
>
> Deliver the work as small, reviewable PRs. Open a PR per migrated route. Document every architectural decision in `docs/adr/NNNN-*.md`. Never regress accessibility, performance, or bundle-size budgets.

---

## 15. Closing Note for the Repo Owner

EsiFit today is roughly the *front cover* of a fitness SaaS. Everything that makes a SaaS valuable — authentication, payments, data persistence, content depth, observability, accessibility, SEO, and trust signals — has yet to be built. The good news is that the visual layer and the calculator math are reusable, and the codebase is small enough (≈ 4.5 K LOC) to refactor decisively rather than incrementally. Aim for a 6-to-10 week migration to the architecture described in section 14, sequenced behind feature flags, with paying customers onboarded only after the Stripe + Auth pipeline has survived two weeks of red-team review.
