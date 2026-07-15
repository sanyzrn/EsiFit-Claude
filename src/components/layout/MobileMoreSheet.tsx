import { Link } from 'react-router-dom';
import { X, Dumbbell, Apple, BookOpen, CreditCard, Globe, Sun, Moon, LogIn, UserPlus } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-config';

type MobileMoreSheetProps = {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
};

export function MobileMoreSheet({ open, onClose, isLoggedIn, onLogout }: MobileMoreSheetProps) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  if (!open) return null;

  const moreLinks = [
    { href: '/exercises', label: t({ en: 'Exercises', fa: 'حرکات تمرینی' }), icon: Dumbbell },
    { href: '/diet', label: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }), icon: Apple },
    { href: '/blog', label: t({ en: 'Blog', fa: 'مقالات' }), icon: BookOpen },
    { href: '/pricing', label: t({ en: 'Pricing', fa: 'تعرفه‌ها' }), icon: CreditCard },
  ];

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-label={t({ en: 'Close menu', fa: 'بستن منو' })}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t({ en: 'More navigation', fa: 'منوی بیشتر' })}
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-surface border border-border rounded-t-[24px] animate-slide-up max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-bold text-fg">{t({ en: 'More', fa: 'بیشتر' })}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[12px] hover:bg-elevated transition-colors duration-[180ms]"
            aria-label={t({ en: 'Close', fa: 'بستن' })}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 grid grid-cols-2 gap-2">
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-[20px] bg-elevated hover:bg-elevated-hover transition-colors duration-[180ms]"
            >
              <link.icon className="w-5 h-5 text-accent shrink-0" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs font-semibold text-fg-faint uppercase tracking-wide mb-2 px-1">
            {t({ en: 'Browse', fa: 'مرور' })}
          </p>
          <div className="space-y-1">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
                className="block px-3 py-2 rounded-[12px] text-sm text-fg-muted hover:bg-elevated transition-colors duration-[180ms]"
              >
                {t(link.label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-[12px] hover:bg-elevated text-fg-muted transition-colors duration-[180ms]"
            aria-label={theme === 'dark'
              ? t({ en: 'Switch to light theme', fa: 'تغییر به تم روشن' })
              : t({ en: 'Switch to dark theme', fa: 'تغییر به تم تیره' })}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Globe className="w-4 h-4 text-fg-subtle" />
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-[12px] text-sm font-medium transition-colors duration-[180ms] ${lang === 'en' ? 'bg-brand-muted text-brand' : 'text-fg-subtle hover:bg-elevated'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('fa')}
            className={`px-3 py-1.5 rounded-[12px] text-sm font-medium transition-colors duration-[180ms] ${lang === 'fa' ? 'bg-brand-muted text-brand' : 'text-fg-subtle hover:bg-elevated'}`}
          >
            FA
          </button>
        </div>

        <div className="px-4 py-4 border-t border-border">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => { onLogout(); onClose(); }}
              className="w-full py-2.5 text-sm font-medium text-danger bg-danger/10 rounded-[12px] hover:bg-danger/15 transition-colors duration-[180ms]"
            >
              {t({ en: 'Sign Out', fa: 'خروج' })}
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-[12px] border border-border-strong hover:bg-elevated transition-colors duration-[180ms]"
              >
                <LogIn className="w-4 h-4" /> {t({ en: 'Sign In', fa: 'ورود' })}
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-[12px] bg-brand text-brand-fg hover:bg-brand-dark transition-colors duration-[180ms]"
              >
                <UserPlus className="w-4 h-4" /> {t({ en: 'Join', fa: 'عضویت' })}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
