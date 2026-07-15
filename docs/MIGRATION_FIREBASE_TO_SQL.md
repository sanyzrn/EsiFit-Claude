# Firebase → PostgreSQL Migration Guide

This document describes how to migrate EsiFit from Firebase Auth + Firestore to the self-hosted Express + PostgreSQL stack introduced in this change.

## Architecture overview

| Before (Firebase) | After (SQL API) |
|---|---|
| Firebase Auth (email/password, Google) | Express `/api/auth/*` with bcrypt + JWT |
| Firestore `users/{uid}` | PostgreSQL `users` table |
| Firestore subcollections / docs | Normalized SQL tables |
| Firebase custom claims | JWT payload + `users.role` / `users.subscription_tier` |
| Cloud Functions (Stripe) | Express `/api/payments/*` + `/api/webhooks/stripe` |

Seed content (exercises, programs, diets, articles) remains in `src/lib/seed/` — **no migration needed**.

## Firestore → SQL mapping

### `users/{uid}`

| Firestore field | SQL column | Notes |
|---|---|---|
| Document ID (`uid`) | `users.id` | Preserve Firebase UID as `TEXT` primary key for seamless ID continuity |
| `email` | `users.email` | Lowercased on insert |
| `name` | `users.name` | |
| *(Firebase Auth password)* | `users.password_hash` | **Cannot export** — users must reset password or re-register |
| `role` | `users.role` | `USER` / `COACH` / `ADMIN` |
| `subscriptionTier` | `users.subscription_tier` | `FREE` / `ECONOMY` / `VIP` / `ELITE` |
| `stripeCustomerId` | `users.stripe_customer_id` | |
| `savedExercises[]` | `saved_exercises` rows | One row per `(user_id, exercise_id)` |
| `age`, `gender`, `heightCm`, `weightKg`, `goal`, `activityLevel`, `injuries` | Same-named snake_case columns | |
| `createdAt` | `users.created_at` | Parse ISO string → `TIMESTAMPTZ` |
| Google-only accounts | `users.phone` + `phone_verified` | No password; prompt phone OTP or password reset |

### `bodyLogs/{id}`

| Firestore | SQL `body_logs` |
|---|---|
| `id` | `id` |
| `userId` | `user_id` |
| `date` | `date` |
| `weightKg` | `weight_kg` |
| `waistCm` | `waist_cm` |
| `neckCm` | `neck_cm` |
| `hipCm` | `hip_cm` |
| `chestCm` | `chest_cm` |
| `armCm` | `arm_cm` |
| `bodyFatPct` | `body_fat_pct` |
| `photoUrl` | `photo_url` |

### `exerciseLogs/{id}`

Maps 1:1 to `exercise_logs` (`exerciseId` → `exercise_id`, etc.).

### `calculatorResults/{id}`

| Firestore | SQL `calculator_results` |
|---|---|
| `inputJson` | `input_json` (JSONB) |
| `resultJson` | `result_json` (JSONB) |
| `createdAt` | `created_at` |

### `tickets/{id}`

| Firestore | SQL |
|---|---|
| Ticket fields | `tickets` table |
| `messages[]` (embedded array) | `ticket_messages` table (normalized) |

Each message becomes a row: `id`, `ticket_id`, `sender_id`, `sender_name`, `content`, `created_at`.

## Migration script outline

1. Export Firestore collections via `gcloud firestore export` or Admin SDK.
2. For each `users` document:
   - `INSERT INTO users (...)` preserving `id` as Firebase UID.
   - `password_hash` = NULL (force password reset email).
   - Explode `savedExercises` into `saved_exercises`.
3. For each activity collection, `INSERT` with preserved document IDs.
4. For tickets, split `messages` into `ticket_messages`.
5. Verify row counts match Firestore export counts.

Example (Node pseudocode):

```js
for (const doc of usersSnap.docs) {
  const d = doc.data();
  await pool.query(
    `INSERT INTO users (id, name, email, role, subscription_tier, stripe_customer_id, created_at, ...)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ...)`,
    [doc.id, d.name, d.email, d.role, d.subscriptionTier, d.stripeCustomerId, d.createdAt]
  );
  for (const exId of d.savedExercises ?? []) {
    await pool.query('INSERT INTO saved_exercises (user_id, exercise_id) VALUES ($1, $2)', [doc.id, exId]);
  }
}
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/esifit` |
| `JWT_SECRET` | Yes | Random 32+ byte secret (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `PORT` | No | Default `3001` |
| `APP_URL` | Yes | Frontend URL for reset links & Stripe redirects |
| `CORS_ORIGIN` | Yes | Frontend origin (e.g. `https://esifit.com`) |
| `COOKIE_SECURE` | Prod | Set `true` behind HTTPS |
| `SMTP_*` | Prod reset | SMTP for password reset emails |
| `SMS_PROVIDER` / `SMS_API_KEY` | Prod OTP | SMS gateway (Kavenegar, Ghasedak, etc.) |
| `STRIPE_*` | Optional | Secret key, webhook secret, price IDs |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL. Omit in dev (Vite proxies `/api` → `localhost:3001`) |

## Deployment

### Docker Compose (recommended for self-hosting)

```bash
cp backend/.env.example backend/.env
# Edit JWT_SECRET and optional Stripe/SMTP vars
docker compose up -d
```

Services:
- `postgres` — PostgreSQL 16 on port 5432
- `api` — Express API on port 3001 (runs migrations on boot)

### Manual

```bash
# Start PostgreSQL, then:
cd backend && npm install && npm run migrate && npm run dev

# Frontend (separate terminal):
npm install && npm run dev
```

### Production checklist

1. Use strong `JWT_SECRET` and `COOKIE_SECURE=true`.
2. Configure SMTP for password reset.
3. Configure Iranian SMS provider for phone OTP (`SMS_PROVIDER`).
4. Point Stripe webhook to `https://your-api.com/api/webhooks/stripe`.
5. Serve frontend static build behind reverse proxy; proxy `/api` to Express.
6. Run `npm run build` in both frontend and backend.

## Auth behavior changes

- **Google Sign-In removed** — unreliable in Iran. Use email/password or phone OTP.
- **Role/tier enforcement is server-side** — JWT carries claims; API re-validates from DB on `/auth/me`. Client `localStorage` never stores trusted role/tier.
- **Password reset** — server generates token, emails link to `/reset-password?token=...`.
- **Phone OTP** — `POST /api/auth/phone/request-otp` then `verify-otp`; creates account if phone is new.

## Rollback

Keep Firebase project read-only until migration is verified. To rollback, redeploy previous frontend build and re-enable Firebase env config.
