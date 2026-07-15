import { useState, useEffect, Suspense } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { CALC_COMPONENTS } from '@/components/calculators/lazy';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

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
    { slug: 'rep-max-table', name: t({ en: '% of 1RM Table', fa: 'جدول درصدهای 1RM' }), desc: t({ en: 'Same 1RM estimator with an embedded % rep-max chart (also at /calculators/one-rep-max).', fa: 'همان محاسبه‌گر 1RM با جدول درصدهای تکرار (همچنین در /calculators/one-rep-max).' }) },
  ];
}

export function CalculatorIndex() {
  const { t } = useI18n();
  const CALC_LIST = useCalculators();
  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های فیتنس' })}</h1>
        <p className="text-fg-subtle text-lg max-w-2xl mx-auto">
          {t({ en: '14 free, science-based calculators to help you understand your body and optimize your training.', fa: '۱۴ ماشین حساب علمی رایگان برای کمک به درک بدن شما و بهینه‌سازی تمرینات.' })}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CALC_LIST.map(c => (
          <Link
            key={c.slug}
            to={`/calculators/${c.slug}`}
            className="group bg-surface border border-border rounded-xl p-5 hover:border-orange-500/50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
              <Calculator className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold text-sm mb-1 group-hover:text-orange-400 transition-colors">{c.name}</h3>
            <p className="text-fg-subtle text-xs">{c.desc}</p>
          </Link>
        ))}
      </div>
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

  if (!calcInfo || !CalcComponent) {
    return (
      <PageContainer className="text-center">
        <Breadcrumbs items={[
          { label: t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' }), href: '/calculators' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Calculator not found', fa: 'ماشین‌حساب یافت نشد' })}</h1>
        <button onClick={() => navigate('/calculators')} className="text-orange-400 hover:text-orange-300">
          {t({ en: '← Back to calculators', fa: 'بازگشت به ماشین‌حساب‌ها' })}
        </button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
      <Breadcrumbs items={[
        { label: t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' }), href: '/calculators' },
        { label: calcInfo.name },
      ]} />
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{calcInfo.name}</h1>
            <p className="text-fg-subtle text-sm">{calcInfo.desc}</p>
          </div>
        </div>
        <Suspense fallback={
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CalcComponent />
        </Suspense>
      </div>
      </div>
    </PageContainer>
  );
}
