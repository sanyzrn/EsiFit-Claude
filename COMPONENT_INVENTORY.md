# EsiFit — COMPONENT_INVENTORY.md

**This is a living document.** Before each phase, Claude Code checks this file to avoid recreating existing components. After each phase, Claude Code updates this file with the *actual* variants/props/states/animations/dependencies it implemented — replacing the "planned" placeholder rows below with real specs, and flipping `Stable` to `Yes` once the API is settled and unlikely to change. Never leave this file stale relative to the codebase.

**Column guide:**
- **Depends On** — other components/utilities this one is built from or requires (check these aren't broken before modifying a shared dependency).
- **Used In** — which pages/phases currently render this component (check these before changing its props/behavior).
- **Stable** — `Yes` once the API is settled; `No` while still likely to change. Treat a `No` component's props as unstable and confirm before building heavily on top of it.

## How to fill in a row

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| *(example)* `Button` | primary, secondary, ghost, gradient-glow | `variant, size, icon, loading, disabled, onClick` | default, hover, active, disabled, loading | scale-down on press, glow pulse on gradient-glow hover | — | Landing, Dashboard, all forms | Yes |

## Planned inventory (fill in real specs as each is built)

### Core / Phase 1
| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| Button | primary / secondary / ghost / gradient-glow | TBD | default / hover / active / disabled / loading | TBD | — | TBD | No |
| Card | default / interactive | TBD | default / hover | TBD | — | TBD | No |
| GlassCard | default / elevated | TBD | default / hover | TBD | Card | TBD | No |
| Badge/Pill | tier (Free/VIP/VIP+/Coach), status | TBD | default | TBD | — | TBD | No |
| AnimatedCounter | numeric / percentage | TBD | idle / animating | count up/down | — | TBD | No |
| RadialProgress/Gauge (base) | small / medium / large / hero | TBD | idle / animating / complete | ring fill animation | — | TBD | No |
| Navbar | transparent-on-hero / solid-on-scroll | TBD | scrolled / top | background transition | Button | TBD | No |
| Footer | — | TBD | — | — | — | TBD | No |
| Modal/Dialog | — | TBD | open / closing | fade + scale | — | TBD | No |
| Toast | success / error / info / warning | TBD | entering / visible / exiting | slide + fade | — | TBD | No |
| Tabs, Tooltip | — | TBD | — | — | — | TBD | No |
| Skeleton | shape-matched per content type | TBD | loading | shimmer | — | TBD | No |
| AnatomyBodyMap | front / back, highlight-by-muscle | `highlightedMuscles, intensityMap` | idle / highlighted | color transition on highlight change | — | TBD | No |
| RevealOnScroll, MagneticButton | — | TBD | — | — | — | TBD | No |
| SectionHeader | — | TBD | — | — | — | TBD | No |
| Transformation Slider | before/after drag-reveal | TBD | dragging / idle | drag-follow | — | TBD | No |

### Dashboard / Phase 2
| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| StatCard, ProgressCard | per widget type | `data, loading, error` | loading / loaded / empty / error | staggered entrance | Card, Skeleton, AnimatedCounter | TBD | No |
| ChartCard (wrapper) | line / bar / radial / heatmap | `series, config` | loading / loaded / empty | draw-in on mount | Card, Skeleton | TBD | No |
| CommandPalette | — | `commands[]` | closed / open / searching | fade + scale | Modal | TBD | No |
| BottomSheet, Drawer | — | TBD | closed / open / dragging | slide | Modal | TBD | No |
| AIBubble (chat entry point) | collapsed / expanded | TBD | idle / typing / responding | expand/collapse | Button | TBD | No |
| Sidebar | expanded / collapsed | TBD | — | width transition | Button | TBD | No |

### Feature cards / Phase 3
| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| ExerciseCard | grid / list | TBD | default / expanded | expand | Card, AnatomyBodyMap | TBD | No |
| WorkoutCard | routine / active-session | TBD | idle / active / complete | — | Card | TBD | No |
| CalculatorCard | per calculator config | `config, onCalculate` | idle / calculating / result | result reveal | Card, RadialProgress/Gauge | TBD | No |
| NutritionCard | meal / recipe | TBD | — | — | Card | TBD | No |
| TimelineCard | — | TBD | — | — | Card | TBD | No |
| Ring (macro/progress) | — | TBD | — | fill animation | RadialProgress/Gauge | TBD | No |
| Sparkline, AreaChart, RadarChart, Heatmap | — | `data, theme` | loading / loaded / empty | draw-in | ChartCard | TBD | No |

### Growth / Phase 4
| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| AchievementCard | locked / unlocked / in-progress | TBD | — | unlock celebration | Card, Celebration | TBD | No |
| FloatingButton | — | TBD | — | — | Button | TBD | No |
| Celebration (shared) | confetti / glow-burst | `trigger, intensity` | idle / triggered | one reusable implementation, reused everywhere | — | PRs, level-ups, badges, missions | No |

*(Continue this pattern for Phase 5+ components as they're introduced — AI response bubble/streaming states, quota indicator, etc.)*
