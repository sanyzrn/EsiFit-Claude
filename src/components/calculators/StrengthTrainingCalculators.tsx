import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { calcOneRepMax, getRepMaxTable, calcVolumeLoad } from '@/lib/calculators';
import { SliderInput, SegmentedToggle, CalculatorLayout, PersianNumber } from './SharedCalculatorUI';

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
              <div className="text-sm text-fg-subtle mb-1">{t({ en: 'Estimated 1RM', fa: 'رکورد تخمینی' })}</div>
              <div className="text-5xl font-black text-brand mb-6"><PersianNumber value={oneRMResult.value} /> <span className="text-xl">kg</span></div>

              <div className="w-full bg-elevated rounded-xl overflow-hidden border border-strong">
                <div className="grid grid-cols-3 bg-elevated-hover/50 p-2 text-xs font-bold text-fg-subtle">
                  <div className="text-center">% 1RM</div>
                  <div className="text-center">{t({ en: 'Weight', fa: 'وزنه' })}</div>
                  <div className="text-center">{t({ en: 'Reps', fa: 'تکرار' })}</div>
                </div>
                <div className="divide-y divide-border max-h-48 overflow-y-auto custom-scrollbar">
                  {table.map((row) => (
                    <div key={row.percentage} className="grid grid-cols-3 p-2 text-sm">
                      <div className="text-center font-medium text-brand"><PersianNumber value={row.percentage} />%</div>
                      <div className="text-center font-bold"><PersianNumber value={row.weight} /> kg</div>
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
    />
  );
}

export function VolumeLoadCalculator() {
  const { t } = useI18n();
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);

  const result = useMemo(() => calcVolumeLoad([{ sets, reps, weightKg: weight }]), [sets, reps, weight]);

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
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black text-brand mb-2"><PersianNumber value={result} /></div>
          <div className="text-fg-subtle font-medium">{t({ en: 'kg Total Volume', fa: 'کیلوگرم حجم کل' })}</div>
        </div>
      }
    />
  );
}
