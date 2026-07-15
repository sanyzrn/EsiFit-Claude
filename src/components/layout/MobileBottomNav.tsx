import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { HIDE_BOTTOM_NAV_PREFIXES, isNavActive, MOBILE_TABS } from './nav-config';

type MobileBottomNavProps = {
  onMoreOpen: () => void;
  moreOpen: boolean;
};

export function MobileBottomNav({ onMoreOpen, moreOpen }: MobileBottomNavProps) {
  const { t } = useI18n();
  const location = useLocation();

  const hidden = HIDE_BOTTOM_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (hidden) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label={t({ en: 'Main navigation', fa: 'ناوبری اصلی' })}
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isMore
            ? moreOpen
            : isNavActive(location.pathname, tab.href);

          if (tab.isMore) {
            return (
              <button
                key={tab.href}
                type="button"
                onClick={onMoreOpen}
                aria-expanded={moreOpen}
                className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-xs font-medium transition-colors duration-[180ms] ${
                  active ? 'text-brand' : 'text-fg-subtle hover:text-fg-muted'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden />
                <span>{t(tab.label)}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-xs font-medium transition-colors duration-[180ms] ${
                active ? 'text-brand' : 'text-fg-subtle hover:text-fg-muted'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden />
              <span>{t(tab.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
