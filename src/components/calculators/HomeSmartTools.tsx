import { useState, Suspense } from 'react';
import { useI18n } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import {
  BodyCompositionTab,
  EnergyNutritionTab,
  StrengthTrainingTab,
  HealthLifestyleTab,
} from '@/components/calculators/lazy';
import { PAGE_CONTAINER_CLASS } from '@/components/ui/PageContainer';

export default function HomeSmartTools() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'body' | 'energy' | 'strength' | 'health'>('body');

  const tabs = [
    { id: 'body', label: t({ en: 'Body Composition', fa: 'اندام‌سنجی' }) },
    { id: 'energy', label: t({ en: 'Energy & Nutrition', fa: 'انرژی و تغذیه' }) },
    { id: 'strength', label: t({ en: 'Strength & Training', fa: 'قدرت و تمرین' }) },
    { id: 'health', label: t({ en: 'Health & Lifestyle', fa: 'سلامت و سبک زندگی' }) },
  ] as const;

  return (
    <section className="bg-surface border-y border-border py-20" id="smart-tools">
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            {t({ en: '14 Free Fitness Calculators', fa: '۱۴ ماشین حساب رایگان تناسب اندام' })}
          </h2>
          <p className="text-fg-subtle text-lg max-w-2xl mx-auto leading-relaxed">
            {t({
              en: 'Instant, science-based estimates to guide your training. Fully interactive, no reload required.',
              fa: 'برآوردهای علمی فوری برای هدایت تمرینات شما. کاملاً تعاملی و بدون نیاز به بارگذاری مجدد.'
            })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-[12px] text-sm font-semibold transition-colors duration-[180ms] border ${
                  active
                    ? 'bg-brand text-brand-fg border-brand'
                    : 'text-fg-subtle hover:text-fg bg-app border-border hover:bg-elevated'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[560px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Suspense fallback={
                <div className="flex justify-center items-center h-64" role="status">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                {activeTab === 'body' && <BodyCompositionTab />}
                {activeTab === 'energy' && <EnergyNutritionTab />}
                {activeTab === 'strength' && <StrengthTrainingTab />}
                {activeTab === 'health' && <HealthLifestyleTab />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
