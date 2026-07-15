import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';

export function PersianNumber({ value }: { value: number | string }) {
  const { lang } = useI18n();
  const formatted = useMemo(() => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 }).format(value);
    }
    if (lang === 'fa') {
      return value.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
    }
    return value;
  }, [value, lang]);
  return <>{formatted}</>;
}

export function SliderInput({
  label, value, min, max, step, onChange, unit
}: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-orange-400 font-bold text-sm">
          <PersianNumber value={value} /> {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
      />
    </div>
  );
}

export function SegmentedToggle<T extends string>({
  options, value, onChange
}: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-gray-800 p-1 rounded-xl mb-4 border border-gray-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            value === opt.value ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CircularGauge({
  value, min, max, label, color = '#f97316'
}: {
  value: number; min: number; max: number; label: string; color?: string;
}) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#374151" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', duration: 1, bounce: 0 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-black text-white"><PersianNumber value={value} /></div>
      </div>
      <div className="mt-2 text-sm text-gray-400 font-medium">{label}</div>
    </div>
  );
}

export function BarChart({
  items
}: {
  items: { label: string; value: number; color: string; unit?: string }[]
}) {
  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
  return (
    <div className="w-full mt-4">
      <div className="flex h-4 rounded-full overflow-hidden mb-2 bg-gray-800">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="h-full"
            style={{ backgroundColor: item.color }}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ type: 'spring', duration: 1 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}: <PersianNumber value={item.value} />{item.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculatorLayout({
  title, description, inputs, results, onSave
}: {
  title: string; description: string; inputs: React.ReactNode; results: React.ReactNode; onSave?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{description}</p>
        <div className="space-y-4">
          {inputs}
        </div>
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-500/5 blur-[100px] pointer-events-none" />
        <div className="relative z-10 w-full">
          {results}
          {onSave && (
            <button onClick={onSave} className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors border border-gray-600">
              {t({ en: 'Save Result', fa: 'ذخیره نتیجه' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
