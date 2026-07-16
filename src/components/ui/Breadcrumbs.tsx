import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: 'var(--theme-fg-subtle)' }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span style={{ color: 'var(--theme-fg-faint)' }}>/</span>}
          {item.href ? (
            <Link to={item.href} className="transition-all duration-[180ms] hover:opacity-80">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-fg)' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
