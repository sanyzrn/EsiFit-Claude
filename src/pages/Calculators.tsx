import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, Info } from 'lucide-react';
import * as calc from '@/lib/calculators';
import { getState, addCalculatorResult, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

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
    { slug: 'rep-max-table', name: t({ en: '% of 1RM Table', fa: 'جدول درصدهای 1RM' }), desc: t({ en: 'Generate a rep-max percentage chart from your 1RM.', fa: 'تولید جدول درصدهای تکرار بیشینه شما.' }) },
  ];
}

const Disclaimer = () => {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mt-4">
      <Info className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
      <p className="text-xs text-yellow-300/80">{t({ en: 'This is an estimate for general fitness purposes, not medical advice.', fa: 'این یک تخمین برای اهداف کلی تناسب اندام است، نه توصیه پزشکی.' })}</p>
    </div>
  );
};

function InputField({ label, value, onChange, type = 'number', min, max, step, placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; min?: number; max?: number; step?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min} max={max} step={step} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-3xl font-black text-orange-400">{value}</div>
      {sub && <div className="text-sm text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function saveResult(type: string, inputJson: Record<string, unknown>, resultJson: Record<string, unknown>) {
  const state = getState();
  if (state.currentUser) {
    addCalculatorResult({ type, userId: state.currentUser.id, inputJson, resultJson });
  }
}

function BMICalc() {
  const { t } = useI18n();
  const [w, setW] = useState('80');
  const [h, setH] = useState('178');
  const [result, setResult] = useState<ReturnType<typeof calc.calcBMI> | null>(null);
  const calculate = () => { const r = calc.calcBMI(Number(w), Number(h)); setResult(r); saveResult('bmi', { weightKg: Number(w), heightCm: Number(h) }, r); };
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} min={20} max={300} />
      <InputField label={t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' })} value={h} onChange={setH} min={100} max={250} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate BMI', fa: 'محاسبه BMI' })}</button>
      {result && (
        <div className="animate-fade-in space-y-3">
          <ResultCard label={t({ en: 'Your BMI', fa: 'شاخص توده بدنی شما' })} value={result.bmi} sub={result.category} />
          <div className="grid grid-cols-4 gap-1 text-xs">
            {[
              { label: t({ en: 'Underweight', fa: 'کمبود وزن' }), range: '< 18.5', color: 'bg-blue-500' },
              { label: t({ en: 'Normal', fa: 'نرمال' }), range: '18.5-24.9', color: 'bg-green-500' },
              { label: t({ en: 'Overweight', fa: 'اضافه وزن' }), range: '25-29.9', color: 'bg-yellow-500' },
              { label: t({ en: 'Obese', fa: 'چاقی' }), range: '30+', color: 'bg-red-500' }
            ].map(c => (
              <div key={c.label} className="text-center">
                <div className={`h-2 ${c.color} rounded-full mb-1`} />
                <div className="text-gray-400">{c.label}</div>
                <div className="text-gray-500">{c.range}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function BodyFatCalc() {
  const { t } = useI18n();
  const [gender, setGender] = useState('male');
  const [waist, setWaist] = useState('85');
  const [neck, setNeck] = useState('38');
  const [hip, setHip] = useState('95');
  const [height, setHeight] = useState('178');
  const [result, setResult] = useState<ReturnType<typeof calc.calcBodyFat> | null>(null);
  const calculate = () => { const r = calc.calcBodyFat(gender as 'male' | 'female', Number(waist), Number(neck), Number(height), Number(hip)); setResult(r); saveResult('body-fat', { gender, waistCm: Number(waist), neckCm: Number(neck), hipCm: Number(hip), heightCm: Number(height) }, r); };
  return (
    <div className="space-y-4">
      <SelectField label={t({ en: 'Gender', fa: 'جنسیت' })} value={gender} onChange={setGender} options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} />
      <InputField label={t({ en: 'Waist (cm)', fa: 'دور کمر (سانتی‌متر)' })} value={waist} onChange={setWaist} />
      <InputField label={t({ en: 'Neck (cm)', fa: 'دور گردن (سانتی‌متر)' })} value={neck} onChange={setNeck} />
      {gender === 'female' && <InputField label={t({ en: 'Hip (cm)', fa: 'دور باسن (سانتی‌متر)' })} value={hip} onChange={setHip} />}
      <InputField label={t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' })} value={height} onChange={setHeight} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate Body Fat %', fa: 'محاسبه درصد چربی بدن' })}</button>
      {result && <div className="animate-fade-in"><ResultCard label={t({ en: 'Body Fat %', fa: 'درصد چربی بدن' })} value={result.bodyFatPct + '%'} sub={result.category} /></div>}
      <Disclaimer />
    </div>
  );
}

function BMRCalc() {
  const { t } = useI18n();
  const [gender, setGender] = useState('male');
  const [w, setW] = useState('80');
  const [h, setH] = useState('178');
  const [age, setAge] = useState('28');
  const [result, setResult] = useState<number | null>(null);
  const calculate = () => { const r = calc.calcBMR(gender as 'male' | 'female', Number(w), Number(h), Number(age)); setResult(r); saveResult('bmr', { gender, weightKg: Number(w), heightCm: Number(h), age: Number(age) }, { bmr: r }); };
  return (
    <div className="space-y-4">
      <SelectField label={t({ en: 'Gender', fa: 'جنسیت' })} value={gender} onChange={setGender} options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} />
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} />
      <InputField label={t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' })} value={h} onChange={setH} />
      <InputField label={t({ en: 'Age', fa: 'سن' })} value={age} onChange={setAge} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate BMR', fa: 'محاسبه BMR' })}</button>
      {result && <div className="animate-fade-in"><ResultCard label={t({ en: 'Basal Metabolic Rate', fa: 'نرخ متابولیسم پایه' })} value={result + ' kcal'} sub={t({ en: 'Calories burned at complete rest', fa: 'کالری سوزانده شده در استراحت مطلق' })} /></div>}
      <Disclaimer />
    </div>
  );
}

function TDEECalc() {
  const { t } = useI18n();
  const [gender, setGender] = useState('male');
  const [w, setW] = useState('80');
  const [h, setH] = useState('178');
  const [age, setAge] = useState('28');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState<{ bmr: number; tdee: number } | null>(null);
  const calculate = () => {
    const bmr = calc.calcBMR(gender as 'male' | 'female', Number(w), Number(h), Number(age));
    const tdee = calc.calcTDEE(bmr, activity as keyof typeof calc.ACTIVITY_FACTORS);
    setResult({ bmr, tdee });
    saveResult('tdee', { gender, weightKg: Number(w), heightCm: Number(h), age: Number(age), activity }, { bmr, tdee });
  };
  return (
    <div className="space-y-4">
      <SelectField label={t({ en: 'Gender', fa: 'جنسیت' })} value={gender} onChange={setGender} options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} />
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} />
      <InputField label={t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' })} value={h} onChange={setH} />
      <InputField label={t({ en: 'Age', fa: 'سن' })} value={age} onChange={setAge} />
      <SelectField label={t({ en: 'Activity Level', fa: 'سطح فعالیت' })} value={activity} onChange={setActivity} options={[
        { value: 'sedentary', label: t({ en: 'Sedentary (office job, no exercise)', fa: 'بی‌تحرک (کار دفتری، بدون ورزش)' }) },
        { value: 'light', label: t({ en: 'Light (1-3 days/week)', fa: 'سبک (۱-۳ روز در هفته)' }) },
        { value: 'moderate', label: t({ en: 'Moderate (3-5 days/week)', fa: 'متوسط (۳-۵ روز در هفته)' }) },
        { value: 'active', label: t({ en: 'Active (6-7 days/week)', fa: 'فعال (۶-۷ روز در هفته)' }) },
        { value: 'veryActive', label: t({ en: 'Very Active (intense daily + physical job)', fa: 'بسیار فعال (ورزش شدید + کار فیزیکی)' }) },
      ]} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate TDEE', fa: 'محاسبه TDEE' })}</button>
      {result && (
        <div className="animate-fade-in space-y-3">
          <ResultCard label="TDEE" value={result.tdee + ' kcal'} sub={t({ en: 'Total Daily Energy Expenditure', fa: 'مجموع انرژی مصرفی روزانه' })} />
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-gray-800 rounded-lg p-3"><div className="text-red-400 font-bold">{result.tdee - 500}</div><div className="text-gray-400 text-xs">{t({ en: 'Cut (-500)', fa: 'چربی‌سوزی (-۵۰۰)' })}</div></div>
            <div className="bg-gray-800 rounded-lg p-3"><div className="text-green-400 font-bold">{result.tdee}</div><div className="text-gray-400 text-xs">{t({ en: 'Maintain', fa: 'تثبیت' })}</div></div>
            <div className="bg-gray-800 rounded-lg p-3"><div className="text-blue-400 font-bold">{result.tdee + 500}</div><div className="text-gray-400 text-xs">{t({ en: 'Bulk (+500)', fa: 'عضله‌سازی (+۵۰۰)' })}</div></div>
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function MacrosCalc() {
  const { t } = useI18n();
  const [w, setW] = useState('80');
  const [tdee, setTdee] = useState('2500');
  const [goal, setGoal] = useState('muscle_gain');
  const [result, setResult] = useState<ReturnType<typeof calc.calcMacros> | null>(null);
  const calculate = () => { const r = calc.calcMacros(Number(w), Number(tdee), goal as 'muscle_gain' | 'fat_loss' | 'maintenance'); setResult(r); saveResult('macros', { weightKg: Number(w), tdee: Number(tdee), goal }, r); };
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} />
      <InputField label={t({ en: 'TDEE (kcal)', fa: 'کالری روزانه (TDEE)' })} value={tdee} onChange={setTdee} placeholder={t({ en: 'Calculate TDEE first', fa: 'ابتدا TDEE را محاسبه کنید' })} />
      <SelectField label={t({ en: 'Goal', fa: 'هدف' })} value={goal} onChange={setGoal} options={[
        { value: 'muscle_gain', label: t({ en: 'Muscle Gain', fa: 'عضله‌سازی' }) },
        { value: 'fat_loss', label: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }) },
        { value: 'maintenance', label: t({ en: 'Maintenance', fa: 'تثبیت وزن' }) },
      ]} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate Macros', fa: 'محاسبه درشت‌مغذی‌ها' })}</button>
      {result && (
        <div className="animate-fade-in grid grid-cols-3 gap-3">
          <ResultCard label={t({ en: 'Protein', fa: 'پروتئین' })} value={result.protein + 'g'} sub={`${result.protein * 4} kcal`} />
          <ResultCard label={t({ en: 'Carbs', fa: 'کربوهیدرات' })} value={result.carbs + 'g'} sub={`${result.carbs * 4} kcal`} />
          <ResultCard label={t({ en: 'Fat', fa: 'چربی' })} value={result.fat + 'g'} sub={`${result.fat * 9} kcal`} />
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function OneRepMaxCalc() {
  const { t } = useI18n();
  const [weight, setWeight] = useState('100');
  const [reps, setReps] = useState('5');
  const [formula, setFormula] = useState('epley');
  const [result, setResult] = useState<number | null>(null);
  const calculate = () => { const r = calc.calcOneRepMax(Number(weight), Number(reps), formula as 'epley' | 'brzycki'); setResult(r); saveResult('1rm', { weight: Number(weight), reps: Number(reps), formula }, { oneRM: r }); };
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Weight Lifted (kg)', fa: 'وزن جابجا شده (کیلوگرم)' })} value={weight} onChange={setWeight} />
      <InputField label={t({ en: 'Reps Performed', fa: 'تعداد تکرارها' })} value={reps} onChange={setReps} min={1} max={30} />
      <SelectField label={t({ en: 'Formula', fa: 'فرمول' })} value={formula} onChange={setFormula} options={[{ value: 'epley', label: 'Epley' }, { value: 'brzycki', label: 'Brzycki' }]} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate 1RM', fa: 'محاسبه رکورد 1RM' })}</button>
      {result && (
        <div className="animate-fade-in space-y-3">
          <ResultCard label={t({ en: 'Estimated 1RM', fa: 'رکورد تخمینی 1RM' })} value={result + ' kg'} />
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-300 mb-3">{t({ en: 'Rep-Max Table', fa: 'جدول درصدهای رکورد' })}</div>
            <div className="space-y-1">
              {calc.getRepMaxTable(result).map(r => (
                <div key={r.percentage} className="flex justify-between text-sm py-1 border-b border-gray-700 last:border-0">
                  <span className="text-gray-400">{r.percentage}% ({r.reps} reps)</span>
                  <span className="font-bold text-white">{r.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function FFMICalc() {
  const { t } = useI18n();
  const [w, setW] = useState('80');
  const [h, setH] = useState('178');
  const [bf, setBf] = useState('15');
  const [result, setResult] = useState<ReturnType<typeof calc.calcFFMI> | null>(null);
  const calculate = () => { const r = calc.calcFFMI(Number(w), Number(h), Number(bf)); setResult(r); saveResult('ffmi', { weightKg: Number(w), heightCm: Number(h), bodyFatPct: Number(bf) }, r); };
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} />
      <InputField label={t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' })} value={h} onChange={setH} />
      <InputField label={t({ en: 'Body Fat %', fa: 'درصد چربی بدن' })} value={bf} onChange={setBf} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate FFMI', fa: 'محاسبه FFMI' })}</button>
      {result && (
        <div className="animate-fade-in space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="FFMI" value={result.ffmi} />
            <ResultCard label={t({ en: 'Adjusted FFMI', fa: 'FFMI تنظیم‌شده' })} value={result.adjusted} sub={result.category} />
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function WHRCalc() {
  const { t } = useI18n();
  const [waist, setWaist] = useState('85');
  const [hip, setHip] = useState('100');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState<ReturnType<typeof calc.calcWHR> | null>(null);
  const calculate = () => { const r = calc.calcWHR(Number(waist), Number(hip), gender as 'male' | 'female'); setResult(r); saveResult('whr', { waistCm: Number(waist), hipCm: Number(hip), gender }, r); };
  return (
    <div className="space-y-4">
      <SelectField label={t({ en: 'Gender', fa: 'جنسیت' })} value={gender} onChange={setGender} options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} />
      <InputField label={t({ en: 'Waist (cm)', fa: 'دور کمر (سانتی‌متر)' })} value={waist} onChange={setWaist} />
      <InputField label={t({ en: 'Hip (cm)', fa: 'دور باسن (سانتی‌متر)' })} value={hip} onChange={setHip} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate WHR', fa: 'محاسبه نسبت دور کمر به باسن' })}</button>
      {result && (
        <div className="animate-fade-in">
          <ResultCard label={t({ en: 'Waist-to-Hip Ratio', fa: 'نسبت دور کمر به باسن' })} value={result.whr} sub={result.risk} />
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function WaterCalc() {
  const { t } = useI18n();
  const [w, setW] = useState('80');
  const [result, setResult] = useState<ReturnType<typeof calc.calcWaterIntake> | null>(null);
  const calculate = () => { const r = calc.calcWaterIntake(Number(w)); setResult(r); saveResult('water', { weightKg: Number(w) }, r); };
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate Water Intake', fa: 'محاسبه مصرف آب' })}</button>
      {result && (
        <div className="animate-fade-in">
          <ResultCard label={t({ en: 'Daily Water Intake', fa: 'مصرف روزانه آب' })} value={result.liters + ' L'} sub={t({ en: 'About {0} glasses', fa: 'حدود {0} لیوان' }, Math.round(result.liters * 4.2))} />
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function GoalDateCalc() {
  const { t } = useI18n();
  const [current, setCurrent] = useState('85');
  const [goal, setGoal] = useState('75');
  const [deficit, setDeficit] = useState('3500');
  const [result, setResult] = useState<ReturnType<typeof calc.calcGoalDate> | null>(null);
  const calculate = () => { const r = calc.calcGoalDate(Number(current), Number(goal), Number(deficit)); setResult(r); saveResult('goal-date', { currentWeight: Number(current), goalWeight: Number(goal), weeklyCalorieDelta: Number(deficit) }, r); };
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Current Weight (kg)', fa: 'وزن فعلی (کیلوگرم)' })} value={current} onChange={setCurrent} />
      <InputField label={t({ en: 'Goal Weight (kg)', fa: 'وزن هدف (کیلوگرم)' })} value={goal} onChange={setGoal} />
      <InputField label={t({ en: 'Weekly Calorie Deficit/Surplus (kcal)', fa: 'نقصان/مازاد کالری هفتگی' })} value={deficit} onChange={setDeficit} placeholder={t({ en: 'e.g. 3500', fa: 'مثلاً 3500' })} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Estimate Goal Date', fa: 'تخمین تاریخ رسیدن به هدف' })}</button>
      {result && (
        <div className="animate-fade-in space-y-3">
          <ResultCard label={t({ en: 'Estimated Weeks', fa: 'هفته‌های تخمینی' })} value={result.weeks} />
          <ResultCard label={t({ en: 'Target Date', fa: 'تاریخ هدف' })} value={result.estimatedDate} />
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function CaloriesBurnedCalc() {
  const { t } = useI18n();
  const [activity, setActivity] = useState('Weight Training');
  const [w, setW] = useState('80');
  const [duration, setDuration] = useState('60');
  const [result, setResult] = useState<number | null>(null);
  const calculate = () => { const met = calc.MET_TABLE[activity]; const r = calc.calcCaloriesBurned(met, Number(w), Number(duration)); setResult(r); saveResult('calories-burned', { activity, weightKg: Number(w), durationMinutes: Number(duration) }, { caloriesBurned: r }); };
  return (
    <div className="space-y-4">
      <SelectField label={t({ en: 'Activity', fa: 'فعالیت' })} value={activity} onChange={setActivity} options={Object.keys(calc.MET_TABLE).map(k => ({
        value: k,
        label: t({
          en: k,
          fa: k === 'Running (8 km/h)' ? 'دویدن (۸ کیلومتر در ساعت)' :
              k === 'Running (10 km/h)' ? 'دویدن (۱۰ کیلومتر در ساعت)' :
              k === 'Running (12 km/h)' ? 'دویدن (۱۲ کیلومتر در ساعت)' :
              k === 'Cycling (moderate)' ? 'دوچرخه‌سواری (متوسط)' :
              k === 'Cycling (vigorous)' ? 'دوچرخه‌سواری (شدید)' :
              k === 'Swimming (moderate)' ? 'شنا (متوسط)' :
              k === 'Swimming (vigorous)' ? 'شنا (شدید)' :
              k === 'Weight Training' ? 'تمرین با وزنه' :
              k === 'Walking (5 km/h)' ? 'پیاده‌روی (۵ کیلومتر در ساعت)' :
              k === 'Walking (6.5 km/h)' ? 'پیاده‌روی (۶.۵ کیلومتر در ساعت)' :
              k === 'Jump Rope' ? 'طناب زدن' :
              k === 'Rowing' ? 'قایقرانی' :
              k === 'Yoga' ? 'یوگا' :
              k === 'HIIT' ? 'تمرین تناوبی با شدت بالا (HIIT)' :
              k === 'Elliptical' ? 'اسکی فضایی' :
              k === 'Stair Climbing' ? 'پله‌نوردی' : k
        })
      }))} />
      <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={w} onChange={setW} />
      <InputField label={t({ en: 'Duration (minutes)', fa: 'مدت زمان (دقیقه)' })} value={duration} onChange={setDuration} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Calculate Calories', fa: 'محاسبه کالری' })}</button>
      {result && <div className="animate-fade-in"><ResultCard label={t({ en: 'Calories Burned', fa: 'کالری سوزانده شده' })} value={result + ' kcal'} sub={`MET: ${calc.MET_TABLE[activity]}`} /></div>}
      <Disclaimer />
    </div>
  );
}

function VolumeLoadCalc() {
  const { t } = useI18n();
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('80');
  const [exercises, setExercises] = useState<{ sets: number; reps: number; weightKg: number }[]>([]);
  const addExercise = () => { setExercises([...exercises, { sets: Number(sets), reps: Number(reps), weightKg: Number(weight) }]); };
  const total = calc.calcVolumeLoad(exercises);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <InputField label={t({ en: 'Sets', fa: 'ست‌ها' })} value={sets} onChange={setSets} />
        <InputField label={t({ en: 'Reps', fa: 'تکرارها' })} value={reps} onChange={setReps} />
        <InputField label={t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })} value={weight} onChange={setWeight} />
      </div>
      <button onClick={addExercise} className="w-full py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">{t({ en: '+ Add Exercise', fa: '+ افزودن حرکت' })}</button>
      {exercises.length > 0 && (
        <div className="space-y-2">
          {exercises.map((e, i) => (
            <div key={i} className="flex justify-between bg-gray-800 rounded-lg p-3 text-sm flex-row-reverse rtl:flex-row">
              <span>{t({ en: 'Exercise', fa: 'حرکت' })} {i + 1}: {e.sets}×{e.reps} @ {e.weightKg}kg</span>
              <span className="text-orange-400 font-bold">{e.sets * e.reps * e.weightKg} kg</span>
            </div>
          ))}
          <ResultCard label={t({ en: 'Total Volume Load', fa: 'حجم کل تمرین' })} value={total + ' kg'} />
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function RepMaxTableCalc() {
  const { t } = useI18n();
  const [orm, setOrm] = useState('100');
  const [table, setTable] = useState<ReturnType<typeof calc.getRepMaxTable> | null>(null);
  const calculate = () => setTable(calc.getRepMaxTable(Number(orm)));
  return (
    <div className="space-y-4">
      <InputField label={t({ en: 'Your 1RM (kg)', fa: 'رکورد 1RM شما (کیلوگرم)' })} value={orm} onChange={setOrm} />
      <button onClick={calculate} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t({ en: 'Generate Table', fa: 'تولید جدول' })}</button>
      {table && (
        <div className="animate-fade-in bg-gray-800 rounded-xl p-4">
          <div className="space-y-1">
            {table.map(r => (
              <div key={r.percentage} className="flex justify-between text-sm py-2 border-b border-gray-700 last:border-0">
                <span className="text-gray-400">{r.percentage}%</span>
                <span className="text-gray-300">{r.reps} {t({ en: 'reps', fa: 'تکرار' })}</span>
                <span className="font-bold text-orange-400">{r.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

function BodyTypeQuiz() {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calc.calcBodyType> | null>(null);
  const currentQ = answers.length;
  const handleAnswer = (idx: number) => {
    const next = [...answers, idx];
    setAnswers(next);
    if (next.length === calc.BODY_TYPE_QUESTIONS.length) {
      const r = calc.calcBodyType(next);
      setResult(r);
      saveResult('body-type', { answers: next }, r);
    }
  };
  const reset = () => { setAnswers([]); setResult(null); };
  if (result) {
    const colors = { ectomorph: 'text-blue-400', mesomorph: 'text-green-400', endomorph: 'text-purple-400' };
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">{t({ en: 'Your Body Type', fa: 'تیپ بدنی شما' })}</div>
          <div className={`text-4xl font-black capitalize ${colors[result.type]}`}>{result.type}</div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {t({
            en: result.description,
            fa: result.type === 'ectomorph' ? 'شما تیپ بدنی اکتومورف دارید — به طور طبیعی لاغر با متابولیسم سریع. افزایش حجم عضلانی برای شما سخت‌تر است. تمرکز بر رژیم مازاد کالری، حرکات پایه (کامپاند) و اصل اضافه‌بار پیش‌رونده. برنامه‌های هیپرتروفی (۸-۱۲ تکرار) با استراحت کافی ایده‌آل است.' :
                result.type === 'mesomorph' ? 'شما تیپ بدنی مزومورف دارید — به طور طبیعی عضلانی و ورزشکار. به تمرینات قدرتی و استقامتی به خوبی پاسخ می‌دهید. به راحتی عضله می‌سازید و چربی می‌سوزانید. برنامه متعادل ترکیبی از تمرین قدرتی و هوازی عالی است.' :
                'شما تیپ بدنی اندومورف دارید — به طور طبیعی هیکل درشت‌تر با تمایل به ذخیره چربی. تمرکز روی ترکیبی از تمرینات مقاومتی و هوازی منظم مهم است. کنترل رژیم غذایی اهمیت ویژه‌ای دارد. رژیم پروتئین بالا و کربوهیدرات متوسط برای این تیپ بدنی عالی عمل می‌کند.'
          })}
        </p>
        <button onClick={reset} className="w-full py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">{t({ en: 'Retake Quiz', fa: 'تکرار آزمون' })}</button>
        <Disclaimer />
      </div>
    );
  }
  if (currentQ >= calc.BODY_TYPE_QUESTIONS.length) return null;
  const q = calc.BODY_TYPE_QUESTIONS[currentQ];
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>{t({ en: 'Question', fa: 'سوال' })} {currentQ + 1} {t({ en: 'of', fa: 'از' })} {calc.BODY_TYPE_QUESTIONS.length}</span>
        <span>{Math.round((currentQ / calc.BODY_TYPE_QUESTIONS.length) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className="bg-orange-500 rounded-full h-2 transition-all rtl:origin-right" style={{ width: `${(currentQ / calc.BODY_TYPE_QUESTIONS.length) * 100}%` }} />
      </div>
      <h3 className="text-lg font-bold">
        {t({
          en: q.question,
          fa: q.question === 'What is your natural body build?' ? 'ساختار طبیعی بدن شما چیست؟' :
              q.question === 'How easily do you gain weight?' ? 'چقدر راحت وزن اضافه می‌کنید؟' :
              q.question === 'What is your wrist circumference?' ? 'اندازه دور مچ شما چقدر است؟' :
              q.question === 'How would you describe your shoulders?' ? 'شانه‌های خود را چگونه توصیف می‌کنید؟' :
              q.question === 'What happens when you skip workouts for a week?' ? 'وقتی یک هفته تمرین نمی‌کنید چه اتفاقی می‌افتد؟' :
              q.question === 'How is your metabolism?' ? 'متابولیسم شما چگونه است؟' : q.question
        })}
      </h3>
      <div className="space-y-2">
      {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left rtl:text-right px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500 hover:bg-gray-800/80 transition-colors text-sm">
            {t({
              en: opt.text,
              fa: opt.text === 'Thin, narrow shoulders and hips' ? 'لاغر، شانه‌ها و باسن باریک' :
                  opt.text === 'Medium build, broad shoulders' ? 'هیکل متوسط، شانه‌های پهن' :
                  opt.text === 'Wider build, stores fat easily' ? 'هیکل پهن، به راحتی چربی ذخیره می‌کند' :
                  opt.text === 'Very hard to gain weight' ? 'افزایش وزن بسیار سخت است' :
                  opt.text === 'Can gain/lose relatively easily' ? 'نسبتاً راحت وزن کم یا زیاد می‌کند' :
                  opt.text === 'Gain weight easily, hard to lose' ? 'به راحتی وزن می‌گیرد، کاهش وزن سخت است' :
                  opt.text === 'Small (under 16 cm / 6.3\")' ? 'کوچک (کمتر از ۱۶ سانتی‌متر)' :
                  opt.text === 'Medium (16-18 cm / 6.3-7\")' ? 'متوسط (۱۶ تا ۱۸ سانتی‌متر)' :
                  opt.text === 'Large (over 18 cm / 7\"+)' ? 'بزرگ (بیش از ۱۸ سانتی‌متر)' :
                  opt.text === 'Narrower than my hips' ? 'باریک‌تر از باسن من' :
                  opt.text === 'Same width or wider than hips' ? 'هم‌عرض یا پهن‌تر از باسن' :
                  opt.text === 'Wide but rounded' ? 'پهن اما گرد' :
                  opt.text === 'I lose muscle and weight quickly' ? 'به سرعت عضله و وزن کم می‌کنم' :
                  opt.text === 'Not much changes' ? 'تغییر زیادی نمی‌کند' :
                  opt.text === 'I tend to gain fat' ? 'تمایل به افزایش چربی دارم' :
                  opt.text === 'Very fast — I can eat a lot without gaining' ? 'بسیار سریع — می‌توانم زیاد بخورم بدون افزایش وزن' :
                  opt.text === 'Moderate — predictable' ? 'متوسط — قابل پیش‌بینی' :
                  opt.text === 'Slow — everything seems to stick' ? 'کند — همه چیز به سرعت جذب می‌شود' :
                  opt.text
            })}
          </button>
        ))}
      </div>
    </div>
  );
}

const CALC_COMPONENTS: Record<string, React.FC> = {
  'bmi': BMICalc,
  'body-fat': BodyFatCalc,
  'bmr': BMRCalc,
  'tdee': TDEECalc,
  'macros': MacrosCalc,
  'one-rep-max': OneRepMaxCalc,
  'ffmi': FFMICalc,
  'whr': WHRCalc,
  'water-intake': WaterCalc,
  'goal-date': GoalDateCalc,
  'calories-burned': CaloriesBurnedCalc,
  'body-type-quiz': BodyTypeQuiz,
  'volume-load': VolumeLoadCalc,
  'rep-max-table': RepMaxTableCalc,
};

export function CalculatorIndex() {
  const { t } = useI18n();
  const CALC_LIST = useCalculators();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های فیتنس' })}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {t({ en: '14 free, science-based calculators to help you understand your body and optimize your training.', fa: '۱۴ ماشین حساب علمی رایگان برای کمک به درک بدن شما و بهینه‌سازی تمرینات.' })}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CALC_LIST.map(c => (
          <Link
            key={c.slug}
            to={`/calculators/${c.slug}`}
            className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
              <Calculator className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold text-sm mb-1 group-hover:text-orange-400 transition-colors">{c.name}</h3>
            <p className="text-gray-400 text-xs">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Calculator not found', fa: 'ماشین‌حساب یافت نشد' })}</h1>
        <button onClick={() => navigate('/calculators')} className="text-orange-400 hover:text-orange-300">
          {t({ en: '← Back to calculators', fa: 'بازگشت به ماشین‌حساب‌ها' })}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/calculators')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 rtl:!rotate-180" /> {t({ en: 'All Calculators', fa: 'همه ماشین‌حساب‌ها' })}
      </button>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{calcInfo.name}</h1>
            <p className="text-gray-400 text-sm">{calcInfo.desc}</p>
          </div>
        </div>
        <CalcComponent />
      </div>
    </div>
  );
}
