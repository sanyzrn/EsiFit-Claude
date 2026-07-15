import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { hasTierAccess, type SubscriptionTier } from '@/lib/types';
import { useEntitlements } from '@/lib/entitlements';
import { useI18n } from '@/lib/i18n';
import { IconBadge } from '@/components/ui/IconBadge';
import { PersianPattern } from '@/components/ui/PersianPattern';
import { Button } from '@/components/ui/Button';

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

const TIER_VARIANT: Record<SubscriptionTier, 'saffron' | 'firuze' | 'terracotta'> = {
  FREE: 'firuze',
  ECONOMY: 'firuze',
  VIP: 'saffron',
  ELITE: 'terracotta',
};

export default function TierGate({ minTier, children, showBlur = true }: TierGateProps) {
  const { subscriptionTier, loading } = useEntitlements();
  const { t } = useI18n();
  const tierLabel = t(TIER_LABELS[minTier]);

  if (loading) {
    return showBlur ? (
      <div className="relative min-h-[12rem] flex items-center justify-center">
        <div className="text-fg-subtle text-sm">{t({ en: 'Loading access…', fa: 'در حال بررسی دسترسی…' })}</div>
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
          className="absolute inset-0 rounded-[20px] border border-dashed border-border bg-surface/70"
          aria-hidden="true"
        />
      )}
      <div
        className="relative z-10 card-iranian p-8 text-center max-w-sm mx-4 overflow-hidden"
        role="region"
        aria-labelledby="tier-gate-title"
      >
        <PersianPattern opacity={0.3} />
        <div className="relative z-10">
          <div className="mb-4 flex justify-center">
            <IconBadge
              icon={minTier === 'VIP' || minTier === 'ELITE' ? Crown : Lock}
              variant={TIER_VARIANT[minTier]}
              size="lg"
            />
          </div>
          <h3 id="tier-gate-title" className="text-lg font-bold mb-2 font-display">
            {t({ en: `${minTier} Content`, fa: `محتوای ${tierLabel}` })}
          </h3>
          <p className="text-fg-subtle text-sm mb-4">
            {t({
              en: `This content requires a ${minTier} subscription or higher. Upgrade now to unlock.`,
              fa: `این محتوا به اشتراک ${tierLabel} یا بالاتر نیاز دارد. برای باز کردن، هم‌اکنون ارتقا دهید.`,
            })}
          </p>
          <Link to="/pricing">
            <Button className="gap-2">
              <Crown className="w-4 h-4" />
              {t({ en: `Upgrade to ${minTier}`, fa: `ارتقا به ${tierLabel}` })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
