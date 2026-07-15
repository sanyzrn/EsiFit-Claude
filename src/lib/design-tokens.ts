/** Canonical brand + accent tokens (mirrors index.css @theme). */
export const brand = {
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#fb923c',
} as const;

/** Persian teal — secondary accent for Iranized UI (UI-11). */
export const accent = {
  DEFAULT: '#0d9488',
  dark: '#0f766e',
  light: '#14b8a6',
  muted: 'rgba(13, 148, 136, 0.12)',
} as const;

export const radius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
} as const;
