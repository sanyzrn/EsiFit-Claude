import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from './Button';
import { IconBadge } from './IconBadge';

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
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 card-premium">
      {Icon && (
        <div className="mb-5">
          <IconBadge icon={Icon} variant={variant} size="lg" />
        </div>
      )}
      <h3 className="text-lg font-bold text-fg mb-2 font-display">{title}</h3>
      {description && (
        <p className="text-sm text-fg-subtle max-w-sm mb-5 leading-relaxed">{description}</p>
      )}
      {action && (
        <div>
          {action.href ? (
            <a href={action.href}>
              <Button variant="primary">{action.label}</Button>
            </a>
          ) : (
            <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
