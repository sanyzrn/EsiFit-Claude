import { Link, useParams, useNavigate } from 'react-router-dom';
import { Apple, Lock, UtensilsCrossed, ArrowRight, Zap } from 'lucide-react';
import { DIET_PLANS } from '@/lib/store';
import { hasTierAccess } from '@/lib/types';
import TierGate from '@/components/TierGate';
import { useI18n } from '@/lib/i18n';
import { localizedDietPlan } from '@/lib/content-i18n';
import { useEntitlements } from '@/lib/entitlements';
import { dietImage } from '@/lib/media';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

export function DietList() {
  const { t, lang } = useI18n();
  const { subscriptionTier } = useEntitlements();
  const userTier = subscriptionTier;

  return (
    <PageContainer>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)', border: '1px solid var(--theme-border-accent)' }}>
          <Zap className="w-3.5 h-3.5" />
          {t({ en: 'Nutrition Plans', fa: 'برنامه‌های تغذیه' })}
        </div>
        <h1 className="text-5xl font-black mb-3 font-display">
          {t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' })}
        </h1>
        <p className="text-lg" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: 'Calorie-calculated meal plans with macros broken down per meal.', fa: 'برنامه‌های غذایی با کالری محاسبه‌شده و درشت‌مغذی‌ها برای هر وعده.' })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DIET_PLANS.map(plan => {
          const locked = !hasTierAccess(userTier, plan.requiredTier);
          const copy = localizedDietPlan(plan, lang);
          const img = dietImage(plan.slug);
          return (
            <Link key={plan.id} to={`/diet/${plan.slug}`}
              className="group card-premium overflow-hidden p-0 transition-all duration-[280ms]">
              <div className="h-48 relative overflow-hidden">
                {img ? (
                  <img src={img.src} alt={t(img.alt)} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary-dim), color-mix(in srgb, var(--theme-accent) 15%, var(--theme-surface)))' }}>
                    <Apple className="w-16 h-16" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--theme-surface), transparent 50%)' }} />
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-surface) 70%, transparent)' }}>
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--theme-primary)' }} />
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>
                        {plan.requiredTier}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 font-display group-hover:translate-x-0.5 transition-transform">{copy.title}</h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--theme-fg-subtle)' }}>{copy.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{plan.totalCalories} {t({ en: 'kcal', fa: 'کالری' })}</span>
                  <span style={{ color: 'var(--theme-fg-subtle)' }}>{plan.meals.length} {t({ en: 'meals', fa: 'وعده' })}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}

export function DietDetail() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { subscriptionTier } = useEntitlements();
  const userTier = subscriptionTier;

  const plan = DIET_PLANS.find(p => p.slug === slug);
  if (!plan) {
    return (
      <PageContainer className="text-center py-20">
        <Breadcrumbs items={[
          { label: t({ en: 'Diet', fa: 'تغذیه' }), href: '/diet' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-2">{t({ en: 'Diet plan not found', fa: 'برنامه غذایی یافت نشد' })}</h1>
        <button onClick={() => navigate('/diet')} className="text-sm font-semibold"
          style={{ color: 'var(--theme-primary)' }}>
          {t({ en: '← Back to diet plans', fa: 'بازگشت به برنامه‌های غذایی' })}
        </button>
      </PageContainer>
    );
  }

  const copy = localizedDietPlan(plan, lang);
  const hasAccess = hasTierAccess(userTier, plan.requiredTier);
  const totalMacros = plan.meals.reduce((acc, m) => ({
    protein: acc.protein + (m.macros?.protein || 0),
    carbs: acc.carbs + (m.macros?.carbs || 0),
    fat: acc.fat + (m.macros?.fat || 0),
  }), { protein: 0, carbs: 0, fat: 0 });

  return (
    <PageContainer padY="md">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[
          { label: t({ en: 'Diet', fa: 'تغذیه' }), href: '/diet' },
          { label: copy.title },
        ]} />

        <div className="card-premium p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-black mb-4 font-display">{copy.title}</h1>
          <p className="text-base mb-6" style={{ color: 'var(--theme-fg-subtle)' }}>{copy.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--theme-primary)' }}>
                {t({ en: 'Total Calories', fa: 'کالری کل' })}
              </div>
              <div className="text-2xl font-black font-display">{plan.totalCalories}</div>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--theme-secondary-dim)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--theme-secondary)' }}>{t({ en: 'Protein', fa: 'پروتئین' })}</div>
              <div className="text-lg font-bold">{totalMacros.protein}g</div>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-warning) 12%, transparent)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--theme-warning)' }}>{t({ en: 'Carbs', fa: 'کربوهیدرات' })}</div>
              <div className="text-lg font-bold">{totalMacros.carbs}g</div>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--theme-accent-dim)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--theme-accent)' }}>{t({ en: 'Fat', fa: 'چربی' })}</div>
              <div className="text-lg font-bold">{totalMacros.fat}g</div>
            </div>
          </div>
        </div>

        {hasAccess ? (
          <div className="space-y-4">
            {plan.meals.map((meal, i) => (
              <div key={meal.id || i} className="card-premium p-5 animate-slide-up-children">
                <div className="flex items-center gap-3 mb-4">
                  <UtensilsCrossed className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  <h3 className="font-bold font-display">{meal.name}</h3>
                  {meal.macros && (
                    <div className="ml-auto text-xs flex gap-3" style={{ color: 'var(--theme-fg-subtle)' }}>
                      <span>{meal.macros.protein}g P</span>
                      <span>{meal.macros.carbs}g C</span>
                      <span>{meal.macros.fat}g F</span>
                    </div>
                  )}
                </div>
                {meal.foods && meal.foods.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {meal.foods.map((food, fi) => (
                      <span key={fi} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg-muted)' }}>
                        {food}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <TierGate minTier={plan.requiredTier}>
            <div className="space-y-4">
              {plan.meals.slice(0, 1).map((meal, i) => (
                <div key={i} className="card-premium p-5">
                  <h3 className="font-bold mb-2">{meal.name}</h3>
                </div>
              ))}
            </div>
          </TierGate>
        )}
      </div>
    </PageContainer>
  );
}
