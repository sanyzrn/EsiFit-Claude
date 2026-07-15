import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes } from 'react';

type Variant = 'saffron' | 'firuze' | 'terracotta' | 'neutral';

const variants: Record<Variant, string> = {
  saffron: 'bg-brand-muted text-brand border-brand/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  firuze: 'bg-accent-muted text-accent border-accent/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  terracotta: 'bg-terracotta/15 text-terracotta border-terracotta/25',
  neutral: 'bg-elevated text-fg-muted border-border',
};

type IconBadgeProps = HTMLAttributes<HTMLDivElement> & {
  icon: LucideIcon;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { box: 'w-9 h-9 rounded-lg', icon: 'w-4 h-4' },
  md: { box: 'w-12 h-12 rounded-xl', icon: 'w-6 h-6' },
  lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' },
};

export function IconBadge({
  icon: Icon,
  variant = 'saffron',
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
      <Icon className={s.icon} strokeWidth={2.25} aria-hidden />
    </div>
  );
}
