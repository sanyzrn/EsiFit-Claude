import React, { useState, Suspense } from 'react';
import { useI18n } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';

const BodyCompositionCalculators = React.lazy(() => import('./BodyCompositionCalculators').then(m => ({
  default: () => (
    <div className="space-y-8">
      <m.BmiCalculator />
      <m.BodyFatCalculator />
      <m.FfmiCalculator />
      <m.WhrCalculator />
      <m.BodyTypeQuiz />
    </div>
  )
})));

const EnergyNutritionCalculators = React.lazy(() => import('./EnergyNutritionCalculators').then(m => ({
  default: () => (
    <div className="space-y-8">
      <m.BmrCalculator />
      <m.TdeeCalculator />
      <m.MacrosCalculator />
      <m.WaterIntakeCalculator />
    </div>
  )
})));

const StrengthTrainingCalculators = React.lazy(() => import('./StrengthTrainingCalculators').then(m => ({
  default: () => (
    <div className="space-y-8">
      <m.OneRepMaxCalculator />
      <m.VolumeLoadCalculator />
    </div>
  )
})));

const HealthLifestyleCalculators = React.lazy(() => import('./HealthLifestyleCalculators').then(m => ({
  default: () => (
    <div className="space-y-8">
      <m.GoalDateCalculator />
      <m.CaloriesBurnedCalculator />
    </div>
  )
})));

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
    <section className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-20" id="smart-tools">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            {t({ en: '14 Free Fitness Calculators', fa: '۱۴ ماشین حساب رایگان تناسب اندام' })}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t({
              en: 'Instant, science-based estimates to guide your training. Fully interactive, no reload required.',
              fa: 'برآوردهای علمی فوری برای هدایت تمرینات شما. کاملاً تعاملی و بدون نیاز به بارگذاری مجدد.'
            })}
          </p>
        </div>

        {/* Custom Tabbed Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all relative ${
                activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200 bg-gray-900 border border-gray-800'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-orange-600 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content with Suspense and AnimatePresence */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={
                <div className="flex justify-center items-center h-64">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                {activeTab === 'body' && <BodyCompositionCalculators />}
                {activeTab === 'energy' && <EnergyNutritionCalculators />}
                {activeTab === 'strength' && <StrengthTrainingCalculators />}
                {activeTab === 'health' && <HealthLifestyleCalculators />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
