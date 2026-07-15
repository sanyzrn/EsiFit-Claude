import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { calcBMR, calcTDEE, calcMacros, calcWaterIntake, ACTIVITY_FACTORS } from '@/lib/calculators';
import { SliderInput, SegmentedToggle, CircularGauge, BarChart, CalculatorLayout, PersianNumber } from './SharedCalculatorUI';

export function BmrCalculator() {
  const { t } = useI18n();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);

  const result = useMemo(() => calcBMR(gender, weight, height, age), [gender, weight, height, age]);

  return (
    <CalculatorLayout
      title={t({ en: 'TDEE Calculator', fa: 'محاسبه‌گر TDEE' })}
      description={t({ en: 'Basal Metabolic Rate: calories burned at rest.', fa: 'میزان متابولیسم پایه: کالری سوزانده شده در حالت استراحت.' })}
      inputs={
        <>
          <SegmentedToggle options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} value={gender} onChange={setGender} />
          <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={40} max={150} step={1} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'Height', fa: 'قد' })} value={height} min={140} max={220} step={1} onChange={setHeight} unit="cm" />
          <SliderInput label={t({ en: 'Age', fa: 'سن' })} value={age} min={15} max={80} step={1} onChange={setAge} unit="years" />
        </>
      }
      results={
        <div className="flex flex-col items-center">
          <CircularGauge value={result} min={800} max={4000} label={t({ en: 'kcal / day', fa: 'کالری در روز' })} status="neutral" />
        </div>
      }
    />
  );
}

export function TdeeCalculator() {
  const { t } = useI18n();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [activity, setActivity] = useState<keyof typeof ACTIVITY_FACTORS>('moderate');

  const bmr = useMemo(() => calcBMR(gender, weight, height, age), [gender, weight, height, age]);
  const result = useMemo(() => calcTDEE(bmr, activity), [bmr, activity]);

  return (
    <CalculatorLayout
      title={t({ en: 'TDEE Calculator', fa: 'محاسبه‌گر TDEE' })}
      description={t({ en: 'Total Daily Energy Expenditure.', fa: 'مجموع کالری مصرفی روزانه.' })}
      inputs={
        <>
          <SegmentedToggle options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} value={gender} onChange={setGender} />
          <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={40} max={150} step={1} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'Height', fa: 'قد' })} value={height} min={140} max={220} step={1} onChange={setHeight} unit="cm" />
          <SliderInput label={t({ en: 'Age', fa: 'سن' })} value={age} min={15} max={80} step={1} onChange={setAge} unit="years" />
          <div className="mt-4">
            <label className="block text-sm font-medium text-fg-muted mb-2">{t({ en: 'Activity Level', fa: 'سطح فعالیت' })}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value as keyof typeof ACTIVITY_FACTORS)} className="w-full bg-elevated-hover border-none rounded-lg p-3 text-fg">
              <option value="sedentary">{t({ en: 'Sedentary (office job)', fa: 'بدون فعالیت (کار اداری)' })}</option>
              <option value="light">{t({ en: 'Light (exercise 1-2 days/wk)', fa: 'سبک (تمرین ۱-۲ روز در هفته)' })}</option>
              <option value="moderate">{t({ en: 'Moderate (exercise 3-5 days/wk)', fa: 'متوسط (تمرین ۳-۵ روز در هفته)' })}</option>
              <option value="active">{t({ en: 'Active (exercise 6-7 days/wk)', fa: 'فعال (تمرین ۶-۷ روز در هفته)' })}</option>
              <option value="veryActive">{t({ en: 'Very Active (physical job)', fa: 'بسیار فعال (شغل فیزیکی)' })}</option>
            </select>
          </div>
        </>
      }
      results={
        <div className="flex flex-col items-center">
          <CircularGauge value={result} min={1200} max={4500} label={t({ en: 'kcal / day', fa: 'کالری در روز' })} status="neutral" />
        </div>
      }
    />
  );
}

export function MacrosCalculator() {
  const { t } = useI18n();
  const [weight, setWeight] = useState(75);
  const [tdee, setTdee] = useState(2500);
  const [goal, setGoal] = useState<'muscle_gain' | 'fat_loss' | 'maintenance'>('maintenance');

  const result = useMemo(() => calcMacros(weight, tdee, goal), [weight, tdee, goal]);

  return (
    <CalculatorLayout
      title={t({ en: 'Macros Calculator', fa: 'ماشین‌حساب درشت‌مغذی‌ها' })}
      description={t({ en: 'Optimal protein, fats, and carbs for your goal.', fa: 'پروتئین، چربی و کربوهیدرات بهینه برای هدف شما.' })}
      inputs={
        <>
          <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={40} max={150} step={1} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'TDEE (Calories)', fa: 'کالری روزانه' })} value={tdee} min={1200} max={4500} step={50} onChange={setTdee} unit="kcal" />
          <SegmentedToggle 
            options={[
              { value: 'fat_loss', label: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }) },
              { value: 'maintenance', label: t({ en: 'Maintain', fa: 'تثبیت' }) },
              { value: 'muscle_gain', label: t({ en: 'Muscle', fa: 'عضله‌سازی' }) }
            ]} 
            value={goal} onChange={setGoal} 
          />
        </>
      }
      results={
        <div className="flex flex-col items-center w-full">
          {result.ok ? (
            <>
              <div className="text-3xl font-black text-brand mb-4 font-display"><PersianNumber value={result.value.calories} /> kcal</div>
              <BarChart items={[
                { label: t({ en: 'Protein', fa: 'پروتئین' }), value: result.value.protein, unit: 'g' },
                { label: t({ en: 'Carbs', fa: 'کربوهیدرات' }), value: result.value.carbs, unit: 'g' },
                { label: t({ en: 'Fat', fa: 'چربی' }), value: result.value.fat, unit: 'g' },
              ]} />
            </>
          ) : (
            <div className="text-red-400 font-medium p-4 bg-red-400/10 rounded-xl border border-red-400/20">{result.error}</div>
          )}
        </div>
      }
    />
  );
}

export function WaterIntakeCalculator() {
  const { t } = useI18n();
  const [weight, setWeight] = useState(75);

  const result = useMemo(() => calcWaterIntake(weight), [weight]);

  return (
    <CalculatorLayout
      title={t({ en: 'Water Intake', fa: 'میزان مصرف آب' })}
      description={t({ en: 'Daily recommended water intake.', fa: 'میزان مصرف روزانه توصیه شده آب.' })}
      inputs={
        <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={40} max={150} step={1} onChange={setWeight} unit="kg" />
      }
      results={
        <div className="flex flex-col items-center">
          <CircularGauge value={result.liters} min={1} max={5} label={t({ en: 'Liters / day', fa: 'لیتر در روز' })} status="ok" />
        </div>
      }
    />
  );
}
