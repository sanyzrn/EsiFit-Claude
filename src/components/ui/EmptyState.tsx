import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  children?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-accent" aria-hidden />
        </div>
      )}
      <h3 className="text-lg font-bold text-fg mb-1">{title}</h3>
      {description && <p className="text-sm text-fg-subtle max-w-sm mb-4">{description}</p>}
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant="accent">{action.label}</Button>
          </a>
        ) : (
          <Button variant="accent" onClick={action.onClick}>{action.label}</Button>
        )
      )}
      {children}
    </div>
  );
}
