import React, { useId, useMemo } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';
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
    const map = { low: '#d4a017', ok: '#14b8a6', high: '#c45c5c', neutral: '#14b8a6' };
    return map[status];
  }
  const map = {
    low: getThemeCssVar('--theme-warning'),
    ok: getThemeCssVar('--theme-success'),
    high: getThemeCssVar('--theme-error'),
    neutral: getThemeCssVar('--theme-primary'),
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
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <label htmlFor={inputId} className="text-sm font-medium text-fg-muted">{label}</label>
        <span className="text-brand font-semibold text-sm" aria-hidden="true">
          <PersianNumber value={value} /> {unit && <span className="text-xs text-fg-faint font-normal">{unit}</span>}
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
        className="w-full h-1.5 bg-elevated rounded-full appearance-none cursor-pointer accent-brand"
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
    <div className="flex bg-elevated p-1 rounded-[12px] mb-5 border border-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 text-sm font-medium rounded-[10px] transition-colors duration-[180ms] ${
            value === opt.value ? 'bg-brand text-brand-fg' : 'text-fg-subtle hover:text-fg-muted'
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
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--theme-chart-track)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none" stroke={stroke} strokeWidth="6"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1" aria-hidden="true">
        <div className="text-3xl font-bold text-fg font-display"><PersianNumber value={value} /></div>
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
    <div className="w-full mt-5">
      <div className="flex h-4 rounded-[16px] overflow-hidden mb-3 bg-elevated border border-border">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="h-full"
            style={{ backgroundColor: item.color ?? defaultColors[i % defaultColors.length] }}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-fg-subtle">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color ?? defaultColors[i % defaultColors.length] }} />
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
    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
      <div className="card-premium p-7 md:p-8">
        <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
        <p className="text-fg-subtle text-sm mb-7 leading-relaxed">{description}</p>
        <div className="space-y-1">{inputs}</div>
      </div>
      <div className="card-premium p-7 md:p-8 flex flex-col justify-center items-center text-center min-h-[280px] bg-elevated/40">
        <div className="w-full" aria-live="polite" aria-atomic="true">
          {results}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="mt-8 px-6 py-3 bg-brand text-brand-fg text-sm font-semibold rounded-[12px] transition-[filter] duration-[180ms] hover:brightness-95 dark:hover:brightness-110"
            >
              {t({ en: 'Save Result', fa: 'ذخیره نتیجه' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
