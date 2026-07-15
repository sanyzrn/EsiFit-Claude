import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-config';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-app hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-teal-600 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold">
                Esi<span className="text-orange-500">Fit</span>
              </span>
            </div>
            <p className="text-sm text-fg-subtle">
              {t({
                en: 'Your complete fitness platform for training, nutrition, and coaching.',
                fa: 'پلتفرم جامع تناسب اندام شما برای تمرین، تغذیه و مربیگری.',
              })}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">{t({ en: 'Platform', fa: 'پلتفرم' })}</h4>
            <div className="space-y-2">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm text-fg-subtle hover:text-fg"
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">{t({ en: 'Resources', fa: 'منابع' })}</h4>
            <div className="space-y-2">
              {SECONDARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm text-fg-subtle hover:text-fg"
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">{t({ en: 'Account', fa: 'حساب کاربری' })}</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-fg-subtle hover:text-fg">
                {t({ en: 'Sign In', fa: 'ورود' })}
              </Link>
              <Link to="/register" className="block text-sm text-fg-subtle hover:text-fg">
                {t({ en: 'Register', fa: 'ثبت‌نام' })}
              </Link>
              <Link to="/dashboard" className="block text-sm text-fg-subtle hover:text-fg">
                {t({ en: 'Dashboard', fa: 'داشبورد' })}
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-fg-faint">
          {t({
            en: `© ${new Date().getFullYear()} EsiFit. All rights reserved. This is a demo platform for educational purposes.`,
            fa: `© ${new Date().getFullYear()} اسی‌فیت. تمامی حقوق محفوظ است. این یک پلتفرم آزمایشی جهت مقاصد آموزشی است.`,
          })}
        </div>
      </div>
    </footer>
  );
}
