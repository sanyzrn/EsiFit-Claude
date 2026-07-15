/**
 * Iranian visual identity tokens (UI-12).
 * Mirrors CSS variables in index.css — use for SVG/chart literals when CSS vars aren't available.
 */
export const palette = {
  saffron: { DEFAULT: '#e8b84a', dark: '#b8860b', light: '#f0c96a' },
  firuze: { DEFAULT: '#2bb5a8', dark: '#0e7c6b', light: '#3cc9bc' },
  terracotta: { DEFAULT: '#d97745', dark: '#c4613a', light: '#e8926a' },
  pomegranate: { DEFAULT: '#e05a4a', dark: '#b83a2e' },
  parchment: { DEFAULT: '#f7f3ec', dark: '#0c1118' },
} as const;

export const semantic = {
  primary: 'var(--theme-primary)',
  secondary: 'var(--theme-secondary)',
  accent: 'var(--theme-accent)',
  success: 'var(--theme-success)',
  warning: 'var(--theme-warning)',
  error: 'var(--theme-error)',
} as const;

export const chartSeries = [
  'var(--theme-chart-1)',
  'var(--theme-chart-2)',
  'var(--theme-chart-3)',
  'var(--theme-chart-4)',
] as const;

export const radius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
} as const;

export const typeScale = {
  displayXl: '3.5rem',
  displayLg: '2.75rem',
  displayMd: '2.25rem',
  displaySm: '1.75rem',
} as const;

/** @deprecated Use palette.saffron — kept for backward compat */
export const brand = {
  primary: palette.saffron.DEFAULT,
  primaryDark: palette.saffron.dark,
  primaryLight: palette.saffron.light,
} as const;

/** @deprecated Use palette.firuze */
export const accent = {
  DEFAULT: palette.firuze.DEFAULT,
  dark: palette.firuze.dark,
  light: palette.firuze.light,
  muted: 'var(--theme-secondary-muted)',
} as const;
