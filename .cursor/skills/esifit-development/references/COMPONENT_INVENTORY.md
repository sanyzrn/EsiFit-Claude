# EsiFit — COMPONENT_INVENTORY.md

**This is a living document.** Before each phase, check this file to avoid recreating existing components. After each phase, update with actual variants/props/states/animations/dependencies.

**Column guide:**
- **Depends On** — other components/utilities this one is built from or requires.
- **Used In** — which pages/phases currently render this component.
- **Stable** — `Yes` once the API is settled; `No` while still likely to change.

## Core / Phase 1 (implemented)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| `Button` | primary / secondary / ghost / gradient-glow | `variant, size, asChild, loading, disabled` | default / hover / active / disabled / loading | scale-down on press; glow on gradient-glow | Radix Slot, CVA | Landing, Blog, Navbar | Yes |
| `Card` | default | standard div props | default | — | — | — | Yes |
| `GlassCard` | default / elevated / interactive | `elevated, interactive` | default / hover | lift + border tint when interactive | glass utility | Landing, Blog | Yes |
| `Badge` | free / vip / vip-plus / coach / status | `variant` | default | — | CVA | Pricing, Blog | Yes |
| `AnimatedCounter` | numeric | `value, decimals, prefix, suffix` | idle / animating | spring count-up | Framer Motion, MOTION flag | RadialProgress, hero | Yes |
| `RadialProgress` | sm / md / lg / hero | `value, size, label` | idle / animating | ring draw-in | AnimatedCounter | Hero dashboard preview | Yes |
| `Navbar` | transparent-on-hero → solid-on-scroll | — | top / scrolled / mobile-open | background transition | Button, theme | Global layout | Yes |
| `Footer` | — | — | — | — | — | Global layout | Yes |
| `Dialog` | — | Radix dialog props | open / closed | overlay fade | Radix Dialog | Ready for Phase 2 | Yes |
| `Toast` | via sonner | — | queued | slide | sonner | Newsletter | Yes |
| `Tabs` / `Tooltip` / `Accordion` | themed | Radix props | — | chevron rotate | Radix | Pricing, FAQ | Yes |
| `Skeleton` | shape via className | — | loading | pulse | — | Ready for Phase 2 | Yes |
| `AnatomyBodyMap` | front / back | `view, intensityMap, highlightedMuscles, title` | idle / highlighted | fill transition | ANATOMY_VIEW flag | Hero | Yes |
| `RevealOnScroll` | — | `delay` | — | fade+rise once | Framer Motion, MOTION | Landing sections | Yes |
| `MagneticButton` | Button variants | Button props + magnetic hover | — | cursor-follow | Button, Framer Motion | Hero CTA | Yes |
| `SectionHeader` | left / center | `eyebrow, title, description, align` | — | — | — | Landing | Yes |
| `TransformationSlider` | before/after | — | dragging / idle | clip-path follow | — | Landing | Yes |

## Dashboard / Phase 2 (planned)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| StatCard, ProgressCard | per widget type | `data, loading, error` | loading / loaded / empty / error | staggered entrance | Card, Skeleton, AnimatedCounter | TBD | No |
| ChartCard (wrapper) | line / bar / radial / heatmap | `series, config` | loading / loaded / empty | draw-in on mount | Card, Skeleton | TBD | No |
| CommandPalette | — | `commands[]` | closed / open / searching | fade + scale | Modal | TBD | No |
| BottomSheet, Drawer | — | TBD | closed / open / dragging | slide | Modal | TBD | No |
| AIBubble (chat entry point) | collapsed / expanded | TBD | idle / typing / responding | expand/collapse | Button | TBD | No |
| Sidebar | expanded / collapsed | TBD | — | width transition | Button | TBD | No |

## Feature cards / Phase 3 (planned)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| ExerciseCard | grid / list | TBD | default / expanded | expand | Card, AnatomyBodyMap | TBD | No |
| WorkoutCard | routine / active-session | TBD | idle / active / complete | — | Card | TBD | No |
| CalculatorCard | per calculator config | `config, onCalculate` | idle / calculating / result | result reveal | Card, RadialProgress | TBD | No |
| NutritionCard | meal / recipe | TBD | — | — | Card | TBD | No |
| TimelineCard | — | TBD | — | — | Card | TBD | No |
| Ring (macro/progress) | — | TBD | — | fill animation | RadialProgress | TBD | No |
| Sparkline, AreaChart, RadarChart, Heatmap | — | `data, theme` | loading / loaded / empty | draw-in | ChartCard | TBD | No |

## Growth / Phase 4 (planned)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| AchievementCard | locked / unlocked / in-progress | TBD | — | unlock celebration | Card, Celebration | TBD | No |
| FloatingButton | — | TBD | — | — | Button | TBD | No |
| Celebration (shared) | confetti / glow-burst | `trigger, intensity` | idle / triggered | one reusable implementation | — | PRs, level-ups, badges, missions | No |
