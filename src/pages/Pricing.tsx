import { Check, Crown, Zap, Star, Loader2, type LucideIcon, Award, ArrowRight } from 'lucide-react';
import { PLANS, getState, subscribe } from '@/lib/store';
import type { SubscriptionTier } from '@/lib/types';
import { useI18n, faDict } from '@/lib/i18n';
import { useEntitlements } from '@/lib/entitlements';
import { fetchPaymentsEnabled, startCheckout, PaymentsNotConfiguredError } from '@/lib/payments';
import PaymentsNotice from '@/components/PaymentsNotice';
import { IconBadge } from '@/components/ui/IconBadge';
import { PageContainer } from '@/components/ui/PageContainer';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PlanCard({ plan, isCurrent, isPopular, paymentsEnabled, loadingTier, onSubscribe, onNavigate }: {
  plan: typeof PLANS[number]; isCurrent: boolean; isPopular: boolean;
  paymentsEnabled: boolean | null; loadingTier: SubscriptionTier | null;
  onSubscribe: (tier: SubscriptionTier) => void; onNavigate: (path: string) => void;
}) {
  const { t } = useI18n();
  const { formatTomanCompact, formatToman } = useLocaleFormat();
  const isPaid = plan.priceMonthly > 0;
  const checkoutDisabled = isCurrent || (isPaid && paymentsEnabled === false);

  const icons: Record<string, LucideIcon> = { FREE: Zap, ECONOMY: Star, VIP: Crown, ELITE: Crown };
  const Icon = icons[plan.tier] || Zap;
  const accentColor = plan.tier === 'VIP' ? 'var(--theme-primary)' :
    plan.tier === 'ELITE' ? 'var(--theme-accent)' :
    plan.tier === 'ECONOMY' ? 'var(--theme-secondary)' : 'var(--theme-fg-subtle)';

  return (
    <div className={`card-premium p-7 flex flex-col transition-all duration-[280ms] ${
      isPopular ? 'scale-[1.02] border-border-accent' : ''
    }`}>
      {isPopular && (
        <div className="text-xs font-bold mb-4 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 w-fit mx-auto"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>
          <Award className="w-3.5 h-3.5" />
          {t({ en: 'Most Popular', fa: 'پرطرفدارترین' })}
        </div>
      )}

      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}>
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        <h3 className="text-xl font-bold mb-2 font-display">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl md:text-4xl font-black font-display" style={{ color: 'var(--theme-fg)' }}>
            {plan.priceMonthly === 0 ? formatTomanCompact(0) : formatToman(plan.priceMonthly)}
          </span>
          {isPaid && <span className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>/{t({ en: 'mo', fa: 'ماه' })}</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accentColor }} />
            <span style={{ color: 'var(--theme-fg-muted)' }}>
              {t({ en: f, fa: faDict[f] || f })}
            </span>
          </li>
        ))}
      </ul>

      <button onClick={() => onSubscribe(plan.tier)}
        disabled={checkoutDisabled || loadingTier === plan.tier}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-[180ms] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isCurrent ? 'var(--theme-elevated-hover)' : isPopular ? 'var(--theme-primary)' : 'var(--theme-elevated)',
          color: isCurrent ? 'var(--theme-fg-subtle)' : isPopular ? 'var(--theme-primary-fg)' : 'var(--theme-fg)',
        }}>
        {loadingTier === plan.tier && <Loader2 className="w-4 h-4 animate-spin" />}
        {isCurrent ? t({ en: 'Current Plan', fa: 'طرح فعلی' }) :
         plan.priceMonthly === 0 ? t({ en: 'Get Started Free', fa: 'شروع رایگان' }) :
         paymentsEnabled === false ? t({ en: 'Coming Soon', fa: 'به‌زودی' }) :
         t({ en: 'Subscribe', fa: 'اشتراک' })}
      </button>
    </div>
  );
}

export default function Pricing() {
  const { t } = useI18n();
  const { formatToman } = useLocaleFormat();
  const [state, setState] = useState(getState());
  const navigate = useNavigate();
  const { subscriptionTier } = useEntitlements();
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  useEffect(() => { fetchPaymentsEnabled().then(setPaymentsEnabled); }, []);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setNotice('');
    if (tier === 'FREE') {
      setNotice(t({ en: 'Starting free plan...', fa: 'شروع طرح رایگان...' }));
      navigate(state.currentUser ? '/dashboard' : '/register');
      return;
    }
    if (!state.currentUser) {
      setNotice(t({ en: 'Create an account first.', fa: 'ابتدا حساب بسازید.' }));
      navigate('/register');
      return;
    }
    if (!paymentsEnabled) {
      setNotice(t({ en: 'Paid plans coming soon.', fa: 'طرح‌های پولی به‌زودی.' }));
      return;
    }
    setLoadingTier(tier);
    try { await startCheckout(tier); }
    catch (err) {
      if (err instanceof PaymentsNotConfiguredError) setPaymentsEnabled(false);
      else setNotice(err instanceof Error ? err.message : 'Failed');
    } finally { setLoadingTier(null); }
  };

  return (
    <PageContainer>
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)', border: '1px solid var(--theme-border-accent)' }}>
          <Award className="w-3.5 h-3.5" />
          {t({ en: 'Simple Pricing', fa: 'تعرفه‌های ساده' })}
        </div>
        <h1 className="text-5xl font-black mb-4 font-display">
          {t({ en: 'Choose Your Plan', fa: 'طرح خود را انتخاب کنید' })}
        </h1>
        <p className="text-lg mx-auto max-w-xl" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: 'Start free, upgrade anytime. All plans include calculators and exercise library.', fa: 'رایگان شروع کنید، هر زمان ارتقا دهید.' })}
        </p>
      </div>

      {paymentsEnabled === false && <PaymentsNotice />}
      {notice && (
        <div className="mb-8 px-5 py-3 rounded-xl text-sm text-center"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border-accent)' }}>
          {notice}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {PLANS.map(plan => (
          <PlanCard key={plan.tier}
            plan={plan}
            isCurrent={subscriptionTier === plan.tier}
            isPopular={plan.tier === 'VIP'}
            paymentsEnabled={paymentsEnabled}
            loadingTier={loadingTier}
            onSubscribe={handleSubscribe}
            onNavigate={navigate}
          />
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="card-premium overflow-hidden p-0">
        <div className="p-6 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <h2 className="text-2xl font-black font-display">{t({ en: 'Feature Comparison', fa: 'مقایسه امکانات' })}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-4 font-medium" style={{ color: 'var(--theme-fg-subtle)' }}>{t({ en: 'Feature', fa: 'ویژگی' })}</th>
                <th className="p-4 text-center font-medium" style={{ color: 'var(--theme-fg-subtle)' }}>{t({ en: 'Free', fa: 'رایگان' })}</th>
                <th className="p-4 text-center font-medium" style={{ color: 'var(--theme-fg-subtle)' }}>{t({ en: 'Economy', fa: 'اقتصادی' })}</th>
                <th className="p-4 text-center font-medium" style={{ color: 'var(--theme-primary)' }}>VIP</th>
                <th className="p-4 text-center font-medium" style={{ color: 'var(--theme-accent)' }}>Elite</th>
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
              ].map(row => (
                <tr key={row.feature} className="border-b last:border-0" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-4 font-medium">{row.feature}</td>
                  {[row.free, row.economy, row.vip, row.elite].map((val, i) => (
                    <td key={i} className="p-4 text-center">
                      {val === true ? <Check className="w-5 h-5 mx-auto" style={{ color: 'var(--theme-success)' }} /> :
                       val === false ? <span style={{ color: 'var(--theme-fg-faint)' }}>—</span> :
                       <span style={{ color: 'var(--theme-fg-muted)' }}>{val}</span>}
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
