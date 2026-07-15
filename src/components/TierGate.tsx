import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { hasTierAccess, type SubscriptionTier } from '@/lib/types';
import { useEntitlements } from '@/lib/entitlements';
import { useI18n } from '@/lib/i18n';

interface TierGateProps {
  minTier: SubscriptionTier;
  children: ReactNode;
  showBlur?: boolean;
}

const TIER_LABELS: Record<SubscriptionTier, { en: string; fa: string }> = {
  FREE: { en: 'Free', fa: 'رایگان' },
  ECONOMY: { en: 'Economy', fa: 'اقتصادی' },
  VIP: { en: 'VIP', fa: 'ویژه' },
  ELITE: { en: 'Elite', fa: 'الیت' },
};

export default function TierGate({ minTier, children, showBlur = true }: TierGateProps) {
  const { subscriptionTier, loading } = useEntitlements();
  const { t } = useI18n();
  const tierLabel = t(TIER_LABELS[minTier]);

  if (loading) {
    return showBlur ? (
      <div className="relative min-h-[12rem] flex items-center justify-center">
        <div className="text-gray-400 text-sm">{t({ en: 'Loading access…', fa: 'در حال بررسی دسترسی…' })}</div>
      </div>
    ) : null;
  }

  if (hasTierAccess(subscriptionTier, minTier)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[12rem] flex items-center justify-center">
      {showBlur && (
        <div
          className="absolute inset-0 rounded-xl border border-dashed border-gray-800 bg-gray-900/70"
          aria-hidden="true"
        />
      )}
      <div
        className="relative z-10 bg-gray-900/95 border border-gray-700 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl"
        role="region"
        aria-labelledby="tier-gate-title"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 flex items-center justify-center">
          {minTier === 'VIP' || minTier === 'ELITE' ? (
            <Crown className="w-8 h-8 text-orange-400" />
          ) : (
            <Lock className="w-8 h-8 text-orange-400" />
          )}
        </div>
        <h3 id="tier-gate-title" className="text-lg font-bold mb-2">
          {t({ en: `${minTier} Content`, fa: `محتوای ${tierLabel}` })}
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          {t({
            en: `This content requires a ${minTier} subscription or higher. Upgrade now to unlock.`,
            fa: `این محتوا به اشتراک ${tierLabel} یا بالاتر نیاز دارد. برای باز کردن، هم‌اکنون ارتقا دهید.`,
          })}
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Crown className="w-4 h-4" />
          {t({ en: `Upgrade to ${minTier}`, fa: `ارتقا به ${tierLabel}` })}
        </Link>
      </div>
    </div>
  );
}
