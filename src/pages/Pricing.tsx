import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { PLANS, getState, subscribe } from '@/lib/store';
import type { SubscriptionTier } from '@/lib/types';
import { useI18n, faDict } from '@/lib/i18n';
import { useEntitlements } from '@/lib/entitlements';

export default function Pricing() {
  const { t } = useI18n();
  const [state, setState] = useState(getState());
  const navigate = useNavigate();
  const { subscriptionTier } = useEntitlements();
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const user = state.currentUser;

  const handleSubscribe = (_tier: SubscriptionTier) => {
    if (!user) {
      navigate('/register');
      return;
    }
    // Phase 3: real payment flow. Tier changes require server-side entitlement write.
    navigate('/dashboard/billing');
  };

  const tierIcons: Record<string, React.ReactNode> = {
    FREE: <Zap className="w-6 h-6" />,
    ECONOMY: <Star className="w-6 h-6" />,
    VIP: <Crown className="w-6 h-6" />,
    ELITE: <Crown className="w-6 h-6" />,
  };

  const tierColors: Record<string, string> = {
    FREE: 'border-gray-700',
    ECONOMY: 'border-blue-500/30',
    VIP: 'border-orange-500/50 ring-2 ring-orange-500/20',
    ELITE: 'border-purple-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Choose Your Plan', fa: 'طرح خود را انتخاب کنید' })}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {t({ en: 'Start free, upgrade anytime. All plans include access to our calculator suite and exercise library.', fa: 'رایگان شروع کنید، هر زمان خواستید ارتقا دهید. همه طرح‌ها شامل دسترسی به ماشین‌حساب‌ها و کتابخانه حرکات ورزشی است.' })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {PLANS.map(plan => {
          const isCurrent = subscriptionTier === plan.tier;
          const isPopular = plan.tier === 'VIP';

          return (
            <div
              key={plan.id}
              className={`relative bg-gray-900 border rounded-2xl p-6 flex flex-col ${tierColors[plan.tier]} ${
                isPopular ? 'lg:-mt-4 lg:mb-4' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                  {t({ en: 'MOST POPULAR', fa: 'پرطرفدارترین' })}
                </div>
              )}
              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                  plan.tier === 'VIP' ? 'bg-orange-500/20 text-orange-400' :
                  plan.tier === 'ELITE' ? 'bg-purple-500/20 text-purple-400' :
                  plan.tier === 'ECONOMY' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {tierIcons[plan.tier]}
                </div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 flex-row-reverse">
                  <span className="text-4xl font-black text-white">
                    ${(plan.priceMonthly / 100).toFixed(plan.priceMonthly === 0 ? 0 : 2)}
                  </span>
                  {plan.priceMonthly > 0 && <span className="text-gray-400 text-sm">/{t({ en: 'mo', fa: 'ماه' })}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">
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
                disabled={isCurrent}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${
                  isCurrent
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : isPopular
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {isCurrent ? t({ en: 'Current Plan', fa: 'طرح فعلی' }) : plan.priceMonthly === 0 ? t({ en: 'Get Started Free', fa: 'شروع رایگان' }) : t({ en: 'Subscribe Now', fa: 'هم‌اکنون مشترک شوید' })}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black">{t({ en: 'Feature Comparison', fa: 'مقایسه امکانات' })}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left rtl:text-right p-4 font-medium text-gray-400">{t({ en: 'Feature', fa: 'ویژگی' })}</th>
                <th className="p-4 text-center font-medium text-gray-400">{t({ en: 'Free', fa: 'رایگان' })}</th>
                <th className="p-4 text-center font-medium text-gray-400">{t({ en: 'Economy', fa: 'اقتصادی' })}</th>
                <th className="p-4 text-center font-medium text-orange-400">VIP</th>
                <th className="p-4 text-center font-medium text-purple-400">Elite</th>
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
                <tr key={row.feature} className="border-b border-gray-800 last:border-0">
                  <td className="p-4 font-medium">{row.feature}</td>
                  {[row.free, row.economy, row.vip, row.elite].map((val, i) => (
                    <td key={i} className="p-4 text-center">
                      {val === true ? <Check className="w-5 h-5 text-green-400 mx-auto" /> :
                       val === false ? <span className="text-gray-600">—</span> :
                       <span className="text-gray-300">{val}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
