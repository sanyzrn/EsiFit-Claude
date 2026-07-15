import React, { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { calcGoalDate, calcCaloriesBurned, MET_TABLE } from '@/lib/calculators';
import { SliderInput, CalculatorLayout, PersianNumber } from './SharedCalculatorUI';

export function GoalDateCalculator() {
  const { t } = useI18n();
  const [currentWeight, setCurrentWeight] = useState(85);
  const [goalWeight, setGoalWeight] = useState(75);
  const [weeklyDelta, setWeeklyDelta] = useState(-500); // Deficit

  const result = useMemo(() => calcGoalDate(currentWeight, goalWeight, weeklyDelta), [currentWeight, goalWeight, weeklyDelta]);

  return (
    <CalculatorLayout
      title={t({ en: 'Goal Date Estimator', fa: 'تخمین تاریخ رسیدن به هدف' })}
      description={t({ en: 'When will you reach your goal weight?', fa: 'چه زمانی به وزن هدف خود می‌رسید؟' })}
      inputs={
        <>
          <SliderInput label={t({ en: 'Current Weight', fa: 'وزن فعلی' })} value={currentWeight} min={40} max={150} step={1} onChange={setCurrentWeight} unit="kg" />
          <SliderInput label={t({ en: 'Goal Weight', fa: 'وزن هدف' })} value={goalWeight} min={40} max={150} step={1} onChange={setGoalWeight} unit="kg" />
          <SliderInput label={t({ en: 'Weekly Calorie Deficit/Surplus', fa: 'کسری/مازاد کالری هفتگی' })} value={weeklyDelta} min={-1000} max={1000} step={100} onChange={setWeeklyDelta} unit="kcal" />
        </>
      }
      results={
        <div className="flex flex-col items-center">
          {result.ok ? (
            <>
              <div className="text-5xl font-black text-orange-400 mb-2"><PersianNumber value={result.value.weeks} /> {t({ en: 'Weeks', fa: 'هفته' })}</div>
              <div className="text-xl font-bold text-gray-200 mb-4">{result.value.estimatedDate}</div>
              {result.value.message && <div className="text-xs text-gray-400">{result.value.message}</div>}
            </>
          ) : (
            <div className="text-red-400 font-medium p-4 bg-red-400/10 rounded-xl border border-red-400/20">{result.error}</div>
          )}
        </div>
      }
    />
  );
}

export function CaloriesBurnedCalculator() {
  const { t } = useI18n();
  const [activity, setActivity] = useState<string>(Object.keys(MET_TABLE)[0]);
  const [weight, setWeight] = useState(75);
  const [duration, setDuration] = useState(60);

  const result = useMemo(() => calcCaloriesBurned(MET_TABLE[activity], weight, duration), [activity, weight, duration]);

  return (
    <CalculatorLayout
      title={t({ en: 'Calories Burned', fa: 'کالری سوزانده شده' })}
      description={t({ en: 'Estimate calories burned during exercise.', fa: 'تخمین کالری سوزانده شده در طول تمرین.' })}
      inputs={
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">{t({ en: 'Activity', fa: 'فعالیت' })}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full bg-gray-700 border-none rounded-lg p-3 text-white">
              {Object.keys(MET_TABLE).map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
          <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={40} max={150} step={1} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'Duration', fa: 'مدت زمان' })} value={duration} min={5} max={180} step={5} onChange={setDuration} unit="min" />
        </>
      }
      results={
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black text-orange-400 mb-2"><PersianNumber value={result} /></div>
          <div className="text-gray-400 font-medium">{t({ en: 'kcal burned', fa: 'کالری سوزانده شده' })}</div>
        </div>
      }
    />
  );
}
