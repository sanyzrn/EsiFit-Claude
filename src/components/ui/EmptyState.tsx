import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  variant?: 'firuze' | 'saffron' | 'terracotta' | 'neutral';
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, variant = 'neutral', title, description, action }: EmptyStateProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    firuze: { bg: 'var(--theme-primary-dim)', text: 'var(--theme-primary)' },
    saffron: { bg: 'color-mix(in srgb, var(--theme-warning) 12%, transparent)', text: 'var(--theme-warning)' },
    terracotta: { bg: 'var(--theme-accent-dim)', text: 'var(--theme-accent)' },
    neutral: { bg: 'var(--theme-elevated)', text: 'var(--theme-fg-subtle)' },
  };

  const c = colors[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: c.bg }}>
          <Icon className="w-7 h-7" style={{ color: c.text }} />
        </div>
      )}
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-sm max-w-md mb-6" style={{ color: 'var(--theme-fg-subtle)' }}>{description}</p>
      )}
      {action && (
        <Link
          to={action.href}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-[180ms]"
          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
