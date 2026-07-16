import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-config';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}>
                <Dumbbell className="w-5 h-5" style={{ color: 'var(--theme-primary-fg)' }} />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Esi<span style={{ color: 'var(--theme-primary)' }}>Fit</span>
              </span>
            </Link>
            <p className="text-sm max-w-xs" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({
                en: 'Your complete fitness platform for training, nutrition, and coaching.',
                fa: 'پلتفرم جامع تناسب اندام شما برای تمرین، تغذیه و مربیگری.',
              })}
            </p>
            <div className="flex gap-3 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-[180ms] cursor-pointer"
                  style={{ backgroundColor: 'var(--theme-elevated)' }}>
                  <div className="w-3.5 h-3.5 rounded-sm" style={{
                    backgroundColor: ['var(--theme-primary)', 'var(--theme-accent)', 'var(--theme-secondary)', 'var(--theme-warning)'][i]
                  }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">{t({ en: 'Platform', fa: 'پلتفرم' })}</h4>
            <div className="space-y-3">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm transition-all duration-[180ms]"
                  style={{ color: 'var(--theme-fg-subtle)' }}
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">{t({ en: 'Resources', fa: 'منابع' })}</h4>
            <div className="space-y-3">
              {SECONDARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm transition-all duration-[180ms]"
                  style={{ color: 'var(--theme-fg-subtle)' }}
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">{t({ en: 'Account', fa: 'حساب کاربری' })}</h4>
            <div className="space-y-3">
              {[
                { href: '/login', label: t({ en: 'Sign In', fa: 'ورود' }) },
                { href: '/register', label: t({ en: 'Register', fa: 'ثبت‌نام' }) },
                { href: '/dashboard', label: t({ en: 'Dashboard', fa: 'داشبورد' }) },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm transition-all duration-[180ms]"
                  style={{ color: 'var(--theme-fg-subtle)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm" style={{ color: 'var(--theme-fg-faint)' }}>
          {t({
            en: `© ${new Date().getFullYear()} EsiFit. All rights reserved.`,
            fa: `© ${new Date().getFullYear()} اسی‌فیت. تمامی حقوق محفوظ است.`,
          })}
        </div>
      </div>
    </footer>
  );
}
