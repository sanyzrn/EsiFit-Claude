import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { calcOneRepMax, getRepMaxTable, calcVolumeLoad } from '@/lib/calculators';
import {
  SliderInput, SegmentedToggle, CalculatorLayout, PersianNumber,
  CircularGauge, MuscleFocusArt, AnimatedNumber, DonutChart,
} from './SharedCalculatorUI';

export function OneRepMaxCalculator() {
  const { t } = useI18n();
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [formula, setFormula] = useState<'epley' | 'brzycki'>('epley');

  const oneRMResult = useMemo(() => calcOneRepMax(weight, reps, formula), [weight, reps, formula]);
  const table = useMemo(
    () => (oneRMResult.ok ? getRepMaxTable(oneRMResult.value) : []),
    [oneRMResult]
  );

  return (
    <CalculatorLayout
      title={t({ en: 'One-Rep Max (1RM)', fa: 'محاسبه‌گر یک تکرار بیشینه (1RM)' })}
      description={t({ en: 'Estimate your maximum strength.', fa: 'حداکثر قدرت خود را تخمین بزنید.' })}
      inputs={
        <>
          <SegmentedToggle options={[{ value: 'epley', label: 'Epley' }, { value: 'brzycki', label: 'Brzycki' }]} value={formula} onChange={setFormula} />
          <SliderInput label={t({ en: 'Weight Lifted', fa: 'وزنه' })} value={weight} min={10} max={300} step={2.5} onChange={setWeight} unit="kg" />
          <SliderInput label={t({ en: 'Reps Completed', fa: 'تعداد تکرار' })} value={reps} min={1} max={20} step={1} onChange={setReps} unit="reps" />
        </>
      }
      results={
        <div className="flex flex-col items-center w-full">
          {oneRMResult.ok ? (
            <>
              <CircularGauge
                value={oneRMResult.value}
                min={weight}
                max={Math.max(oneRMResult.value * 1.15, weight + 20)}
                label={t({ en: 'Estimated 1RM (kg)', fa: 'رکورد تخمینی (کیلو)' })}
                status="ok"
                decimals={1}
              />
              <div className="w-full mt-6 viz-card border border-border rounded-[16px] overflow-hidden">
                <div className="grid grid-cols-3 bg-elevated/80 p-2.5 text-xs font-bold text-fg-subtle">
                  <div className="text-center">% 1RM</div>
                  <div className="text-center">{t({ en: 'Weight', fa: 'وزنه' })}</div>
                  <div className="text-center">{t({ en: 'Reps', fa: 'تکرار' })}</div>
                </div>
                <div className="divide-y divide-border max-h-48 overflow-y-auto">
                  {table.map((row) => (
                    <div key={row.percentage} className="grid grid-cols-3 p-2.5 text-sm hover:bg-brand-muted/40 transition-colors">
                      <div className="text-center font-medium text-brand"><PersianNumber value={row.percentage} />%</div>
                      <div className="text-center font-bold tabular-nums"><PersianNumber value={row.weight} /> kg</div>
                      <div className="text-center text-fg-subtle"><PersianNumber value={row.reps} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-danger font-medium p-4 bg-danger/10 rounded-xl border border-danger/20">{oneRMResult.error}</div>
          )}
        </div>
      }
      aside={
        <div className="text-center">
          <MuscleFocusArt highlight="back" />
          <p className="text-xs text-fg-subtle mt-3 leading-relaxed">
            {t({
              en: 'Latissimus & pulling chains light up for back-dominant lifts — use % chart for warm-up sets.',
              fa: 'برای حرکات کششی، عضلات پشت فعال می‌شوند — از جدول درصد برای ست‌های گرم‌کردن استفاده کنید.',
            })}
          </p>
        </div>
      }
    />
  );
}

export function VolumeLoadCalculator() {
  const { t } = useI18n();
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);

  const result = useMemo(() => calcVolumeLoad([{ sets, reps, weightKg: weight }]), [sets, reps, weight]);
  const setVol = sets * reps * weight;

  return (
    <CalculatorLayout
      title={t({ en: 'Volume Load Calculator', fa: 'محاسبه‌گر حجم تمرین' })}
      description={t({ en: 'Calculate total tonnage lifted.', fa: 'محاسبه کل تناژ جابجا شده.' })}
      inputs={
        <>
          <SliderInput label={t({ en: 'Sets', fa: 'ست‌ها' })} value={sets} min={1} max={10} step={1} onChange={setSets} />
          <SliderInput label={t({ en: 'Reps per Set', fa: 'تکرار در هر ست' })} value={reps} min={1} max={30} step={1} onChange={setReps} />
          <SliderInput label={t({ en: 'Weight', fa: 'وزنه' })} value={weight} min={2.5} max={300} step={2.5} onChange={setWeight} unit="kg" />
        </>
      }
      results={
        <div className="flex flex-col items-center w-full gap-6">
          <div className="text-center">
            <div className="text-5xl font-black text-brand mb-2 font-display tabular-nums">
              <AnimatedNumber value={result} />
            </div>
            <div className="text-fg-subtle font-medium">{t({ en: 'kg Total Volume', fa: 'کیلوگرم حجم کل' })}</div>
          </div>
          <DonutChart
            centerLabel={t({ en: 'kg', fa: 'کیلو' })}
            centerValue={result}
            items={[
              { label: t({ en: 'Sets × Reps', fa: 'ست × تکرار' }), value: Math.max(sets * reps, 1) },
              { label: t({ en: 'Load share', fa: 'سهم وزنه' }), value: Math.max(weight, 1) },
              { label: t({ en: 'Session', fa: 'جلسه' }), value: Math.max(setVol / 10, 1) },
            ]}
          />
        </div>
      }
    />
  );
}
