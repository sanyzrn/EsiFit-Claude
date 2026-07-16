import { type LucideIcon } from 'lucide-react';

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: 'firuze' | 'saffron' | 'terracotta' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export function IconBadge({ icon: Icon, variant = 'neutral', size = 'md' }: IconBadgeProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    firuze: { bg: 'var(--theme-primary-dim)', text: 'var(--theme-primary)' },
    saffron: { bg: 'color-mix(in srgb, var(--theme-warning) 12%, transparent)', text: 'var(--theme-warning)' },
    terracotta: { bg: 'var(--theme-accent-dim)', text: 'var(--theme-accent)' },
    neutral: { bg: 'var(--theme-elevated)', text: 'var(--theme-fg-subtle)' },
  };

  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  const c = colors[variant];
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center transition-transform duration-[280ms] group-hover:scale-110`}
      style={{ backgroundColor: c.bg }}
    >
      <Icon className={iconSizes[size]} style={{ color: c.text }} />
    </div>
  );
}
