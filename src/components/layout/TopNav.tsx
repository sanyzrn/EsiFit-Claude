import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Globe, Sun, Moon, MessageSquare, LayoutDashboard } from 'lucide-react';
import { getState, logout } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useEntitlements } from '@/lib/entitlements';
import { isNavActive, LOGGED_IN_QUICK_NAV, PRIMARY_NAV, SECONDARY_NAV } from './nav-config';
import { UserMenu } from './UserMenu';

type TopNavProps = {
  user: ReturnType<typeof getState>['currentUser'];
};

export function TopNav({ user }: TopNavProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { subscriptionTier } = useEntitlements();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = (href: string, secondary = false) => {
    const active = isNavActive(location.pathname, href);
    if (active) {
      return 'text-brand bg-brand-muted';
    }
    return secondary
      ? 'text-fg-subtle hover:text-fg-muted hover:bg-elevated'
      : 'text-fg-muted hover:text-fg hover:bg-elevated';
  };

  return (
    <nav className="sticky top-0 z-50 bg-app/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-[12px] bg-brand flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-brand-fg" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Esi<span className="text-brand">Fit</span>
            </span>
          </Link>

          {/* Desktop primary + secondary nav */}
          <div className="hidden lg:flex items-center gap-1 min-w-0 flex-1 justify-center mx-4">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-[12px] text-sm font-medium transition-colors duration-[180ms] ${navLinkClass(link.href)}`}
              >
                {t(link.label)}
              </Link>
            ))}
            <span className="w-px h-5 bg-border-strong mx-1 shrink-0" aria-hidden />
            {SECONDARY_NAV.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-2.5 py-2 rounded-[12px] text-sm transition-colors duration-[180ms] ${navLinkClass(link.href, true)}`}
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user && LOGGED_IN_QUICK_NAV.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-[12px] text-sm font-medium transition-colors duration-[180ms] ${navLinkClass(link.href)}`}
              >
                {link.href.includes('chat') ? (
                  <MessageSquare className="w-4 h-4" />
                ) : (
                  <LayoutDashboard className="w-4 h-4" />
                )}
                <span className="hidden xl:inline">{t(link.label)}</span>
              </Link>
            ))}

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-[12px] hover:bg-elevated transition-colors duration-[180ms] text-fg-muted"
              aria-label={theme === 'dark'
                ? t({ en: 'Switch to light theme', fa: 'تغییر به تم روشن' })
                : t({ en: 'Switch to dark theme', fa: 'تغییر به تم تیره' })}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
                className="flex items-center gap-2 px-2 py-2 rounded-[12px] hover:bg-elevated transition-colors duration-[180ms] text-fg-muted"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">{lang}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute end-0 top-12 w-32 bg-surface border border-border rounded-[24px] py-2 animate-fade-in z-50">
                  <button
                    type="button"
                    onClick={() => { setLang('en'); setLangMenuOpen(false); }}
                    className={`w-full text-start px-4 py-2 text-sm transition-colors duration-[180ms] ${lang === 'en' ? 'text-brand bg-elevated' : 'hover:bg-elevated'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('fa'); setLangMenuOpen(false); }}
                    className={`w-full text-start px-4 py-2 text-sm transition-colors duration-[180ms] ${lang === 'fa' ? 'text-brand bg-elevated' : 'hover:bg-elevated'}`}
                  >
                    فارسی
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <UserMenu
                user={user}
                open={userMenuOpen}
                onToggle={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}
                onClose={() => setUserMenuOpen(false)}
                onLogout={handleLogout}
                subscriptionTier={subscriptionTier}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg transition-colors duration-[180ms]">
                  {t({ en: 'Sign In', fa: 'ورود' })}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-bold rounded-[12px] bg-brand text-brand-fg hover:bg-brand-dark transition-colors duration-[180ms]">
                  {t({ en: 'Get Started', fa: 'شروع کنید' })}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: compact header actions (bottom nav handles main IA) */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-[12px] hover:bg-elevated text-fg-muted transition-colors duration-[180ms]"
              aria-label={theme === 'dark'
                ? t({ en: 'Switch to light theme', fa: 'تغییر به تم روشن' })
                : t({ en: 'Switch to dark theme', fa: 'تغییر به تم تیره' })}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user && (
              <Link
                to="/dashboard"
                className="p-2 rounded-[12px] hover:bg-elevated transition-colors duration-[180ms]"
                aria-label={t({ en: 'Dashboard', fa: 'داشبورد' })}
              >
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-brand-fg">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
