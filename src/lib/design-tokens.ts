/**
 * Brand design tokens — mirrors CSS variables in index.css.
 * Light: cream + deep pomegranate | Dark: graphite + Persian turquoise
 */
export const palette = {
  cream: '#F6F1E8',
  pomegranate: { DEFAULT: '#8C1D40', hover: '#751836' },
  graphite: '#1F2328',
  turquoise: { DEFAULT: '#14B8A6', hover: '#2DD4BF' },
  charcoal: '#222222',
  softWhite: '#F5F5F5',
  white: '#FFFFFF',
} as const;

export const semantic = {
  primary: 'var(--theme-primary)',
  primaryFg: 'var(--theme-primary-fg)',
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

/** Brand radius scale (px) */
export const radius = {
  btn: '12px',
  input: '12px',
  card: '20px',
  dialog: '24px',
  image: '20px',
  chart: '16px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
} as const;

export const motion = {
  fast: '180ms',
  normal: '220ms',
} as const;

export const typeScale = {
  displayXl: '3.25rem',
  displayLg: '2.5rem',
  displayMd: '2rem',
  displaySm: '1.625rem',
} as const;

/** @deprecated Use palette.pomegranate / palette.turquoise */
export const brand = {
  primary: palette.pomegranate.DEFAULT,
  primaryDark: palette.pomegranate.hover,
  primaryLight: palette.turquoise.DEFAULT,
} as const;

/** @deprecated Use palette.turquoise */
export const accent = {
  DEFAULT: palette.turquoise.DEFAULT,
  dark: '#0f766e',
  light: palette.turquoise.hover,
  muted: 'var(--theme-secondary-muted)',
} as const;
