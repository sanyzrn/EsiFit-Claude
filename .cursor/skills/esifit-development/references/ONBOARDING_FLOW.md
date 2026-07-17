# EsiFit — ONBOARDING_FLOW.md

**Paste this alongside `PROJECT_RULES.md` and `DESIGN_BIBLE.md` when running Phase 2.** The original Phase 2 prompt builds signup and the dashboard shell, but never defines *what happens between them* — where does the "profile" that Phase 5's AI insights reference (age, goal, experience level, equipment access) actually come from? Without this, Phase 2 ships a dashboard with no real personalization input, and Phase 5 ends up inventing fake profile fields to reference.

## Why this is its own step, not just part of signup

Signup (email/password/social) is an *identity* step. Onboarding is a *personalization* step. Conflating them produces either a bloated signup form (bad conversion) or a dashboard with nothing to personalize against (bad first impression). They should be sequential and visually distinct: signup ends in a "your account is ready" moment, onboarding begins immediately after as its own guided flow, and only then does the user land on the real dashboard.

## Scope (build this in Phase 2, right after the signup flow)

A short, skippable, multi-step wizard (4–6 steps max — this is a conversion-sensitive moment, don't over-ask):

1. **Primary goal** — single-select: Lose weight / Build muscle / Improve endurance / General health / Athletic performance. Drives default dashboard widget emphasis and the tone of AI insights (Phase 5) later.
2. **Experience level** — Beginner / Intermediate / Advanced. Drives default exercise library filtering and workout builder suggestions (Phase 3).
3. **Equipment access** — multi-select: Full gym / Home gym (basic) / Bodyweight only / Specific equipment tags. Drives exercise library filtering (Phase 3).
4. **Basic biometrics** — age, sex (for BMR/TDEE formulas), height, current weight, target weight (optional). This is the same data the calculators (Phase 3) ask for — capture it once here and pre-fill calculators for signed-in members instead of asking again, per the "never repeat logic/data-entry" spirit of `PROJECT_RULES.md`.
5. **Notification preference** — a single "how often do you want reminders" choice (Off / Gentle / Frequent) as a sane default, refined later in Phase 4's full notification settings page.
6. **Optional: connect a wearable / import data** — can be a "coming soon" placeholder card in earlier phases; don't build a real integration this early, just reserve the UI slot.

## Rules

- **Every step is skippable** ("Skip for now" always visible) — onboarding must never be a hard gate blocking dashboard access. A user who skips gets a dashboard with sensible defaults (goal: "General health," experience: "Beginner") and a persistent, low-pressure "complete your profile" nudge card in the dashboard (per the no-shame tone rule in `DESIGN_BIBLE.md` — never a nagging modal).
- **Progress is visually shown** (step indicator, e.g. "Step 2 of 6") and the whole flow respects the same motion/tone rules as the rest of the product — encouraging copy, no pressure language.
- **Data captured here writes into the same mock data shapes** already defined in `DATA_MODEL.md`'s `USER` and `GOAL` entities — don't invent a parallel onboarding-specific data shape that the dashboard and calculators then have to reconcile with.
- **This is what Phase 5's AI insights should actually reference** as "the user's profile" — go back and check that Phase 5's prompt-context construction pulls from these real fields (goal, experience, biometrics) rather than a hardcoded example profile.

## Where it fits in the file map

Add a row to `00_README.md`'s phase table noting that `phase-2-auth-dashboard.md`'s scope now includes onboarding, sequenced as: Signup → Onboarding wizard → Dashboard (first load, personalized-or-default depending on completion).

## Definition of Done — addition

- [ ] Onboarding flow is fully skippable at every step with sensible fallback defaults
- [ ] Biometric data collected in onboarding pre-fills the relevant calculators for signed-in members (no duplicate re-entry)
- [ ] Dashboard's "complete your profile" nudge (for skipped/partial onboarding) matches the no-shame tone rule — reviewed against `DESIGN_BIBLE.md` section 0
- [ ] Onboarding-collected fields map directly onto `DATA_MODEL.md`'s `USER`/`GOAL` entities, no parallel shape invented
