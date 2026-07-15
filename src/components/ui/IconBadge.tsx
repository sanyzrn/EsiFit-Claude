import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes } from 'react';

type Variant = 'saffron' | 'firuze' | 'terracotta' | 'neutral' | 'brand' | 'accent';

const variants: Record<Variant, string> = {
  brand: 'bg-brand-muted text-brand border-brand/20',
  saffron: 'bg-brand-muted text-brand border-brand/20',
  firuze: 'bg-accent-muted text-accent border-accent/20',
  accent: 'bg-accent-muted text-accent border-accent/20',
  terracotta: 'bg-terracotta/10 text-terracotta border-terracotta/20',
  neutral: 'bg-elevated text-fg-muted border-border',
};

type IconBadgeProps = HTMLAttributes<HTMLDivElement> & {
  icon: LucideIcon;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { box: 'w-9 h-9 rounded-[12px]', icon: 'w-4 h-4' },
  md: { box: 'w-12 h-12 rounded-[12px]', icon: 'w-5 h-5' },
  lg: { box: 'w-14 h-14 rounded-[16px]', icon: 'w-7 h-7' },
};

export function IconBadge({
  icon: Icon,
  variant = 'brand',
  size = 'md',
  className = '',
  ...props
}: IconBadgeProps) {
  const s = sizes[size];
  return (
    <div
      className={[
        'inline-flex items-center justify-center border',
        s.box,
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    >
      <Icon className={s.icon} strokeWidth={1.75} aria-hidden />
    </div>
  );
}
