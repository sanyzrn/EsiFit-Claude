import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'terracotta';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-brand-fg hover:bg-brand-dark font-semibold',
  secondary: 'bg-surface text-fg border border-border hover:bg-elevated',
  accent: 'bg-accent text-white hover:bg-accent-dark',
  terracotta: 'bg-terracotta text-white hover:bg-terracotta-dark',
  ghost: 'text-fg-muted hover:text-fg hover:bg-elevated',
  danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/15',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm rounded-[12px]',
  md: 'px-5 py-2.5 text-sm font-medium rounded-[12px]',
  lg: 'px-7 py-3.5 text-base font-semibold rounded-[12px]',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 transition-[color,background-color,filter] duration-[180ms]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-app',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
