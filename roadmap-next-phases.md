# EsiFit — Roadmap: Phases 6+ (Not yet executable prompts)

Phase 5 (AI Assistant) is now a fully written, executable prompt — see `phase-5-ai-assistant.md`. Once Phases 1–5 are done and reviewed, the phases below bring in the real backend and business layer. These are **outlined here for planning only** — write the full detailed prompt for each one once you're ready to start it, using the same pattern as Phases 1–5 (context recap + handoff from previous phase + explicit scope + explicit "what not to do" + deliverable).

## Phase 6 — Real Backend

- NestJS (modular monolith, feature-based folders, clean architecture, repository pattern)
- PostgreSQL + Prisma ORM (schema derived from the mock data shapes used in Phases 2–4)
- Redis + BullMQ for background jobs (reminders, streak calculations, leaderboard recomputation)
- JWT auth (replacing the Phase 2 mock auth store) + real 2FA
- Swagger for API docs
- S3-compatible object storage for photos/videos
- Swap TanStack Query mock functions for real endpoints — this should be mechanical because Phase 2 set up the abstraction correctly
- Move the Phase 5 AI provider config (keys, provider selection) into proper encrypted secrets storage, managed from the Admin Panel built in Phase 7
- Docker Compose for local dev (API + Postgres + Redis)

## Phase 7 — Business Layer

- Admin Panel (user management, content management for exercise/food library, reporting dashboards)
- Coach Portal (assign programs to clients, review client progress, messaging)
- Subscriptions & billing (real payment provider integration), coupons, CMS for landing-page content
- Super Admin role fully built out (system-level settings, role management)

## Phase 8 — Advanced Intelligence

- AI Coach (adaptive workout/nutrition recommendations based on real logged data)
- Progress analysis with natural-language insights generated from real trends
- Vision-ready architecture (e.g. form-check from video, meal-photo macro estimation) — flagged as a later sub-phase given complexity/cost

## Notes for whoever writes these prompts later

- Each backend endpoint should be scoped to exactly replace one mock function from the frontend phases — use the Phase 2–4 handoff summaries as the source of truth for required shapes, not a fresh guess.
- Non-functional requirements carry forward: accessibility, performance, security (this phase is where secure auth, rate limiting, input validation actually matter — the earlier phases were UI-only).
