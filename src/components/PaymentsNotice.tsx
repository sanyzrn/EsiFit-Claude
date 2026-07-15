import { Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function PaymentsNotice() {
  const { t } = useI18n();

  return (
    <div className="mb-8 flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-fg-muted">
      <Info className="w-5 h-5 shrink-0 mt-0.5 text-warning" />
      <p>
        {t({
          en: 'Paid subscriptions are not live yet. Stripe checkout will unlock when payment processing is configured. Your current plan always comes from your account — never from local storage.',
          fa: 'اشتراک‌های پولی هنوز فعال نیستند. پرداخت Stripe پس از پیکربندی فعال می‌شود. طرح فعلی شما همیشه از حساب کاربری می‌آید — نه از حافظه محلی.',
        })}
      </p>
    </div>
  );
}
