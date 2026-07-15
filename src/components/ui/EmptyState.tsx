import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { PersianPattern } from './PersianPattern';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  children?: ReactNode;
  variant?: 'saffron' | 'firuze' | 'terracotta';
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  variant = 'firuze',
}: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center text-center py-12 px-4 overflow-hidden rounded-2xl border border-border bg-surface">
      <PersianPattern opacity={0.35} />
      {Icon && (
        <div className="relative z-10 mb-4">
          <IconBadge icon={Icon} variant={variant} size="lg" />
        </div>
      )}
      <h3 className="relative z-10 text-lg font-bold text-fg mb-1 font-display">{title}</h3>
      {description && (
        <p className="relative z-10 text-sm text-fg-subtle max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <div className="relative z-10">
          {action.href ? (
            <a href={action.href}>
              <Button variant="accent">{action.label}</Button>
            </a>
          ) : (
            <Button variant="accent" onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
