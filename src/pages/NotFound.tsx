import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Dumbbell, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
        <Dumbbell className="w-10 h-10" style={{ color: 'var(--theme-primary)' }} />
      </div>
      <h1 className="text-8xl font-black mb-4 font-display" style={{ color: 'var(--theme-primary)' }}>
        404
      </h1>
      <h2 className="text-2xl font-bold mb-4 font-display">
        {t({ en: 'Page Not Found', fa: 'صفحه پیدا نشد' })}
      </h2>
      <p className="text-base mb-8 max-w-md" style={{ color: 'var(--theme-fg-subtle)' }}>
        {t({
          en: "The page you're looking for doesn't exist or has been moved.",
          fa: 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.',
        })}
      </p>
      <Link to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-[180ms]"
        style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
        <ArrowLeft className="w-4 h-4" />
        {t({ en: 'Back to Home', fa: 'بازگشت به صفحه اصلی' })}
      </Link>
    </div>
  );
}
