import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell, User, LogOut, ChevronDown, LayoutDashboard, Shield, GraduationCap, Globe, Sun, Moon } from 'lucide-react';
import { getState, logout, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useEntitlements } from '@/lib/entitlements';

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(getState());
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { role, subscriptionTier } = useEntitlements();
  const [menusPath, setMenusPath] = useState(location.pathname);

  useEffect(() => { const unsub = subscribe(() => setState(getState())); return () => { unsub(); }; }, []);

  if (menusPath !== location.pathname) {
    setMenusPath(location.pathname);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
  }

  const user = state.currentUser;

  const navLinks = [
    { href: '/exercises', label: t({ en: 'Exercises', fa: 'حرکات تمرینی' }) },
    { href: '/programs', label: t({ en: 'Programs', fa: 'برنامه‌های تمرینی' }) },
    { href: '/diet', label: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }) },
    { href: '/calculators', label: t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' }) },
    { href: '/blog', label: t({ en: 'Blog', fa: 'مقالات' }) },
    { href: '/pricing', label: t({ en: 'Pricing', fa: 'تعرفه‌ها' }) },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-app text-fg flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-app/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Esi<span className="text-orange-500">Fit</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 min-w-0">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.href)
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-fg-muted hover:text-fg hover:bg-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu & Lang Switcher */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-elevated transition-colors text-fg-muted"
                aria-label={theme === 'dark'
                  ? t({ en: 'Switch to light theme', fa: 'تغییر به تم روشن' })
                  : t({ en: 'Switch to dark theme', fa: 'تغییر به تم تیره' })}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-elevated transition-colors text-fg-muted"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase">{lang}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute end-0 top-12 w-32 bg-surface border border-strong rounded-xl shadow-xl py-2 animate-fade-in">
                    <button onClick={() => { setLang('en'); setLangMenuOpen(false); }} className={`w-full text-start px-4 py-2 text-sm transition-colors ${lang === 'en' ? 'text-orange-400 bg-elevated' : 'hover:bg-elevated'}`}>English</button>
                    <button onClick={() => { setLang('fa'); setLangMenuOpen(false); }} className={`w-full text-start px-4 py-2 text-sm transition-colors ${lang === 'fa' ? 'text-orange-400 bg-elevated' : 'hover:bg-elevated'}`}>فارسی</button>
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">
                      {subscriptionTier}
                    </span>
                    <ChevronDown className="w-4 h-4 text-fg-subtle" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute end-0 top-12 w-56 bg-surface border border-strong rounded-xl shadow-xl py-2 animate-fade-in">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> {t({ en: 'Dashboard', fa: 'داشبورد' })}
                      </Link>
                      <Link to="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors">
                        <User className="w-4 h-4" /> {t({ en: 'Profile', fa: 'پروفایل' })}
                      </Link>
                      {role === 'COACH' && (
                        <Link to="/coach" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors text-orange-400">
                          <GraduationCap className="w-4 h-4" /> {t({ en: 'Coach Dashboard', fa: 'داشبورد مربی' })}
                        </Link>
                      )}
                      {role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors text-orange-400">
                          <Shield className="w-4 h-4" /> {t({ en: 'Admin Panel', fa: 'پنل مدیریت' })}
                        </Link>
                      )}
                      <hr className="my-2 border-strong" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-elevated transition-colors">
                        <LogOut className="w-4 h-4" /> {t({ en: 'Sign Out', fa: 'خروج' })}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg transition-colors">
                    {t({ en: 'Sign In', fa: 'ورود' })}
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                    {t({ en: 'Get Started', fa: 'شروع کنید' })}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 hover:bg-elevated rounded-lg">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-app animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-elevated transition-colors text-fg-muted"
                  aria-label={theme === 'dark'
                    ? t({ en: 'Switch to light theme', fa: 'تغییر به تم روشن' })
                    : t({ en: 'Switch to dark theme', fa: 'تغییر به تم تیره' })}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === 'en' ? 'bg-orange-500/20 text-orange-400' : 'text-fg-subtle hover:bg-elevated'}`}>EN</button>
                <button onClick={() => setLang('fa')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === 'fa' ? 'bg-orange-500/20 text-orange-400' : 'text-fg-subtle hover:bg-elevated'}`}>FA</button>
              </div>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname.startsWith(link.href)
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-fg-muted hover:bg-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border my-2" />
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-fg-muted hover:bg-elevated">
                    {t({ en: 'Dashboard', fa: 'داشبورد' })}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-start px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-elevated">
                    {t({ en: 'Sign Out', fa: 'خروج' })}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-fg-muted hover:bg-elevated">
                    {t({ en: 'Sign In', fa: 'ورود' })}
                  </Link>
                  <Link to="/register" className="block px-3 py-2 rounded-lg text-sm font-bold text-orange-400 hover:bg-elevated">
                    {t({ en: 'Get Started', fa: 'شروع کنید' })}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-app">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-extrabold">Esi<span className="text-orange-500">Fit</span></span>
              </div>
              <p className="text-sm text-fg-subtle">{t({ en: 'Your complete fitness platform for training, nutrition, and coaching.', fa: 'پلتفرم جامع تناسب اندام شما برای تمرین، تغذیه و مربیگری.' })}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t({ en: 'Platform', fa: 'پلتفرم' })}</h4>
              <div className="space-y-2">
                <Link to="/exercises" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Exercises', fa: 'حرکات تمرینی' })}</Link>
                <Link to="/programs" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Programs', fa: 'برنامه‌ها' })}</Link>
                <Link to="/diet" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' })}</Link>
                <Link to="/calculators" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' })}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t({ en: 'Resources', fa: 'منابع' })}</h4>
              <div className="space-y-2">
                <Link to="/blog" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Blog', fa: 'مقالات' })}</Link>
                <Link to="/pricing" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Pricing', fa: 'تعرفه‌ها' })}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t({ en: 'Account', fa: 'حساب کاربری' })}</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Sign In', fa: 'ورود' })}</Link>
                <Link to="/register" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Register', fa: 'ثبت‌نام' })}</Link>
                <Link to="/dashboard" className="block text-sm text-fg-subtle hover:text-fg">{t({ en: 'Dashboard', fa: 'داشبورد' })}</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-fg-faint">
            {t({ en: `© ${new Date().getFullYear()} EsiFit. All rights reserved. This is a demo platform for educational purposes.`, fa: `© ${new Date().getFullYear()} اسی‌فیت. تمامی حقوق محفوظ است. این یک پلتفرم آزمایشی جهت مقاصد آموزشی است.` })}
          </div>
        </div>
      </footer>
    </div>
  );
}
