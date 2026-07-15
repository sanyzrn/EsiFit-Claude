import { Check, Crown, Zap, Star, Loader2, type LucideIcon } from 'lucide-react';
import { PLANS, getState, subscribe } from '@/lib/store';
import type { SubscriptionTier } from '@/lib/types';
import { useI18n, faDict } from '@/lib/i18n';
import { useEntitlements } from '@/lib/entitlements';
import { fetchPaymentsEnabled, startCheckout, PaymentsNotConfiguredError } from '@/lib/payments';
import PaymentsNotice from '@/components/PaymentsNotice';
import { IconBadge } from '@/components/ui/IconBadge';
import { PersianPattern } from '@/components/ui/PersianPattern';
import { PageContainer } from '@/components/ui/PageContainer';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const { t } = useI18n();
  const { formatToman, formatTomanCompact } = useLocaleFormat();
  const [state, setState] = useState(getState());
  const navigate = useNavigate();
  const { subscriptionTier } = useEntitlements();
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  useEffect(() => {
    fetchPaymentsEnabled().then(setPaymentsEnabled);
  }, []);

  const user = state.currentUser;

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setNotice('');
    if (tier === 'FREE') {
      setNotice(t({
        en: 'Taking you to get started with the Free plan…',
        fa: 'در حال انتقال برای شروع با طرح رایگان…',
      }));
      navigate(user ? '/dashboard' : '/register');
      return;
    }
    if (!user) {
      setNotice(t({
        en: 'Create an account to subscribe to paid plans.',
        fa: 'برای اشتراک طرح‌های پولی ابتدا حساب بسازید.',
      }));
      navigate('/register');
      return;
    }
    if (!paymentsEnabled) {
      setNotice(t({
        en: 'Paid plans are coming soon. Subscriptions will be available once Stripe checkout is configured.',
        fa: 'طرح‌های پولی به‌زودی فعال می‌شوند. پس از پیکربندی Stripe در دسترس خواهند بود.',
      }));
      return;
    }
    setLoadingTier(tier);
    setNotice(t({
      en: 'Redirecting to secure checkout…',
      fa: 'در حال انتقال به پرداخت امن…',
    }));
    try {
      await startCheckout(tier);
    } catch (err) {
      if (err instanceof PaymentsNotConfiguredError) {
        setPaymentsEnabled(false);
        setNotice(t({
          en: 'Checkout is not available yet. Please try again later.',
          fa: 'پرداخت هنوز در دسترس نیست. لطفاً بعداً تلاش کنید.',
        }));
      } else {
        setNotice(err instanceof Error ? err.message : t({ en: 'Checkout failed', fa: 'پرداخت ناموفق بود' }));
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const tierIconComponents: Record<string, LucideIcon> = {
    FREE: Zap,
    ECONOMY: Star,
    VIP: Crown,
    ELITE: Crown,
  };

  const tierColors: Record<string, string> = {
    FREE: 'border-strong',
    ECONOMY: 'border-accent/30',
    VIP: 'border-brand/50 ring-2 ring-brand/20',
    ELITE: 'border-terracotta/40',
  };

  const tierVariants: Record<string, 'neutral' | 'firuze' | 'saffron' | 'terracotta'> = {
    FREE: 'neutral',
    ECONOMY: 'firuze',
    VIP: 'saffron',
    ELITE: 'terracotta',
  };

  const paidButtonLabel = (plan: typeof PLANS[number], isCurrent: boolean) => {
    if (isCurrent) return t({ en: 'Current Plan', fa: 'طرح فعلی' });
    if (plan.priceMonthly === 0) return t({ en: 'Get Started Free', fa: 'شروع رایگان' });
    if (paymentsEnabled === false) return t({ en: 'Coming Soon', fa: 'به‌زودی' });
    return t({ en: 'Subscribe Now', fa: 'هم‌اکنون مشترک شوید' });
  };

  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Choose Your Plan', fa: 'طرح خود را انتخاب کنید' })}</h1>
        <p className="text-fg-subtle text-lg max-w-2xl mx-auto">
          {t({ en: 'Start free, upgrade anytime. All plans include access to our calculator suite and exercise library.', fa: 'رایگان شروع کنید، هر زمان خواستید ارتقا دهید. همه طرح‌ها شامل دسترسی به ماشین‌حساب‌ها و کتابخانه حرکات ورزشی است.' })}
        </p>
      </div>

      {paymentsEnabled === false && <PaymentsNotice />}

      {notice && (
        <div role="status" aria-live="polite" className="mb-8 rounded-xl border border-brand/30 bg-brand-muted px-4 py-3 text-sm text-fg text-center">
          {notice}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {PLANS.map(plan => {
          const isCurrent = subscriptionTier === plan.tier;
          const isPopular = plan.tier === 'VIP';
          const isPaid = plan.priceMonthly > 0;
          const checkoutDisabled = isCurrent || (isPaid && paymentsEnabled === false);

          return (
            <div
              key={plan.id}
              className={`relative card-iranian p-6 flex flex-col overflow-hidden ${tierColors[plan.tier]} ${
                isPopular ? 'lg:-mt-4 lg:mb-4' : ''
              }`}
            >
              <PersianPattern opacity={isPopular ? 0.35 : 0.2} />
              <div className="relative z-10 flex flex-col flex-1">
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-brand text-[#1a1410] text-xs font-bold rounded-full whitespace-nowrap">
                  {t({ en: 'MOST POPULAR', fa: 'پرطرفدارترین' })}
                </div>
              )}
              <div className="text-center mb-6 mt-2">
                <div className="mb-3 flex justify-center">
                  <IconBadge icon={tierIconComponents[plan.tier]} variant={tierVariants[plan.tier]} />
                </div>
                <h3 className="text-xl font-bold mb-1 font-display">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 flex-wrap">
                  <span className="text-2xl md:text-3xl font-black text-fg font-display">
                    {plan.priceMonthly === 0
                      ? formatTomanCompact(0)
                      : formatToman(plan.priceMonthly)}
                  </span>
                  {plan.priceMonthly > 0 && (
                    <span className="text-fg-subtle text-sm">/{t({ en: 'mo', fa: 'ماه' })}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-fg-muted">
                      {t({
                        en: f,
                        fa: faDict[f] || f
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={checkoutDisabled || loadingTier === plan.tier}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-elevated-hover text-fg-subtle cursor-not-allowed'
                    : checkoutDisabled
                    ? 'bg-elevated text-fg-faint cursor-not-allowed border border-strong'
                    : isPopular
                    ? 'gradient-brand text-[#1a1410] hover:brightness-110'
                    : 'bg-elevated text-fg hover:bg-elevated-hover border border-strong'
                }`}
              >
                {loadingTier === plan.tier && <Loader2 className="w-4 h-4 animate-spin" />}
                {paidButtonLabel(plan, isCurrent)}
              </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-black">{t({ en: 'Feature Comparison', fa: 'مقایسه امکانات' })}</h2>
        </div>
        <div className="overflow-x-auto max-w-full min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left rtl:text-right p-4 font-medium text-fg-subtle">{t({ en: 'Feature', fa: 'ویژگی' })}</th>
                <th className="p-4 text-center font-medium text-fg-subtle">{t({ en: 'Free', fa: 'رایگان' })}</th>
                <th className="p-4 text-center font-medium text-fg-subtle">{t({ en: 'Economy', fa: 'اقتصادی' })}</th>
                <th className="p-4 text-center font-medium text-brand">VIP</th>
                <th className="p-4 text-center font-medium text-terracotta">Elite</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های تناسب اندام' }), free: true, economy: true, vip: true, elite: true },
                { feature: t({ en: 'Exercise Library', fa: 'کتابخانه حرکات' }), free: true, economy: true, vip: true, elite: true },
                { feature: t({ en: 'Generic Programs', fa: 'برنامه‌های عمومی' }), free: '1', economy: t({ en: 'All', fa: 'همه' }), vip: t({ en: 'All', fa: 'همه' }), elite: t({ en: 'All', fa: 'همه' }) },
                { feature: t({ en: 'Goal-Matched Programs', fa: 'برنامه‌های متناسب با هدف' }), free: false, economy: true, vip: true, elite: true },
                { feature: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }), free: '1', economy: t({ en: 'All', fa: 'همه' }), vip: t({ en: 'Custom', fa: 'سفارشی' }), elite: t({ en: 'Custom', fa: 'سفارشی' }) },
                { feature: t({ en: 'Progress Tracking', fa: 'پیگیری پیشرفت' }), free: false, economy: true, vip: true, elite: true },
                { feature: t({ en: 'Support', fa: 'پشتیبانی' }), free: false, economy: t({ en: 'Tickets', fa: 'تیکت' }), vip: t({ en: 'Coach Chat', fa: 'چت با مربی' }), elite: t({ en: 'Priority', fa: 'اولویت‌دار' }) },
                { feature: t({ en: 'Coach Review', fa: 'بررسی توسط مربی' }), free: false, economy: false, vip: true, elite: true },
                { feature: t({ en: '1-on-1 Coaching', fa: 'مربیگری ۱ به ۱' }), free: false, economy: false, vip: false, elite: true },
                { feature: t({ en: 'Weekly Adjustments', fa: 'تغییرات هفتگی' }), free: false, economy: false, vip: false, elite: true },
              ].map(row => (
                <tr key={row.feature} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{row.feature}</td>
                  {[row.free, row.economy, row.vip, row.elite].map((val, i) => (
                    <td key={i} className="p-4 text-center">
                      {val === true ? <Check className="w-5 h-5 text-success mx-auto" /> :
                       val === false ? <span className="text-fg-faint">—</span> :
                       <span className="text-fg-muted">{val}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
