import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Apple, Lock, UtensilsCrossed } from 'lucide-react';
import { DIET_PLANS } from '@/lib/store';
import { hasTierAccess } from '@/lib/types';
import TierGate from '@/components/TierGate';
import { useI18n } from '@/lib/i18n';
import { localizedDietPlan } from '@/lib/content-i18n';
import { useEntitlements } from '@/lib/entitlements';
import { dietImage } from '@/lib/media';

export function DietList() {
  const { t, lang } = useI18n();
  const { subscriptionTier } = useEntitlements();
  const userTier = subscriptionTier;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' })}</h1>
        <p className="text-fg-subtle text-lg">{t({ en: 'Calorie-calculated meal plans with macros broken down per meal.', fa: 'برنامه‌های غذایی با کالری محاسبه‌شده و درشت‌مغذی‌ها برای هر وعده.' })}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DIET_PLANS.map(plan => {
          const locked = !hasTierAccess(userTier, plan.requiredTier);
          const copy = localizedDietPlan(plan, lang);
          const img = dietImage(plan.slug);
          return (
            <Link
              key={plan.id}
              to={`/diet/${plan.slug}`}
              className="group card-iranian overflow-hidden hover:border-accent/40 transition-all relative p-0"
            >
              <div className="h-48 relative overflow-hidden">
                {img ? (
                  <img
                    src={img.src}
                    alt={t(img.alt)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full bg-accent-muted flex items-center justify-center">
                    <Apple className="w-16 h-16 text-accent/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                {locked && (
                  <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-brand mx-auto mb-2" />
                      <span className="text-xs font-bold text-brand bg-brand-muted px-3 py-1 rounded-full">{plan.requiredTier} {t({ en: 'Required', fa: 'مورد نیاز' })}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors font-display">{copy.title}</h3>
                <p className="text-fg-subtle text-sm mb-4 line-clamp-2">{copy.description}</p>
                <div className="flex items-center gap-4 text-sm text-fg-subtle">
                  <span className="text-brand font-bold">{plan.totalCalories} {t({ en: 'kcal', fa: 'کالری' })}</span>
                  <span>{plan.meals.length} {t({ en: 'meals', fa: 'وعده' })}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Diet plan not found', fa: 'برنامه غذایی یافت نشد' })}</h1>
        <button onClick={() => navigate('/diet')} className="text-orange-400">← {t({ en: 'Back to diet plans', fa: 'بازگشت به برنامه‌های غذایی' })}</button>
      </div>
    );
  }

  const hasAccess = hasTierAccess(userTier, plan.requiredTier);
  const copy = localizedDietPlan(plan, lang);

  const totalMacros = plan.meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealContent = (
    <div className="space-y-6">
      {copy.meals.map(meal => {
        const mealTotals = meal.items.reduce((a, i) => ({
          calories: a.calories + i.calories,
          protein: a.protein + i.protein,
          carbs: a.carbs + i.carbs,
          fat: a.fat + i.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return (
          <div key={meal.id} className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold">{meal.name}</h3>
              </div>
              <span className="text-sm text-orange-400 font-bold">{Math.round(mealTotals.calories)} kcal</span>
            </div>
            <div className="divide-y divide-border">
              {meal.items.map(item => (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{item.foodName}</div>
                    <div className="text-xs text-fg-subtle">{item.grams}g</div>
                  </div>
                  <div className="flex gap-4 text-xs text-fg-subtle">
                    <span>{Math.round(item.calories)} cal</span>
                    <span className="text-blue-400">P: {Math.round(item.protein)}g</span>
                    <span className="text-green-400">C: {Math.round(item.carbs)}g</span>
                    <span className="text-yellow-400">F: {Math.round(item.fat)}g</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-elevated/50 flex justify-between text-xs font-medium">
              <span className="text-fg-subtle">Meal Total</span>
              <div className="flex gap-4">
                <span className="text-blue-400">P: {Math.round(mealTotals.protein)}g</span>
                <span className="text-green-400">C: {Math.round(mealTotals.carbs)}g</span>
                <span className="text-yellow-400">F: {Math.round(mealTotals.fat)}g</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/diet')} className="flex items-center gap-2 text-fg-subtle hover:text-fg transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t({ en: 'Back to Diet Plans', fa: 'بازگشت به برنامه‌های غذایی' })}
      </button>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <h1 className="text-3xl font-black mb-4">{copy.title}</h1>
        <p className="text-fg-subtle leading-relaxed mb-6">{copy.description}</p>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-orange-400">{Math.round(totalMacros.calories)}</div>
            <div className="text-xs text-fg-subtle">{t({ en: 'Total Calories', fa: 'کل کالری' })}</div>
          </div>
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-400">{Math.round(totalMacros.protein)}g</div>
            <div className="text-xs text-fg-subtle">{t({ en: 'Protein', fa: 'پروتئین' })}</div>
          </div>
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{Math.round(totalMacros.carbs)}g</div>
            <div className="text-xs text-fg-subtle">{t({ en: 'Carbs', fa: 'کربوهیدرات' })}</div>
          </div>
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{Math.round(totalMacros.fat)}g</div>
            <div className="text-xs text-fg-subtle">{t({ en: 'Fat', fa: 'چربی' })}</div>
          </div>
        </div>
      </div>

      {hasAccess ? mealContent : (
        <TierGate minTier={plan.requiredTier}>
          {mealContent}
        </TierGate>
      )}
    </div>
  );
}
