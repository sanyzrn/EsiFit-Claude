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

## Dashboard / Phase 2 (implemented)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| DashboardShell | collapsed sidebar | children | auth-gated | width transition | Badge, Button | /dashboard | Yes |
| DashboardView | bento grid | — | loading / loaded / error | staggered RevealOnScroll | TanStack Query, dnd-kit | /dashboard | Yes |
| WidgetShell | default / locked | title, loading, error, empty, locked, dragHandleProps | loading / error / locked / empty | — | GlassCard, Skeleton | All widgets | Yes |
| ProgressScoreWidget / ReadinessWidget | hero | WidgetProps&lt;DashboardData&gt; | loading / loaded | RadialProgress | WidgetShell | Dashboard | Yes |
| Metric widgets (Today/Nutrition/Water/Sleep/Weight/BodyFat/XP/Streak/Goals/Weekly/Timeline/Milestones) | per data type | WidgetProps&lt;DashboardData&gt; | loading / empty / error | counters, sparklines, bars | WidgetShell, Sparkline | Dashboard | Yes |
| CompleteProfileWidget | nudge | visible, dragHandleProps | — | — | WidgetShell | Dashboard | Yes |
| CoachMessagesWidget / AnalyticsTeaserWidget | locked/unlocked | WidgetProps | locked for Free | — | WidgetShell | Dashboard | Yes |
| CommandPalette | — | registry commands | open / closed | Dialog | cmdk, registerCommand | Global | Yes |
| OnboardingWizard | 6 steps | — | skippable | progress bar | GlassCard | /onboarding | Yes |
| OtpInput | 6-digit | value, onChange | — | auto-advance / paste | — | /2fa | Yes |
| Auth forms | login/signup/forgot/verify | RHF+Zod | loading / error | — | AuthShell | Auth routes | Yes |
| BottomSheet, Drawer | — | TBD | closed / open / dragging | slide | Modal | TBD | No |
| AIBubble (chat entry point) | collapsed / expanded | TBD | idle / typing / responding | expand/collapse | Button | TBD | No |

## Core product / Phase 3 (implemented)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| CalculatorShell | config-driven | `slug` | idle / result / compare | gauge + counter | RadialProgress, chart theme, history store | `/calculators/[slug]` | Yes |
| ExerciseLibrary | grid | — | filter / detail | — | AnatomyBodyMap, catalog | `/workouts` | Yes |
| WorkoutBuilder | — | — | editing / saved | — | builder store | `/workouts/builder` | Yes |
| WorkoutSession | live | — | logging / rest / PR / done | PR glow, rest beep | offline queue, Speech API | `/workouts/session` | Yes |
| NutritionModule | day view | — | planning / logging | water fill, macro rings | RadialProgress, offline queue | `/nutrition` | Yes |
| AnalyticsPage | suite | — | loaded / empty | chart draw-in | chart theme, AnatomyBodyMap, TransformationSlider | `/analytics` | Yes |
| OfflineIndicator | banner | — | online / offline | slide | useOnline | session, nutrition | Yes |
| SettingsInstallPanel | — | — | deferred / standalone | — | beforeinstallprompt, useIsStandalone | `/settings` | Yes |
| chart theme utils | Recharts wrappers | — | — | — | CSS vars | calculators, analytics | Yes |

## Growth / Phase 4 (planned)

| Component | Variants | Props | States | Animation | Depends On | Used In | Stable |
|---|---|---|---|---|---|---|---|
| AchievementCard | locked / unlocked / in-progress | TBD | — | unlock celebration | Card, Celebration | TBD | No |
| FloatingButton | — | TBD | — | — | Button | TBD | No |
| Celebration (shared) | confetti / glow-burst | `trigger, intensity` | idle / triggered | one reusable implementation | — | PRs, level-ups, badges, missions | No |
