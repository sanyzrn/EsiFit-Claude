import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'esifit_theme';

export function getStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    /* ignore */
  }
  return 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

/** Read a theme CSS variable (for charts/SVG). */
export function getThemeCssVar(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Chart colors that follow the active Iranian palette (UI-12). */
export function useChartTheme() {
  useTheme();
  return {
    grid: getThemeCssVar('--theme-chart-grid'),
    axis: getThemeCssVar('--theme-fg-subtle'),
    series: [
      getThemeCssVar('--theme-chart-1'),
      getThemeCssVar('--theme-chart-2'),
      getThemeCssVar('--theme-chart-3'),
      getThemeCssVar('--theme-chart-4'),
    ] as [string, string, string, string],
    primary: getThemeCssVar('--theme-chart-1'),
    secondary: getThemeCssVar('--theme-chart-2'),
    accent: getThemeCssVar('--theme-chart-3'),
    tooltipStyle: {
      background: getThemeCssVar('--theme-chart-tooltip-bg'),
      border: `1px solid ${getThemeCssVar('--theme-chart-tooltip-border')}`,
      borderRadius: '12px',
      color: getThemeCssVar('--theme-fg'),
      fontFamily: 'inherit',
    },
  };
}
