import { useState, useEffect, Suspense } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calculator, Zap, Activity, Brain, Droplets, Heart, Flame, Weight, Ruler, Target, Dumbbell, Timer, ArrowRight } from 'lucide-react';
import { subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { CALC_COMPONENTS } from '@/components/calculators/lazy';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

const CALC_ICONS: Record<string, typeof Calculator> = {
  bmi: Activity, 'body-fat': Droplets, tdee: Flame, macros: Calculator,
  'one-rep-max': Dumbbell, ffmi: Weight, whr: Ruler, 'water-intake': Droplets,
  'goal-date': Timer, 'calories-burned': Flame, 'body-type-quiz': Brain,
  'volume-load': Target, bmr: Heart, 'rep-max-table': Dumbbell,
};

function useCalculators() {
  const { t } = useI18n();
  return [
    { slug: 'bmi', name: t({ en: 'BMI Calculator', fa: 'ماشین‌حساب شاخص توده بدنی' }), desc: t({ en: 'Calculate your Body Mass Index based on height and weight.', fa: 'شاخص توده بدنی خود را بر اساس قد و وزن محاسبه کنید.' }) },
    { slug: 'body-fat', name: t({ en: 'Body Fat % Calculator', fa: 'ماشین‌حساب درصد چربی بدن' }), desc: t({ en: 'Estimate body fat percentage using the US Navy method.', fa: 'تخمین درصد چربی بدن با استفاده از فرمول نیروی دریایی آمریکا.' }) },
    { slug: 'tdee', name: t({ en: 'TDEE Calculator', fa: 'ماشین‌حساب کالری مصرفی (TDEE)' }), desc: t({ en: 'Find your Total Daily Energy Expenditure.', fa: 'مجموع انرژی مصرفی روزانه خود را بیابید.' }) },
    { slug: 'macros', name: t({ en: 'Macros Calculator', fa: 'ماشین‌حساب درشت‌مغذی‌ها' }), desc: t({ en: 'Get personalized macronutrient targets.', fa: 'اهداف درشت‌مغذی خود را به صورت شخصی‌سازی‌شده دریافت کنید.' }) },
    { slug: 'one-rep-max', name: t({ en: 'One-Rep Max Calculator', fa: 'ماشین‌حساب یک تکرار بیشینه (1RM)' }), desc: t({ en: 'Estimate your 1RM using Epley or Brzycki formulas.', fa: 'تخمین رکورد (1RM) با استفاده از فرمول‌های استاندارد.' }) },
    { slug: 'ffmi', name: t({ en: 'FFMI Calculator', fa: 'ماشین‌حساب FFMI' }), desc: t({ en: 'Calculate your Fat-Free Mass Index.', fa: 'محاسبه شاخص توده بدون چربی (FFMI).' }) },
    { slug: 'whr', name: t({ en: 'Waist-to-Hip Ratio', fa: 'نسبت دور کمر به باسن' }), desc: t({ en: 'Assess health risk based on WHR.', fa: 'ارزیابی خطر سلامتی بر اساس نسبت محیط کمر به باسن.' }) },
    { slug: 'water-intake', name: t({ en: 'Water Intake Calculator', fa: 'ماشین‌حساب مصرف آب' }), desc: t({ en: 'Find your recommended daily water intake.', fa: 'میزان مصرف آب روزانه توصیه‌شده خود را بیابید.' }) },
    { slug: 'goal-date', name: t({ en: 'Goal Date Estimator', fa: 'تخمین‌زننده تاریخ هدف' }), desc: t({ en: 'Estimate when you\'ll reach your target weight.', fa: 'تخمین زمان رسیدن به وزن هدف.' }) },
    { slug: 'calories-burned', name: t({ en: 'Calories Burned Calculator', fa: 'ماشین‌حساب کالری سوزانده شده' }), desc: t({ en: 'Calculate calories burned during activities.', fa: 'محاسبه کالری سوزانده شده در طول فعالیت‌ها.' }) },
    { slug: 'body-type-quiz', name: t({ en: 'Body Type Quiz', fa: 'آزمون تیپ بدنی' }), desc: t({ en: 'Discover your body type: ecto, meso, or endomorph.', fa: 'کشف تیپ بدنی شما: اکتومورف، مزومورف، یا اندومورف.' }) },
    { slug: 'volume-load', name: t({ en: 'Volume Load Calculator', fa: 'ماشین‌حساب حجم تمرین' }), desc: t({ en: 'Calculate your total training volume.', fa: 'محاسبه حجم کلی تمرینات شما.' }) },
    { slug: 'bmr', name: t({ en: 'BMR Calculator', fa: 'ماشین‌حساب BMR' }), desc: t({ en: 'Calculate your Basal Metabolic Rate (Mifflin-St Jeor).', fa: 'محاسبه نرخ متابولیسم پایه (BMR).' }) },
    { slug: 'rep-max-table', name: t({ en: '% of 1RM Table', fa: 'جدول درصدهای 1RM' }), desc: t({ en: 'Same 1RM estimator with an embedded % rep-max chart.', fa: 'همان محاسبه‌گر 1RM با جدول درصدهای تکرار.' }) },
  ];
}

export function CalculatorIndex() {
  const { t } = useI18n();
  const CALC_LIST = useCalculators();

  const categories = [
    { label: t({ en: 'Body Composition', fa: 'ترکیب بدن' }), slugs: ['bmi', 'body-fat', 'ffmi', 'whr', 'body-type-quiz'] },
    { label: t({ en: 'Energy & Nutrition', fa: 'انرژی و تغذیه' }), slugs: ['bmr', 'tdee', 'macros', 'water-intake'] },
    { label: t({ en: 'Strength Training', fa: 'تمرینات قدرتی' }), slugs: ['one-rep-max', 'rep-max-table', 'volume-load'] },
    { label: t({ en: 'Health & Lifestyle', fa: 'سلامت و سبک زندگی' }), slugs: ['goal-date', 'calories-burned'] },
  ];

  return (
    <PageContainer>
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)', border: '1px solid var(--theme-border-accent)' }}>
          <Zap className="w-3.5 h-3.5" />
          {t({ en: 'Science-Based Tools', fa: 'ابزارهای علمی' })}
        </div>
        <h1 className="text-5xl font-black mb-4 font-display">
          {t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های فیتنس' })}
        </h1>
        <p className="text-lg mx-auto max-w-2xl" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: '14 free, science-based calculators to help you understand your body and optimize your training.', fa: '۱۴ ماشین حساب علمی رایگان برای کمک به درک بدن شما و بهینه‌سازی تمرینات.' })}
        </p>
      </div>

      {categories.map((cat, ci) => (
        <div key={cat.label} className="mb-12">
          <h2 className="text-xl font-bold mb-5 font-display" style={{ color: 'var(--theme-fg)' }}>
            {cat.label}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CALC_LIST.filter(c => cat.slugs.includes(c.slug)).map((c, i) => {
              const Icon = CALC_ICONS[c.slug] || Calculator;
              return (
                <Link
                  key={c.slug}
                  to={`/calculators/${c.slug}`}
                  className="group card-premium p-5 hover:border-border-accent transition-all duration-[280ms] animate-slide-up-children"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-[280ms]"
                    style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
                    <Icon className="w-5.5 h-5.5" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5 group-hover:translate-x-0.5 transition-transform">
                    {c.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-fg-subtle)' }}>
                    {c.desc}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold"
                    style={{ color: 'var(--theme-primary)' }}>
                    <span>{t({ en: 'Calculate', fa: 'محاسبه' })}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </PageContainer>
  );
}

export function CalculatorDetail() {
  const { t } = useI18n();
  const CALC_LIST = useCalculators();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [, setState] = useState(0);
  useEffect(() => { const u = subscribe(() => setState(v => v + 1)); return () => { u(); }; }, []);

  const calcInfo = CALC_LIST.find(c => c.slug === slug);
  const CalcComponent = slug ? CALC_COMPONENTS[slug] : null;
  const Icon = (slug && CALC_ICONS[slug]) || Calculator;

  if (!calcInfo || !CalcComponent) {
    return (
      <PageContainer className="text-center py-20">
        <Breadcrumbs items={[
          { label: t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' }), href: '/calculators' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
          <Calculator className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t({ en: 'Calculator not found', fa: 'ماشین‌حساب یافت نشد' })}</h1>
        <button onClick={() => navigate('/calculators')} className="text-sm font-semibold"
          style={{ color: 'var(--theme-primary)' }}>
          {t({ en: '← Back to calculators', fa: 'بازگشت به ماشین‌حساب‌ها' })}
        </button>
      </PageContainer>
    );
  }

  return (
    <PageContainer padY="md">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[
          { label: t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' }), href: '/calculators' },
          { label: calcInfo.name },
        ]} />
        <div className="card-premium overflow-hidden">
          <div className="px-6 md:px-8 pt-6 md:pt-8 pb-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
                <Icon className="w-7 h-7" style={{ color: 'var(--theme-primary)' }} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black font-display">{calcInfo.name}</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>{calcInfo.desc}</p>
              </div>
            </div>
          </div>
          <div className="px-6 md:px-8 pb-6 md:pb-8">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-3 rounded-full animate-spin"
                  style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }} />
              </div>
            }>
              <CalcComponent />
            </Suspense>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
