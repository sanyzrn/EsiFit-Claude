import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Dumbbell } from 'lucide-react';

export default function NotFound() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-brand-muted rounded-[20px] flex items-center justify-center mb-6">
        <Dumbbell className="w-10 h-10 text-brand" />
      </div>
      <h1 className="text-6xl font-black mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6">
        {t({ en: 'Page Not Found', fa: 'صفحه پیدا نشد' })}
      </h2>
      <p className="text-fg-subtle max-w-md mb-8">
        {t({ 
          en: "The page you're looking for doesn't exist or has been moved.", 
          fa: 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.' 
        })}
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-brand text-brand-fg font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]"
      >
        {t({ en: 'Go Home', fa: 'بازگشت به خانه' })}
      </Link>
    </div>
  );
}
