import type { ReactNode } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, Cell, ComposedChart } from 'recharts';
import { motion } from 'motion/react';
import { useChartTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { DeltaBadge } from '@/components/calculators/SharedCalculatorUI';

type AdminChartsProps = {
  revenueByPlan: { name: string; revenue: number; users: number }[];
  userGrowth: { month: string; users: number; paid: number }[];
  mrr: number;
};

function ChartShell({ title, subtitle, children, delta }: { title: string; subtitle?: string; children: ReactNode; delta?: number }) {
  return (
    <motion.div
      className="viz-card p-7"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-bold font-display">{title}</h3>
          {subtitle && <p className="text-xs text-fg-subtle mt-1">{subtitle}</p>}
        </div>
        {typeof delta === 'number' && <DeltaBadge value={delta} label="WoW" />}
      </div>
      <div className="h-56 chart-surface overflow-hidden" style={{ direction: 'ltr' }}>
        {children}
      </div>
    </motion.div>
  );
}

export function AdminCharts({ revenueByPlan, userGrowth, mrr }: AdminChartsProps) {
  const chart = useChartTheme();
  const { t } = useI18n();
  const { formatToman, formatNumber } = useLocaleFormat();
  const growthDelta = userGrowth.length >= 2
    ? Math.round(((userGrowth[userGrowth.length - 1].users - userGrowth[userGrowth.length - 2].users) / Math.max(1, userGrowth[userGrowth.length - 2].users)) * 100)
    : 12;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ChartShell
        title={t({ en: 'Revenue by Plan', fa: 'درآمد بر اساس طرح' })}
        subtitle={`${t({ en: 'Total MRR: ', fa: 'کل درآمد ماهانه: ' })}${formatToman(mrr)}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueByPlan} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chart.primary} stopOpacity={1} />
                <stop offset="100%" stopColor={chart.primary} stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={chart.grid} vertical={false} />
            <XAxis dataKey="name" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke={chart.axis}
              fontSize={11}
              width={72}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatNumber(Number(v) / 1000) + 'k'}
            />
            <Tooltip
              contentStyle={{ ...chart.tooltipStyle, boxShadow: `0 0 24px color-mix(in srgb, ${chart.primary} 18%, transparent)` }}
              formatter={(value) => [formatToman(Number(value ?? 0)), t({ en: 'Revenue', fa: 'درآمد' })]}
            />
            <Bar dataKey="revenue" fill="url(#revBarGrad)" radius={[10, 10, 0, 0]} name={t({ en: 'Revenue/mo', fa: 'درآمد/ماه' })}>
              {revenueByPlan.map((_, i) => (
                <Cell key={i} fill="url(#revBarGrad)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title={t({ en: 'User Growth', fa: 'رشد کاربران' })}
        delta={growthDelta}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={userGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="usersGradViz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chart.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={chart.primary} stopOpacity={0} />
              </linearGradient>
              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={chart.grid} vertical={false} />
            <XAxis dataKey="month" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={chart.axis} fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip
              contentStyle={{ ...chart.tooltipStyle, boxShadow: `0 0 24px color-mix(in srgb, ${chart.primary} 18%, transparent)` }}
              formatter={(value) => [formatNumber(Number(value ?? 0)), '']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              stroke={chart.primary}
              strokeWidth={2.5}
              fill="url(#usersGradViz)"
              filter="url(#lineGlow)"
              name={t({ en: 'Total users', fa: 'کل کاربران' })}
            />
            <Line
              type="monotone"
              dataKey="paid"
              stroke={chart.secondary}
              strokeWidth={2}
              dot={{ r: 3, fill: chart.secondary, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name={t({ en: 'Paid', fa: 'پولی' })}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
}

export function ProgressCharts({
  weightData,
  strengthData,
  measurementData,
  volumeData,
}: {
  weightData: { date: string; weight: number }[];
  strengthData: { date: string; estimated1RM: number }[];
  measurementData: { date: string; waist?: number; chest?: number; arm?: number }[];
  volumeData: { date: string; volume: number }[];
}) {
  const chart = useChartTheme();
  const { t } = useI18n();
  const { formatNumber } = useLocaleFormat();

  const weightDelta = weightData.length >= 2
    ? Math.round(((weightData[weightData.length - 1].weight - weightData[0].weight) / Math.max(1, weightData[0].weight)) * 1000) / 10
    : undefined;

  const charts = [
    weightData.length > 0 && {
      key: 'weight',
      title: t({ en: 'Weight Trend', fa: 'روند وزن' }),
      delta: weightDelta,
      node: (
        <ComposedChart data={weightData}>
          <defs>
            <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chart.primary} stopOpacity={0.25} />
              <stop offset="100%" stopColor={chart.primary} stopOpacity={0} />
            </linearGradient>
            <filter id="weightGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
          <Tooltip
            contentStyle={{ ...chart.tooltipStyle, boxShadow: `0 0 20px color-mix(in srgb, ${chart.primary} 16%, transparent)` }}
            formatter={(value) => [formatNumber(Number(value ?? 0)), t({ en: 'kg', fa: 'کیلوگرم' })]}
          />
          <Area type="monotone" dataKey="weight" stroke="none" fill="url(#weightArea)" />
          <Line type="monotone" dataKey="weight" stroke={chart.primary} strokeWidth={2.5} filter="url(#weightGlow)" dot={{ fill: chart.primary, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name={t({ en: 'kg', fa: 'کیلوگرم' })} />
        </ComposedChart>
      ),
    },
    measurementData.length > 0 && {
      key: 'measurements',
      title: t({ en: 'Body Measurements', fa: 'اندازه‌گیری‌های بدن' }),
      node: (
        <LineChart data={measurementData}>
          <CartesianGrid strokeDasharray="2 4" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
          <Tooltip
            contentStyle={chart.tooltipStyle}
            formatter={(value) => [formatNumber(Number(value ?? 0)), 'cm']}
          />
          <Legend />
          <Line type="monotone" dataKey="waist" stroke={chart.accent} strokeWidth={2} dot={false} name={t({ en: 'Waist', fa: 'کمر' })} connectNulls />
          <Line type="monotone" dataKey="chest" stroke={chart.secondary} strokeWidth={2} dot={false} name={t({ en: 'Chest', fa: 'سینه' })} connectNulls />
          <Line type="monotone" dataKey="arm" stroke={chart.series[3]} strokeWidth={2} dot={false} name={t({ en: 'Arm', fa: 'بازو' })} connectNulls />
        </LineChart>
      ),
    },
    strengthData.length > 0 && {
      key: 'strength',
      title: t({ en: 'Estimated 1RM', fa: 'تخمین 1RM' }),
      node: (
        <ComposedChart data={strengthData}>
          <defs>
            <linearGradient id="strArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chart.secondary} stopOpacity={0.28} />
              <stop offset="100%" stopColor={chart.secondary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
          <Tooltip
            contentStyle={chart.tooltipStyle}
            formatter={(value) => [formatNumber(Number(value ?? 0)), 'kg']}
          />
          <Area type="monotone" dataKey="estimated1RM" stroke="none" fill="url(#strArea)" />
          <Line type="monotone" dataKey="estimated1RM" stroke={chart.secondary} strokeWidth={2.5} dot={{ fill: chart.secondary, r: 4, strokeWidth: 0 }} />
        </ComposedChart>
      ),
    },
    volumeData.length > 0 && {
      key: 'volume',
      title: t({ en: 'Workout Volume', fa: 'حجم تمرین' }),
      node: (
        <BarChart data={volumeData}>
          <defs>
            <linearGradient id="volBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chart.accent} stopOpacity={1} />
              <stop offset="100%" stopColor={chart.accent} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(Number(v))} />
          <Tooltip
            contentStyle={chart.tooltipStyle}
            formatter={(value) => [formatNumber(Number(value ?? 0)), t({ en: 'kg×reps', fa: 'کیلو×تکرار' })]}
          />
          <Bar dataKey="volume" fill="url(#volBar)" radius={[10, 10, 0, 0]} name={t({ en: 'kg×reps', fa: 'کیلو×تکرار' })} />
        </BarChart>
      ),
    },
  ].filter(Boolean) as { key: string; title: string; node: ReactNode; delta?: number }[];

  if (charts.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {charts.map((c) => (
        <ChartShell key={c.key} title={c.title} delta={c.delta}>
          <ResponsiveContainer width="100%" height="100%">{c.node}</ResponsiveContainer>
        </ChartShell>
      ))}
    </div>
  );
}
