import { useState, useEffect } from 'react';
import { GraduationCap, Users, MessageSquare, Calendar, Star, TrendingUp } from 'lucide-react';
import { getState, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { PageContainer } from '@/components/ui/PageContainer';

export default function Coach() {
  const { t } = useI18n();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const stats = [
    { icon: Users, label: t({ en: 'Clients', fa: 'مشتریان' }), value: '—', color: 'var(--theme-primary)' },
    { icon: Calendar, label: t({ en: 'Sessions', fa: 'جلسات' }), value: '—', color: 'var(--theme-accent)' },
    { icon: Star, label: t({ en: 'Rating', fa: 'امتیاز' }), value: '—', color: 'var(--theme-warning)' },
    { icon: TrendingUp, label: t({ en: 'Progress', fa: 'پیشرفت' }), value: '—', color: 'var(--theme-secondary)' },
  ];

  const tickets = state.tickets.filter(t => t.status === 'open');

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--theme-accent-dim)' }}>
          <GraduationCap className="w-6 h-6" style={{ color: 'var(--theme-accent)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display">{t({ en: 'Coach Dashboard', fa: 'داشبورد مربی' })}</h1>
          <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'Manage clients, programs, and communication', fa: 'مدیریت مشتریان، برنامه‌ها و ارتباطات' })}
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold mb-4 font-display">{t({ en: 'Open Tickets', fa: 'تیکت‌های باز' })}</h2>
          {tickets.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-elevated)' }}>
              <MessageSquare className="w-5 h-5" style={{ color: 'var(--theme-fg-subtle)' }} />
              <span className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
                {t({ en: 'No open tickets', fa: 'تیکت بازی وجود ندارد' })}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(t => (
                <div key={t.id} className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--theme-elevated)' }}>
                  <div className="font-medium text-sm">{t.subject}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>
                    {t.messages.length} {t({ en: 'messages', fa: 'پیام' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-premium p-6">
          <h2 className="text-lg font-bold mb-4 font-display">{t({ en: 'Client Activity', fa: 'فعالیت مشتریان' })}</h2>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-elevated)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--theme-fg-subtle)' }} />
            <span className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: 'Client activity feed will appear here once the backend is connected.', fa: 'فید فعالیت مشتریان پس از اتصال به سرور نمایش داده می‌شود.' })}
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
