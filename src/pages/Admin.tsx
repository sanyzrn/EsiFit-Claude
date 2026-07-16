import { useState, useEffect } from 'react';
import { Shield, Users, Activity, TrendingUp, BarChart3, Settings } from 'lucide-react';
import { getState, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { AdminCharts } from '@/components/charts/IranianCharts';
import { PageContainer } from '@/components/ui/PageContainer';

export default function Admin() {
  const { t } = useI18n();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const stats = [
    { icon: Users, label: t({ en: 'Total Users', fa: 'کاربران کل' }), value: '—', color: 'var(--theme-primary)' },
    { icon: Activity, label: t({ en: 'Active Users', fa: 'کاربران فعال' }), value: '—', color: 'var(--theme-secondary)' },
    { icon: TrendingUp, label: t({ en: 'Premium Users', fa: 'کاربران ویژه' }), value: '—', color: 'var(--theme-accent)' },
    { icon: BarChart3, label: t({ en: 'Total Logs', fa: 'گزارشات کل' }), value: state.exerciseLogs.length.toString(), color: 'var(--theme-warning)' },
  ];

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-error) 12%, transparent)' }}>
          <Shield className="w-6 h-6" style={{ color: 'var(--theme-error)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display">{t({ en: 'Admin Panel', fa: 'پنل مدیریت' })}</h1>
          <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'System overview and user management', fa: 'نمای کلی سیستم و مدیریت کاربران' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
              <span className="text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>{s.label}</span>
            </div>
            <div className="text-3xl font-black font-display">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card-premium p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 font-display">{t({ en: 'Analytics', fa: 'تحلیل‌ها' })}</h2>
        <AdminCharts />
      </div>

      <div className="card-premium p-6">
        <h2 className="text-lg font-bold mb-4 font-display">{t({ en: 'System Settings', fa: 'تنظیمات سیستم' })}</h2>
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ backgroundColor: 'var(--theme-elevated)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--theme-fg-subtle)' }} />
          <span className="text-sm" style={{ color: 'var(--theme-fg-muted)' }}>
            {t({ en: 'Dashboard data will populate once the backend API is connected.', fa: 'داده‌های داشبورد پس از اتصال API پشتیبان نمایش داده می‌شوند.' })}
          </span>
        </div>
      </div>
    </PageContainer>
  );
}
