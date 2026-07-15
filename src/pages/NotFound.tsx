import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Dumbbell } from 'lucide-react';

export default function NotFound() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
        <Dumbbell className="w-10 h-10 text-orange-500" />
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
        className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
      >
        {t({ en: 'Go Home', fa: 'بازگشت به خانه' })}
      </Link>
    </div>
  );
}
