import { useState, useMemo } from 'react';
import { useI18n, faDict } from '@/lib/i18n';
import { calcBMI, calcBodyFat, calcFFMI, calcWHR, calcBodyType, BODY_TYPE_QUESTIONS } from '@/lib/calculators';
import { SliderInput, SegmentedToggle, CircularGauge, CalculatorLayout, PersianNumber } from './SharedCalculatorUI';
import { motion } from 'motion/react';

export function BmiCalculator() {
  const { t } = useI18n();
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  
  const result = useMemo(() => calcBMI(weight, height), [weight, height]);

  return (
    <CalculatorLayout
      title={t({ en: 'BMI Calculator', fa: 'محاسبه‌گر BMI' })}
      description={t({ en: 'Calculate your Body Mass Index.', fa: 'شاخص توده بدنی خود را محاسبه کنید.' })}
      inputs={
        <>
          <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={40} max={150} step={1} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'Height', fa: 'قد' })} value={height} min={140} max={220} step={1} onChange={setHeight} unit="cm" />
        </>
      }
      results={
        <div className="flex flex-col items-center">
          {result.ok ? (
            <>
              <CircularGauge
                value={result.value.bmi}
                min={10}
                max={40}
                label={t({ en: 'BMI', fa: 'شاخص BMI' })}
                status={result.value.bmi > 25 ? 'high' : result.value.bmi < 18.5 ? 'low' : 'ok'}
              />
              <div className="mt-4 text-xl font-bold">{result.value.category}</div>
            </>
          ) : (
            <div className="text-danger font-medium p-4 bg-danger/10 rounded-xl border border-danger/20">{result.error}</div>
          )}
        </div>
      }
    />
  );
}

export function BodyFatCalculator() {
  const { t } = useI18n();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [height, setHeight] = useState(175);
  const [hip, setHip] = useState(95);

  const result = useMemo(() => calcBodyFat(gender, waist, neck, height, hip), [gender, waist, neck, height, hip]);

  return (
    <CalculatorLayout
      title={t({ en: 'Body Fat % (US Navy)', fa: 'درصد چربی بدن (نیروی دریایی آمریکا)' })}
      description={t({ en: 'Estimate your body fat percentage using tape measurements.', fa: 'تخمین درصد چربی بدن با استفاده از اندازه‌گیری‌های نوار متر.' })}
      inputs={
        <>
          <SegmentedToggle options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} value={gender} onChange={setGender} />
          <SliderInput label={t({ en: 'Height', fa: 'قد' })} value={height} min={140} max={220} step={1} onChange={setHeight} unit="cm" />
          <SliderInput label={t({ en: 'Waist', fa: 'دور کمر' })} value={waist} min={60} max={150} step={1} onChange={setWaist} unit="cm" />
          <SliderInput label={t({ en: 'Neck', fa: 'دور گردن' })} value={neck} min={30} max={60} step={1} onChange={setNeck} unit="cm" />
          {gender === 'female' && (
            <SliderInput label={t({ en: 'Hip', fa: 'دور باسن' })} value={hip} min={70} max={150} step={1} onChange={setHip} unit="cm" />
          )}
        </>
      }
      results={
        <div className="flex flex-col items-center">
          {result.ok ? (
            <>
              <CircularGauge value={result.value.bodyFatPct} min={0} max={40} label={t({ en: 'Body Fat %', fa: 'درصد چربی' })} status="neutral" />
              <div className="mt-4 text-xl font-bold">{result.value.category}</div>
            </>
          ) : (
            <div className="text-danger font-medium p-4 bg-danger/10 rounded-xl border border-danger/20">{result.error}</div>
          )}
        </div>
      }
    />
  );
}

export function FfmiCalculator() {
  const { t } = useI18n();
  const [weight, setWeight] = useState(80);
  const [height, setHeight] = useState(175);
  const [bodyFat, setBodyFat] = useState(15);

  const result = useMemo(() => calcFFMI(weight, height, bodyFat), [weight, height, bodyFat]);

  return (
    <CalculatorLayout
      title={t({ en: 'FFMI Calculator', fa: 'محاسبه‌گر FFMI' })}
      description={t({ en: 'Fat-Free Mass Index to measure muscle potential.', fa: 'شاخص توده بدون چربی برای اندازه‌گیری پتانسیل عضلانی.' })}
      inputs={
        <>
          <SliderInput label={t({ en: 'Weight', fa: 'وزن' })} value={weight} min={50} max={150} step={1} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'Height', fa: 'قد' })} value={height} min={150} max={220} step={1} onChange={setHeight} unit="cm" />
          <SliderInput label={t({ en: 'Body Fat %', fa: 'درصد چربی' })} value={bodyFat} min={5} max={40} step={1} onChange={setBodyFat} unit="%" />
        </>
      }
      results={
        <div className="flex flex-col items-center">
          <CircularGauge value={result.adjusted} min={15} max={30} label={t({ en: 'Adjusted FFMI', fa: 'FFMI تنظیم شده' })} color="#8b5cf6" />
          <div className="mt-4 text-xl font-bold">{result.category}</div>
        </div>
      }
    />
  );
}

export function WhrCalculator() {
  const { t } = useI18n();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [waist, setWaist] = useState(85);
  const [hip, setHip] = useState(95);

  const result = useMemo(() => calcWHR(waist, hip, gender), [waist, hip, gender]);

  return (
    <CalculatorLayout
      title={t({ en: 'Waist-to-Hip Ratio', fa: 'نسبت دور کمر به باسن' })}
      description={t({ en: 'Assess central obesity and health risk.', fa: 'ارزیابی چاقی مرکزی و خطر سلامتی.' })}
      inputs={
        <>
          <SegmentedToggle options={[{ value: 'male', label: t({ en: 'Male', fa: 'مرد' }) }, { value: 'female', label: t({ en: 'Female', fa: 'زن' }) }]} value={gender} onChange={setGender} />
          <SliderInput label={t({ en: 'Waist', fa: 'دور کمر' })} value={waist} min={60} max={150} step={1} onChange={setWaist} unit="cm" />
          <SliderInput label={t({ en: 'Hip', fa: 'دور باسن' })} value={hip} min={70} max={150} step={1} onChange={setHip} unit="cm" />
        </>
      }
      results={
        <div className="flex flex-col items-center">
          {result.ok ? (
            <>
              <div className="text-5xl font-black text-brand mb-2"><PersianNumber value={result.value.whr} /></div>
              <div className="text-xl font-bold">{result.value.risk}</div>
            </>
          ) : (
            <div className="text-danger font-medium p-4 bg-danger/10 rounded-xl border border-danger/20">{result.error}</div>
          )}
        </div>
      }
    />
  );
}

export function BodyTypeQuiz() {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<number[]>(Array(BODY_TYPE_QUESTIONS.length).fill(-1));

  const bodyTypeLabels: Record<string, { en: string; fa: string }> = {
    ectomorph: { en: 'Ectomorph', fa: 'اکتومورف (باریک)' },
    mesomorph: { en: 'Mesomorph', fa: 'مزومورف (ورزشکار)' },
    endomorph: { en: 'Endomorph', fa: 'اندومورف (پهن‌اندام)' },
  };

  const bodyTypeDescriptions: Record<string, { en: string; fa: string }> = {
    ectomorph: {
      en: 'You have an ectomorphic body type — naturally lean with a fast metabolism. You may find it harder to gain muscle mass. Focus on calorie-surplus diets, compound lifts, and progressive overload. Programs emphasizing hypertrophy (8-12 rep range) with adequate rest are ideal.',
      fa: 'تیپ بدنی شما اکتومورف است — لاغراندام با متابولیسم تند. افزایش حجم عضلانی ممکن است سخت‌تر باشد. روی رژیم مازاد کالری، حرکات ترکیبی و افزایش تدریجی بار تمرکز کنید. برنامه‌های هیپرتروفی (۸ تا ۱۲ تکرار) با استراحت کافی مناسب‌اند.',
    },
    mesomorph: {
      en: 'You have a mesomorphic body type — naturally muscular and athletic. You respond well to both strength and endurance training. You can gain muscle and lose fat relatively easily. A balanced program mixing strength training with moderate cardio works best.',
      fa: 'تیپ بدنی شما مزومورف است — عضلانی و ورزشکار. به تمرین قدرتی و استقامتی خوب پاسخ می‌دهید. افزایش عضله و کاهش چربی نسبتاً آسان است. برنامه متعادل قدرتی همراه با هوازی ملایم بهترین نتیجه را می‌دهد.',
    },
    endomorph: {
      en: 'You have an endomorphic body type — naturally broader with a tendency to store fat. Focus on a combination of resistance training and regular cardio. Diet control is especially important. High-protein diets with moderate carbs work well for your body type.',
      fa: 'تیپ بدنی شما اندومورف است — پهن‌اندام با تمایل به ذخیره چربی. ترکیب تمرین مقاومتی و هوازی منظم را در اولویت بگذارید. کنترل رژیم غذایی اهمیت زیادی دارد. رژیم پرپروتئین با کربوهیدرات متعادل برای شما مناسب است.',
    },
  };

  const translateQuizText = (text: string) => t({ en: text, fa: faDict[text] || text });
  
  const isComplete = answers.every(a => a !== -1);
  const result = useMemo(() => isComplete ? calcBodyType(answers) : null, [answers, isComplete]);

  const handleAnswer = (qIdx: number, aIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = aIdx;
    setAnswers(newAnswers);
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold mb-2">{t({ en: 'Body Type Quiz', fa: 'آزمون تیپ بدنی' })}</h3>
      <p className="text-fg-subtle text-sm mb-6">{t({ en: 'Find out your natural body type.', fa: 'تیپ بدنی طبیعی خود را پیدا کنید.' })}</p>
      
      {!isComplete ? (
        <div className="space-y-6">
          {BODY_TYPE_QUESTIONS.map((q, qIdx) => {
            if (answers.findIndex(a => a === -1) !== qIdx && answers[qIdx] === -1) return null; // Show one by one or all? Let's show all for simplicity
            return (
              <div key={qIdx} className="bg-elevated/50 p-4 rounded-xl">
                <p className="font-medium mb-3">{translateQuizText(q.question)}</p>
                <div className="space-y-2">
                  {q.options.map((opt, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleAnswer(qIdx, aIdx)}
                      className={`w-full text-left rtl:text-right p-3 rounded-lg border transition-colors ${answers[qIdx] === aIdx ? 'bg-brand-muted border-brand text-brand' : 'bg-elevated border-strong hover:border-strong'}`}
                    >
                      {translateQuizText(opt.text)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-elevated p-8 rounded-2xl border border-strong">
          <div className="text-3xl font-black text-brand uppercase mb-4">
            {result ? t(bodyTypeLabels[result.type]) : ''}
          </div>
          <p className="text-fg-muted leading-relaxed mb-6">
            {result ? t(bodyTypeDescriptions[result.type]) : ''}
          </p>
          <button onClick={() => setAnswers(Array(BODY_TYPE_QUESTIONS.length).fill(-1))} className="px-6 py-2 bg-elevated-hover hover:bg-elevated-hover rounded-lg text-sm font-bold">
            {t({ en: 'Retake Quiz', fa: 'تکرار آزمون' })}
          </button>
        </motion.div>
      )}
    </div>
  );
}
