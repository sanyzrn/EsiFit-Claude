import type { ReactNode } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { useChartTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { PersianPattern } from '@/components/ui/PersianPattern';

type AdminChartsProps = {
  revenueByPlan: { name: string; revenue: number; users: number }[];
  userGrowth: { month: string; users: number; paid: number }[];
  mrr: number;
};

export function AdminCharts({ revenueByPlan, userGrowth, mrr }: AdminChartsProps) {
  const chart = useChartTheme();
  const { t } = useI18n();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card-iranian p-5 relative overflow-hidden">
        <PersianPattern opacity={0.3} />
        <div className="relative z-10">
          <h3 className="font-bold mb-1 font-display">{t({ en: 'Revenue by Plan', fa: 'درآمد بر اساس طرح' })}</h3>
          <p className="text-xs text-fg-subtle mb-4">
            {t({ en: `Total MRR: $${(mrr / 100).toFixed(0)}`, fa: `کل درآمد ماهانه: $${(mrr / 100).toFixed(0)}` })}
          </p>
          <div dir="ltr" className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlan} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="name" stroke={chart.axis} fontSize={11} />
                <YAxis stroke={chart.axis} fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, t({ en: 'Revenue', fa: 'درآمد' })]}
                />
                <Bar dataKey="revenue" fill={chart.primary} radius={[6, 6, 0, 0]} name={t({ en: 'Revenue/mo', fa: 'درآمد/ماه' })} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-iranian p-5 relative overflow-hidden">
        <PersianPattern opacity={0.3} />
        <div className="relative z-10">
          <h3 className="font-bold mb-4 font-display">{t({ en: 'User Growth', fa: 'رشد کاربران' })}</h3>
          <div dir="ltr" className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.secondary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chart.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="month" stroke={chart.axis} fontSize={11} />
                <YAxis stroke={chart.axis} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={chart.tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="users" stroke={chart.secondary} fill="url(#usersGrad)" name={t({ en: 'Total users', fa: 'کل کاربران' })} />
                <Line type="monotone" dataKey="paid" stroke={chart.accent} strokeWidth={2} dot={{ fill: chart.accent }} name={t({ en: 'Paid', fa: 'پولی' })} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
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

  const charts = [
    weightData.length > 0 && {
      key: 'weight',
      title: t({ en: 'Weight Trend', fa: 'روند وزن' }),
      node: (
        <LineChart data={weightData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} />
          <YAxis stroke={chart.axis} fontSize={11} />
          <Tooltip contentStyle={chart.tooltipStyle} />
          <Line type="monotone" dataKey="weight" stroke={chart.primary} strokeWidth={2.5} dot={{ fill: chart.primary, r: 4 }} name={t({ en: 'kg', fa: 'کیلوگرم' })} />
        </LineChart>
      ),
    },
    measurementData.length > 0 && {
      key: 'measurements',
      title: t({ en: 'Body Measurements', fa: 'اندازه‌گیری‌های بدن' }),
      node: (
        <LineChart data={measurementData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} />
          <YAxis stroke={chart.axis} fontSize={11} />
          <Tooltip contentStyle={chart.tooltipStyle} />
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
        <LineChart data={strengthData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} />
          <YAxis stroke={chart.axis} fontSize={11} />
          <Tooltip contentStyle={chart.tooltipStyle} />
          <Line type="monotone" dataKey="estimated1RM" stroke={chart.secondary} strokeWidth={2.5} dot={{ fill: chart.secondary, r: 4 }} />
        </LineChart>
      ),
    },
    volumeData.length > 0 && {
      key: 'volume',
      title: t({ en: 'Workout Volume', fa: 'حجم تمرین' }),
      node: (
        <BarChart data={volumeData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
          <XAxis dataKey="date" stroke={chart.axis} fontSize={11} />
          <YAxis stroke={chart.axis} fontSize={11} />
          <Tooltip contentStyle={chart.tooltipStyle} />
          <Bar dataKey="volume" fill={chart.accent} radius={[6, 6, 0, 0]} name={t({ en: 'kg×reps', fa: 'کیلو×تکرار' })} />
        </BarChart>
      ),
    },
  ].filter(Boolean) as { key: string; title: string; node: ReactNode }[];

  if (charts.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {charts.map((c) => (
        <div key={c.key} className="card-iranian p-5 relative overflow-hidden">
          <PersianPattern opacity={0.25} />
          <h3 className="relative z-10 font-bold mb-4 font-display">{c.title}</h3>
          <div className="relative z-10 h-52" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">{c.node}</ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
