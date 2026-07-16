import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Globe, Sun, Moon, MessageSquare, LayoutDashboard, Zap } from 'lucide-react';
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

  return (
    <nav className="sticky top-0 z-50 bg-app/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-[280ms] group-hover:scale-105"
              style={{ backgroundColor: 'var(--theme-primary)' }}>
              <Dumbbell className="w-5 h-5" style={{ color: 'var(--theme-primary-fg)' }} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Esi<span style={{ color: 'var(--theme-primary)' }}>Fit</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1 min-w-0 flex-1 justify-center mx-4">
            {PRIMARY_NAV.map((link) => {
              const active = isNavActive(location.pathname, link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms]"
                  style={{
                    color: active ? 'var(--theme-primary)' : 'var(--theme-fg-muted)',
                    backgroundColor: active ? 'var(--theme-primary-dim)' : 'transparent'
                  }}
                >
                  {t(link.label)}
                </Link>
              );
            })}
            <span className="w-px h-5 mx-1 shrink-0" style={{ backgroundColor: 'var(--theme-border-strong)' }} />
            {SECONDARY_NAV.map((link) => {
              const active = isNavActive(location.pathname, link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-2 rounded-xl text-sm transition-all duration-[180ms]"
                  style={{
                    color: active ? 'var(--theme-fg)' : 'var(--theme-fg-subtle)',
                    backgroundColor: active ? 'var(--theme-elevated)' : 'transparent'
                  }}
                >
                  {t(link.label)}
                </Link>
              );
            })}
          </div>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {user && LOGGED_IN_QUICK_NAV.map((link) => {
              const active = isNavActive(location.pathname, link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms]"
                  style={{
                    color: active ? 'var(--theme-primary)' : 'var(--theme-fg-muted)',
                    backgroundColor: active ? 'var(--theme-primary-dim)' : 'transparent'
                  }}
                >
                  {link.href.includes('chat') ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  <span className="hidden xl:inline">{t(link.label)}</span>
                </Link>
              );
            })}

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-xl transition-all duration-[180ms]"
              style={{ color: 'var(--theme-fg-muted)' }}
              aria-label={theme === 'dark'
                ? t({ en: 'Switch to light theme', fa: 'تغییر به تم روشن' })
                : t({ en: 'Switch to dark theme', fa: 'تغییر به تم تیره' })}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all duration-[180ms]"
                style={{ color: 'var(--theme-fg-muted)' }}
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase">{lang}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute end-0 top-12 w-32 rounded-2xl py-2 border z-50 animate-scale-in"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)'
                  }}>
                  <button
                    type="button"
                    onClick={() => { setLang('en'); setLangMenuOpen(false); }}
                    className="w-full text-start px-4 py-2 text-sm transition-all duration-[180ms]"
                    style={{
                      color: lang === 'en' ? 'var(--theme-primary)' : 'var(--theme-fg-muted)',
                      backgroundColor: lang === 'en' ? 'var(--theme-primary-dim)' : 'transparent'
                    }}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('fa'); setLangMenuOpen(false); }}
                    className="w-full text-start px-4 py-2 text-sm transition-all duration-[180ms]"
                    style={{
                      color: lang === 'fa' ? 'var(--theme-primary)' : 'var(--theme-fg-muted)',
                      backgroundColor: lang === 'fa' ? 'var(--theme-primary-dim)' : 'transparent'
                    }}
                  >
                    فارسی
                  </button>
                </div>
              )}
            </div>

            {/* User menu / auth buttons */}
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
                <Link to="/login" className="px-4 py-2 text-sm font-medium transition-all duration-[180ms]"
                  style={{ color: 'var(--theme-fg-muted)' }}>
                  {t({ en: 'Sign In', fa: 'ورود' })}
                </Link>
                <Link to="/register"
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-[280ms]"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
                  {t({ en: 'Get Started', fa: 'شروع کنید' })}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: compact avatar and theme */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-[180ms]"
              style={{ color: 'var(--theme-fg-muted)' }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user && (
              <Link
                to="/dashboard"
                className="p-2 rounded-xl transition-all duration-[180ms]"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
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
