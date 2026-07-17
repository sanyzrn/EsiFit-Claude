# EsiFit — Phase 1 Handoff

## Summary

Phase 1 foundation is live: design tokens, component library, landing page, public articles hub, AnatomyBodyMap, PWA manifest/icons, and the `esifit-development` skill installed project-wide (plus user-global copies under `~/.cursor/skills`).

## Design tokens (locked for Phase 2+)

### Color
| Token | Dark | Light |
|---|---|---|
| surface-0 | `#0A0B0D` | `#F4F6F8` |
| surface-1 | `#101216` | `#FFFFFF` |
| surface-2 | `#16181D` | `#E8ECF1` |
| surface-3 | `#1E2128` | `#DCE2EA` |
| mint | `#00F5A0` | `#00C47A` |
| plasma | `#4D9FFF` | `#3B82F6` |
| gold | `#D4AF6A` | `#C49A4A` |
| error | `#FF6B7A` | `#E85D6A` |

### Typography
- Headings: **Inter Tight** (`--font-heading`)
- Body: **Inter** (`--font-body`)
- Data/numbers: **JetBrains Mono** (`--font-data`)
- Scale utilities: `.type-display`, `.type-h1`–`.type-h4`, `.type-body-*`, `.type-caption`, `.type-data-*`

### Motion presets (`src/lib/motion.ts`)
- `snappy` — 160ms, `[0.2, 0.8, 0.2, 1]`
- `smooth` — 320ms, `[0.22, 1, 0.36, 1]`
- `spring` — stiffness 380 / damping 28
- Master flag: `MOTION`; also respects `prefers-reduced-motion`

### Radius / elevation
- radius: sm 8 / md 16 / lg 24 / full
- shadows: `--shadow-rest|raised|float`, glows `--glow-mint|plasma`
- glass blur: 14px

## Key APIs
- `useFeatureFlag(flag)` / `isFeatureEnabled(flag)` — `src/lib/feature-flags.ts`
- `AnatomyBodyMap({ view, intensityMap, highlightedMuscles })` — muscle keys listed in component
- `createMetadata({ title, description, path, type })` — `src/lib/seo.ts`
- Health: `GET /api/health` → `{ status: "ok" }`

## PWA
- `src/app/manifest.ts` + icons in `public/icons/` (192, 512, maskable)
- Install prompt intentionally deferred until post-engagement (Phase 2+); iOS instructions to surface in settings later

## Run
```bash
npm install
npm run dev
```

## Definition of Done (Phase 1)
- [x] No TypeScript errors (`npm run build`)
- [x] Dark/light theme parity (`next-themes`, class strategy)
- [x] Responsive landing + blog
- [x] Feature flags for BLOG / ANATOMY_VIEW / MOTION / BLOG_SEARCH / EXPERIMENTAL_UI
- [x] PWA manifest + icons
- [x] Docs updated (inventory, decisions, handoff)
- [x] Branch/commits per OPERATIONS.md
- [ ] Lighthouse 95+ — verify in browser after deploy (not automated in this environment)
- [ ] Contextual install prompt — deferred until meaningful engagement exists (Phase 2)
