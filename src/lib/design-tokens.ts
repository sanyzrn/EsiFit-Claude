/**
 * Brand design tokens — mirrors CSS variables in index.css.
 * Dark: Deep charcoal + vibrant emerald + coral accent
 * Light: Warm ivory + deep teal + terracotta accent
 */
export const palette = {
  dark: { bg: '#07080a', surface: '#111317', elevated: '#191b21', elevatedHover: '#22242b' },
  light: { bg: '#f7f5f0', surface: '#ffffff', elevated: '#eeebe4', elevatedHover: '#e6e1d8' },
  emerald: { DEFAULT: '#06d6a0', hover: '#05c490', dim: 'rgba(6, 214, 160, 0.12)' },
  coral: { DEFAULT: '#ff6b35', hover: '#ff8250', dim: 'rgba(255, 107, 53, 0.12)' },
  blue: { DEFAULT: '#4cc9f0', hover: '#6dd4f5', dim: 'rgba(76, 201, 240, 0.12)' },
  teal: { DEFAULT: '#1a936f', hover: '#147a5a', dim: 'rgba(26, 147, 106, 0.1)' },
  terracotta: { DEFAULT: '#e85d3a', hover: '#d44d2a', dim: 'rgba(232, 93, 58, 0.1)' },
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
  '3xl': '28px',
  pill: '999px',
} as const;

export const motion = {
  fast: '180ms',
  normal: '280ms',
  slow: '400ms',
} as const;

export const typeScale = {
  display2xl: '4.5rem',
  displayXl: '3.75rem',
  displayLg: '3rem',
  displayMd: '2.25rem',
  displaySm: '1.75rem',
  displayXs: '1.375rem',
} as const;
