import React, { useId, useMemo } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';
import { PersianPattern } from '@/components/ui/PersianPattern';
import { getThemeCssVar } from '@/lib/theme';

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

export function gaugeColorForStatus(status: 'low' | 'ok' | 'high' | 'neutral' = 'neutral'): string {
  if (typeof document === 'undefined') {
    const map = { low: '#e8b84a', ok: '#2bb5a8', high: '#e05a4a', neutral: '#2bb5a8' };
    return map[status];
  }
  const map = {
    low: getThemeCssVar('--theme-warning'),
    ok: getThemeCssVar('--theme-success'),
    high: getThemeCssVar('--theme-error'),
    neutral: getThemeCssVar('--theme-secondary'),
  };
  return map[status];
}

export function SliderInput({
  label, value, min, max, step, onChange, unit
}: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string;
}) {
  const inputId = useId();
  const valueText = unit ? `${value} ${unit}` : String(value);

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label htmlFor={inputId} className="text-sm font-medium text-fg-muted">{label}</label>
        <span className="text-brand font-bold text-sm" aria-hidden="true">
          <PersianNumber value={value} /> {unit && <span className="text-xs text-fg-faint">{unit}</span>}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        className="w-full h-2 bg-elevated-hover rounded-full appearance-none cursor-pointer accent-brand"
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
    <div className="flex bg-elevated p-1 rounded-xl mb-4 border border-strong">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            value === opt.value ? 'bg-brand text-[#1a1410] shadow-md' : 'text-fg-subtle hover:text-fg-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CircularGauge({
  value, min, max, label, color, status
}: {
  value: number; min: number; max: number; label: string; color?: string; status?: 'low' | 'ok' | 'high' | 'neutral';
}) {
  const gaugeId = useId();
  const stroke = color ?? gaugeColorForStatus(status ?? 'neutral');
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center" role="group" aria-labelledby={`${gaugeId}-label`}>
      <p id={gaugeId} className="sr-only" aria-live="polite" aria-atomic="true">
        {label}: {value}
      </p>
      <svg width="132" height="132" viewBox="0 0 100 100" className="transform -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--theme-chart-track)" strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none" stroke={stroke} strokeWidth="7"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', duration: 1, bounce: 0 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1" aria-hidden="true">
        <div className="text-3xl font-black text-fg font-display"><PersianNumber value={value} /></div>
      </div>
      <div id={`${gaugeId}-label`} className="mt-2 text-sm text-fg-subtle font-medium">{label}</div>
    </div>
  );
}

export function BarChart({
  items
}: {
  items: { label: string; value: number; color?: string; unit?: string }[]
}) {
  const defaultColors = [
    getThemeCssVar('--theme-chart-1'),
    getThemeCssVar('--theme-chart-2'),
    getThemeCssVar('--theme-chart-3'),
  ];
  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
  return (
    <div className="w-full mt-4">
      <div className="flex h-5 rounded-full overflow-hidden mb-3 bg-elevated border border-border">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="h-full"
            style={{ backgroundColor: item.color ?? defaultColors[i % defaultColors.length] }}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ type: 'spring', duration: 1 }}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-fg-subtle">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color ?? defaultColors[i % defaultColors.length] }} />
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
      <div className="card-iranian p-6 relative overflow-hidden">
        <PersianPattern opacity={0.25} />
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
          <p className="text-fg-subtle text-sm mb-6">{description}</p>
          <div className="space-y-4">{inputs}</div>
        </div>
      </div>
      <div className="card-iranian p-6 relative overflow-hidden gradient-hero flex flex-col justify-center items-center text-center min-h-[280px]">
        <PersianPattern opacity={0.4} />
        <div className="relative z-10 w-full" aria-live="polite" aria-atomic="true">
          {results}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="mt-8 px-6 py-2.5 bg-elevated hover:bg-elevated-hover text-fg text-sm font-bold rounded-xl transition-colors border border-strong"
            >
              {t({ en: 'Save Result', fa: 'ذخیره نتیجه' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
