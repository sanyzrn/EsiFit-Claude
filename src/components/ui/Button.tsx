import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-[180ms] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' },
    secondary: { backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border-strong)' },
    ghost: { color: 'var(--theme-fg-muted)' },
    danger: { backgroundColor: 'color-mix(in srgb, var(--theme-error) 12%, transparent)', color: 'var(--theme-error)', border: '1px solid color-mix(in srgb, var(--theme-error) 25%, transparent)' },
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${className}`}
      style={{ ...variants[variant] }}
      {...props}
    >
      {children}
    </button>
  );
}
