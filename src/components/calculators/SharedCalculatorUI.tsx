import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
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

/** Smooth count-up for hero metrics */
export function AnimatedNumber({
  value,
  decimals = 0,
  className = '',
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (reduce) return;
    const start = fromRef.current;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 420;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = start + diff * eased;
      setDisplay(next);
      fromRef.current = next;
      if (p < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduce]);

  const shown = reduce ? value : display;

  return (
    <span className={className}>
      <PersianNumber value={Number(shown.toFixed(decimals))} />
    </span>
  );
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
  const pct = ((value - min) / (max - min)) * 100;
  const primary = 'var(--theme-primary)';
  const track = 'var(--theme-elevated)';

  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2.5">
        <label htmlFor={inputId} className="text-sm font-medium text-fg-muted">{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.16 }}
          className="text-brand font-bold text-sm tabular-nums"
          aria-hidden="true"
        >
          <PersianNumber value={value} /> {unit && <span className="text-xs text-fg-faint font-normal">{unit}</span>}
        </motion.span>
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
        className="viz-slider w-full"
        style={{
          background: `linear-gradient(to right, ${primary} 0%, ${primary} ${pct}%, ${track} ${pct}%, ${track} 100%)`,
        }}
      />
    </div>
  );
}

export function SegmentedToggle<T extends string>({
  options, value, onChange
}: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  const layoutGroup = useId();
  return (
    <div className="flex bg-elevated p-1 rounded-[12px] mb-5 border border-border relative">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 py-2.5 text-sm font-medium rounded-[10px] transition-colors duration-200 z-10 ${
              active ? 'text-brand-fg' : 'text-fg-subtle hover:text-fg-muted'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`segment-pill-${layoutGroup}`}
                className="absolute inset-0 rounded-[10px] bg-brand"
                style={{ boxShadow: '0 0 18px color-mix(in srgb, var(--theme-primary) 35%, transparent)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Hero circular gauge with gradient stroke + soft glow */
export function CircularGauge({
  value, min, max, label, color, status, size = 148, decimals = 0,
}: {
  value: number; min: number; max: number; label: string; color?: string; status?: 'low' | 'ok' | 'high' | 'neutral';
  size?: number; decimals?: number;
}) {
  const gaugeId = useId();
  const gradId = useId();
  const stroke = color ?? gaugeColorForStatus(status ?? 'neutral');
  const secondary = getThemeCssVar('--theme-secondary') || stroke;
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const reduce = useReducedMotion();

  return (
    <div className="relative flex flex-col items-center" role="group" aria-labelledby={`${gaugeId}-label`}>
      <p id={gaugeId} className="sr-only" aria-live="polite" aria-atomic="true">
        {label}: {value}
      </p>
      <div className="viz-glow-ring relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stroke} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--theme-chart-track)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <div className="text-3xl md:text-4xl font-black text-fg font-display tabular-nums leading-none">
            <AnimatedNumber value={value} decimals={decimals} />
          </div>
        </div>
      </div>
      <div id={`${gaugeId}-label`} className="mt-3 text-sm text-fg-subtle font-medium">{label}</div>
    </div>
  );
}

/** Semicircle BMI-style needle gauge */
export function NeedleGauge({
  value, min, max, label, bands,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
  bands: { to: number; color: string; name: string }[];
}) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = -90 + pct * 180;
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto" role="img" aria-label={`${label}: ${value}`}>
      <svg viewBox="0 0 200 120" className="w-full max-w-[240px]" aria-hidden>
        {bands.map((b, i) => {
          const start = i === 0 ? min : bands[i - 1].to;
          const a0 = ((start - min) / (max - min)) * 180;
          const a1 = ((Math.min(b.to, max) - min) / (max - min)) * 180;
          return (
            <path
              key={b.name}
              d={describeArc(100, 100, 72, -180 + a0, -180 + a1)}
              fill="none"
              stroke={b.color}
              strokeWidth="14"
              strokeLinecap="butt"
              opacity={0.9}
            />
          );
        })}
        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          initial={reduce ? false : { rotate: -90 }}
          animate={{ rotate: angle }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18 }}
        >
          <line x1="100" y1="100" x2="100" y2="38" stroke="var(--theme-fg)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="var(--theme-primary)" />
          <circle cx="100" cy="100" r="3" fill="var(--theme-surface)" />
        </motion.g>
      </svg>
      <div className="text-4xl font-black font-display text-fg tabular-nums -mt-2">
        <AnimatedNumber value={value} decimals={1} />
      </div>
      <div className="text-sm text-fg-subtle mt-1">{label}</div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

/** Horizontal macro / nutrition progress bars */
export function MacroProgressBars({
  items,
}: {
  items: { label: string; value: number; goal?: number; color?: string; unit?: string }[];
}) {
  const colors = [
    getThemeCssVar('--theme-chart-1'),
    getThemeCssVar('--theme-chart-2'),
    getThemeCssVar('--theme-chart-3'),
  ];
  return (
    <div className="w-full space-y-4 mt-2">
      {items.map((item, i) => {
        const goal = item.goal ?? Math.max(item.value, 1);
        const pct = Math.min(100, (item.value / goal) * 100);
        const color = item.color ?? colors[i % colors.length];
        return (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-fg-muted">{item.label}</span>
              <span className="tabular-nums text-fg font-semibold">
                <PersianNumber value={item.value} />
                {item.unit}
                <span className="text-fg-faint font-normal ms-2">{Math.round(pct)}%</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-elevated overflow-hidden border border-border">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, white))`,
                  boxShadow: `0 0 12px color-mix(in srgb, ${color} 40%, transparent)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Stacked / segmented bar (macros share) */
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
      <div className="flex h-5 rounded-[16px] overflow-hidden mb-4 bg-elevated border border-border">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="h-full relative group"
            style={{
              background: `linear-gradient(180deg, ${item.color ?? defaultColors[i % defaultColors.length]}, color-mix(in srgb, ${item.color ?? defaultColors[i % defaultColors.length]} 75%, black))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
            whileHover={{ filter: 'brightness(1.15)' }}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-fg-subtle">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: item.color ?? defaultColors[i % defaultColors.length],
                boxShadow: `0 0 8px ${item.color ?? defaultColors[i % defaultColors.length]}`,
              }}
            />
            <span>{item.label}: <PersianNumber value={item.value} />{item.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Donut with center total — muscle / volume distribution */
export function DonutChart({
  items,
  centerLabel,
  centerValue,
}: {
  items: { label: string; value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const id = useId();
  const colors = [
    getThemeCssVar('--theme-chart-1'),
    getThemeCssVar('--theme-chart-2'),
    getThemeCssVar('--theme-chart-3'),
    getThemeCssVar('--theme-chart-4'),
    '#a78bfa',
  ];
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const r = 36;
  const c = 2 * Math.PI * r;
  const lengths = items.map((item) => (item.value / total) * c);
  const offsets = lengths.map((_, i) =>
    -lengths.slice(0, i).reduce((sum, len) => sum + len, 0)
  );
  const segments = items.map((item, i) => ({
    label: item.label,
    value: item.value,
    color: item.color ?? colors[i % colors.length],
    dash: `${lengths[i]} ${c - lengths[i]}`,
    dashOffset: offsets[i],
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative viz-glow-ring">
        <svg width="160" height="160" viewBox="0 0 100 100" aria-hidden>
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.label}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={seg.dash}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              transform="rotate(-90 50 50)"
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: seg.dash }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          <circle cx="50" cy="50" r="26" fill="var(--theme-surface)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="text-lg font-black font-display tabular-nums text-fg leading-tight">
            {typeof centerValue === 'number' ? <AnimatedNumber value={centerValue} /> : centerValue}
          </div>
          {centerLabel && <div className="text-[10px] uppercase tracking-wider text-fg-subtle mt-0.5">{centerLabel}</div>}
        </div>
      </div>
      <ul className="space-y-2 text-sm" id={id}>
        {segments.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-fg-muted">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="flex-1">{item.label}</span>
            <span className="tabular-nums font-semibold text-fg"><PersianNumber value={Math.round((item.value / total) * 100)} />%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Body-fat silhouette strip (lean → higher BF) */
export function BodyFatSpectrum({ level }: { level: number }) {
  const { t } = useI18n();
  const stages = [
    { max: 10, label: t({ en: 'Lean', fa: 'کم‌چربی' }) },
    { max: 15, label: t({ en: 'Athletic', fa: 'ورزشی' }) },
    { max: 20, label: t({ en: 'Fit', fa: 'فیت' }) },
    { max: 28, label: t({ en: 'Average', fa: 'متوسط' }) },
    { max: 100, label: t({ en: 'High', fa: 'بالا' }) },
  ];
  const active = stages.findIndex(s => level <= s.max);

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between gap-1.5">
        {stages.map((s, i) => {
          const on = i === active;
          const scale = 0.7 + i * 0.08;
          return (
            <motion.div
              key={s.label}
              className={`flex-1 flex flex-col items-center gap-2 rounded-[12px] py-3 border transition-colors ${
                on ? 'border-brand bg-brand-muted' : 'border-border bg-elevated/50'
              }`}
              animate={{ y: on ? -4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg viewBox="0 0 40 70" className="w-8 h-14" aria-hidden style={{ opacity: on ? 1 : 0.45 }}>
                <ellipse cx="20" cy="10" rx={6 * scale} ry={7 * scale} fill={on ? 'var(--theme-primary)' : 'var(--theme-fg-faint)'} />
                <path
                  d={`M${20 - 7 * scale} 20 Q20 ${28 + i * 2} ${20 + 7 * scale} 20 L${20 + 9 * scale} ${55 + i} Q20 ${62 + i} ${20 - 9 * scale} ${55 + i} Z`}
                  fill={on ? 'var(--theme-primary)' : 'var(--theme-fg-faint)'}
                  opacity={0.85}
                />
              </svg>
              <span className={`text-[10px] font-semibold ${on ? 'text-brand' : 'text-fg-faint'}`}>{s.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** Category spectrum for BMI */
export function CategorySpectrum({
  value, min, max, markers,
}: {
  value: number;
  min: number;
  max: number;
  markers: { at: number; label: string; color: string }[];
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="w-full mt-5">
      <div className="relative h-3 rounded-full overflow-hidden border border-border"
        style={{
          background: `linear-gradient(90deg, ${markers.map((m, i) => {
            const p = ((m.at - min) / (max - min)) * 100;
            return `${m.color} ${i === 0 ? 0 : p}%`;
          }).join(', ')})`,
        }}
      >
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-fg border-2 border-surface"
          style={{
            boxShadow: '0 0 12px color-mix(in srgb, var(--theme-primary) 50%, transparent)',
            left: `calc(${pct}% - 7px)`,
          }}
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-fg-faint">
        {markers.map(m => (
          <span key={m.label}>{m.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DeltaBadge({ value, label }: { value: number; label?: string }) {
  const positive = value >= 0;
  return (
    <motion.div
      className="viz-delta"
      style={positive ? undefined : {
        background: 'color-mix(in srgb, var(--theme-error) 16%, transparent)',
        color: 'var(--theme-error)',
        borderColor: 'color-mix(in srgb, var(--theme-error) 30%, transparent)',
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <TrendingUp className={`w-3.5 h-3.5 ${positive ? '' : 'rotate-180'}`} />
      {positive ? '+' : ''}{value}%{label ? ` ${label}` : ''}
    </motion.div>
  );
}

/** Simple muscle-focus silhouette for strength calcs */
export function MuscleFocusArt({ highlight = 'back' }: { highlight?: 'back' | 'legs' | 'chest' | 'arms' }) {
  const hot = 'var(--theme-error)';
  const base = 'var(--theme-elevated-hover)';
  const zones: Record<string, string> = {
    back: highlight === 'back' ? hot : base,
    chest: highlight === 'chest' ? hot : base,
    legs: highlight === 'legs' ? hot : base,
    arms: highlight === 'arms' ? hot : base,
  };
  return (
    <motion.svg
      viewBox="0 0 120 180"
      className="w-28 h-40 mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-hidden
    >
      <ellipse cx="60" cy="22" rx="14" ry="16" fill={base} />
      <path d="M40 40 Q60 55 80 40 L88 95 Q60 110 32 95 Z" fill={zones.chest} />
      <path d="M32 50 L18 90 L28 95 L40 70 Z" fill={zones.arms} />
      <path d="M88 50 L102 90 L92 95 L80 70 Z" fill={zones.arms} />
      <path d="M38 100 L50 170 L58 170 L60 105 Z" fill={zones.legs} />
      <path d="M82 100 L70 170 L62 170 L60 105 Z" fill={zones.legs} />
      <path d="M45 48 Q60 70 75 48 L72 90 Q60 100 48 90 Z" fill={zones.back} opacity={0.9} />
      {highlight && (
        <motion.circle
          cx="60" cy={highlight === 'legs' ? 140 : highlight === 'arms' ? 70 : 65}
          r="18"
          fill="none"
          stroke={hot}
          strokeWidth="1.5"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ opacity: [0.25, 0.7, 0.25], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
}

export function CalculatorLayout({
  title, description, inputs, results, onSave, aside,
}: {
  title: string; description: string; inputs: React.ReactNode; results: React.ReactNode; onSave?: () => void;
  aside?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className={`grid gap-6 md:gap-8 ${aside ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
      <div className="viz-card p-7 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="viz-live-dot" aria-hidden />
          <h3 className="text-xl font-bold font-display">{title}</h3>
        </div>
        <p className="text-fg-subtle text-sm mb-7 leading-relaxed">{description}</p>
        <div className="space-y-1">{inputs}</div>
      </div>
      <div className={`viz-card viz-card-hero p-7 md:p-8 flex flex-col justify-center items-center text-center min-h-[300px] ${aside ? '' : ''}`}>
        <div className="w-full" aria-live="polite" aria-atomic="true">
          {results}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="mt-8 px-6 py-3 bg-brand text-brand-fg text-sm font-semibold rounded-[12px] transition-all duration-200 hover:bg-brand-dark hover:shadow-[0_0_24px_color-mix(in_srgb,var(--theme-primary)_40%,transparent)]"
            >
              {t({ en: 'Save Result', fa: 'ذخیره نتیجه' })}
            </button>
          )}
        </div>
      </div>
      {aside && (
        <div className="viz-card p-6 md:p-7 flex flex-col items-center justify-center">
          {aside}
        </div>
      )}
    </div>
  );
}
