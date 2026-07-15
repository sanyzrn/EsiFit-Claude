import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
  className?: string;
};

/** Accessible breadcrumb trail — e.g. Home > Programs > Push Pull Legs */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { t } = useI18n();
  const all: Crumb[] = [
    { label: t({ en: 'Home', fa: 'خانه' }), href: '/' },
    ...items,
  ];

  return (
    <nav
      aria-label={t({ en: 'Breadcrumb', fa: 'مسیر صفحه' })}
      className={`mb-6 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50 rtl:!rotate-180" aria-hidden />
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-brand transition-colors truncate max-w-[12rem] sm:max-w-none inline-flex items-center gap-1"
                >
                  {i === 0 && <Home className="w-3.5 h-3.5 shrink-0" aria-hidden />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`truncate max-w-[16rem] sm:max-w-none ${isLast ? 'text-fg font-medium' : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {i === 0 && !item.href && <Home className="w-3.5 h-3.5 inline me-1" aria-hidden />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
