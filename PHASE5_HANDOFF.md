# EsiFit — Phase 5 Handoff

## Summary

Member-only AI layer via Next.js route handlers. Four provider adapters (Anthropic, Gemini, OpenRouter, Custom/OpenAI-compatible) plus automatic `mock` when no key is configured. Shared `generateAIResponse` enforces daily quotas, structured token logging, and deterministic fallbacks on failure.

## Adapter interface

```ts
generateAIResponse({ userId, tier, request: { prompt, context, touchpoint } })
  → { text, provider, model, promptTokens, completionTokens, degraded, fallbackReason?, quota? }

AIAdapter {
  id: "anthropic" | "gemini" | "openrouter" | "custom" | "mock"
  generate({ system, user, model, signal })
  stream?(...) // mock implements chunked stream
}
```

Call sites never import a specific provider — `resolveAdapter()` reads server config.

## Config / keys (server-only)

See `.env.example`:

| Env | Purpose |
|---|---|
| `AI_PROVIDER` | `anthropic` \| `gemini` \| `openrouter` \| `custom` \| `mock` |
| `AI_MODEL` | Optional model override |
| `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY` / `CUSTOM_AI_API_KEY` | Secrets |
| `CUSTOM_AI_BASE_URL` | OpenAI-compatible base URL |
| `AI_TIMEOUT_MS` | Abort timeout (default 25000) |
| `AI_USAGE_DIR` | JSONL usage dir (default `/tmp/esifit-ai`) |
| `SENTRY_DSN` | Optional — logs note that full SDK can be added |

Never use `NEXT_PUBLIC_*` for keys. Settings UI (`AISettingsPanel`) shows active provider/model/quota/usage only.

## Auth to AI routes

Mock session headers from client: `x-esifit-user-id`, `x-esifit-user-tier`, `x-esifit-expires-at`. Unsigned requests → 401 + UI “sign up to unlock”.

## Quotas (server-enforced)

Free 8 · VIP 25 · VIP+ 60 · Coach 200 · Admin 500 · Super-admin 1000 per UTC day.

## Touchpoints

1. Calculators — `AIInsightPanel` under static interpretation (anonymous gated)
2. Workout completion — one-sentence session note
3. Analytics — AI weekly narrative beside rule-based insights
4. Ask EsiFit AI bubble + ⌘K “Ask EsiFit AI”

## Routes

- `POST /api/ai/generate`
- `GET /api/ai/usage`

## Observability

`src/lib/ai/logger.ts` — structured JSON logs for usage + failures; `captureError` for adapter errors.

## Tests

24 passing (includes `src/lib/ai/ai.test.ts` for quota, prompts, mock adapter).

## Phase 6 notes

- Move provider config + encrypted keys into admin panel
- Replace mock session headers with real auth cookies/JWT
- Persist `AI_USAGE_LOG` in DB (shape already matches DATA_MODEL)
- Optional full `@sentry/nextjs` when DSN is production-ready

## Run

```bash
cp .env.example .env.local   # set AI_PROVIDER=anthropic + ANTHROPIC_API_KEY to go live
npm run dev
# signed-in: calculators / workout complete / analytics / Ask AI / Settings → AI usage
```
