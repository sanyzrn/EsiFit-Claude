import { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, TrendingUp, BarChart3, FileText, Dumbbell, Apple } from 'lucide-react';
import { getState, subscribe, PLANS, EXERCISES, PROGRAMS, DIET_PLANS, ARTICLES } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { AdminCharts } from '@/components/charts/IranianCharts';
import { IconBadge } from '@/components/ui/IconBadge';
import { PageContainer } from '@/components/ui/PageContainer';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { apiFetch } from '@/lib/api-client';
import type { Role, SubscriptionTier } from '@/lib/types';

type AdminUserRow = {
  id: string;
  name: string;
  email: string | null;
  role: Role;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
};

export default function Admin() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [nowMs] = useState(() => Date.now());
  const { t } = useI18n();
  const { formatToman, formatNumber, formatDate } = useLocaleFormat();

  useEffect(() => {
    const u = subscribe(() => setState(getState()));
    return () => { u(); };
  }, []);

  // RoleGate in App.tsx handles access; fetch real users from SQL admin API
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiFetch<{ users: AdminUserRow[] }>('/admin/users');
        if (cancelled) return;
        setUsers(data.users ?? []);
        setUsersError('');
      } catch {
        if (cancelled) return;
        setUsers([]);
        setUsersError(t({ en: 'Could not load users', fa: 'بارگذاری کاربران ممکن نشد' }));
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  if (!state.currentUser) return null;

  const tabs = [
    { id: 'overview', icon: BarChart3, label: t({ en: 'Overview', fa: 'نمای کلی' }) },
    { id: 'users', icon: Users, label: t({ en: 'Users', fa: 'کاربران' }) },
    { id: 'exercises', icon: Dumbbell, label: t({ en: 'Exercises', fa: 'تمرین‌ها' }) },
    { id: 'programs', icon: FileText, label: t({ en: 'Programs', fa: 'برنامه‌ها' }) },
    { id: 'diet', icon: Apple, label: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }) },
    { id: 'articles', icon: FileText, label: t({ en: 'Articles', fa: 'مقاله‌ها' }) },
  ];

  const vipCount = users.filter(u => u.subscriptionTier === 'VIP').length;
  const economyCount = users.filter(u => u.subscriptionTier === 'ECONOMY').length;
  const eliteCount = users.filter(u => u.subscriptionTier === 'ELITE' && u.role === 'USER').length;
  const mrr = vipCount * PLANS.find(p => p.tier === 'VIP')!.priceMonthly
    + economyCount * PLANS.find(p => p.tier === 'ECONOMY')!.priceMonthly
    + eliteCount * PLANS.find(p => p.tier === 'ELITE')!.priceMonthly;

  const revenueByPlan = PLANS.filter(p => p.priceMonthly > 0).map((plan) => {
    const count = users.filter(u => u.subscriptionTier === plan.tier && u.role === 'USER').length;
    return {
      name: plan.name,
      revenue: plan.priceMonthly * count,
      users: count,
    };
  });

  const byMonth = new Map<string, { users: number; paid: number }>();
  for (const u of users) {
    const d = new Date(u.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = byMonth.get(key) ?? { users: 0, paid: 0 };
    cur.users += 1;
    if (u.subscriptionTier !== 'FREE' && u.role === 'USER') cur.paid += 1;
    byMonth.set(key, cur);
  }
  const userGrowth = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-5)
    .map(([key, v]) => ({
      month: key.slice(5),
      users: v.users,
      paid: v.paid,
    }));

  const weekAgo = nowMs - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = users.filter(u => new Date(u.createdAt).getTime() >= weekAgo).length;

  return (
    <PageContainer padY="md">
      <div className="flex items-center gap-3 mb-8">
        <IconBadge icon={Shield} variant="terracotta" size="md" />
        <div>
          <h1 className="text-2xl font-black">{t({ en: 'Admin Dashboard', fa: 'داشبورد مدیریت' })}</h1>
          <p className="text-sm text-fg-subtle">{t({ en: 'Manage users, content, and revenue', fa: 'مدیریت کاربران، محتوا و درآمد' })}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-medium text-sm whitespace-nowrap transition-[color,background-color] duration-[180ms] ${
              activeTab === tab.id ? 'bg-brand text-brand-fg font-semibold' : 'bg-elevated text-fg-muted hover:bg-elevated-hover'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-iranian p-5">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-success" /><span className="text-sm text-fg-subtle">{t({ en: 'MRR', fa: 'درآمد ماهانه' })}</span></div>
              <div className="text-2xl font-black text-success font-display">{formatToman(mrr)}</div>
            </div>
            <div className="card-iranian p-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-accent" /><span className="text-sm text-fg-subtle">{t({ en: 'Total Users', fa: 'کل کاربران' })}</span></div>
              <div className="text-3xl font-black font-display">{usersLoading ? '—' : formatNumber(users.length)}</div>
            </div>
            <div className="card-iranian p-5">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-brand" /><span className="text-sm text-fg-subtle">{t({ en: 'New This Week', fa: 'جدید در این هفته' })}</span></div>
              <div className="text-3xl font-black font-display">{usersLoading ? '—' : formatNumber(newThisWeek)}</div>
            </div>
            <div className="card-iranian p-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-terracotta" /><span className="text-sm text-fg-subtle">{t({ en: 'Paid Subscribers', fa: 'مشترکین پولی' })}</span></div>
              <div className="text-3xl font-black font-display">{usersLoading ? '—' : formatNumber(vipCount + economyCount + eliteCount)}</div>
            </div>
          </div>

          <AdminCharts revenueByPlan={revenueByPlan} userGrowth={userGrowth.length ? userGrowth : [{ month: '—', users: 0, paid: 0 }]} mrr={mrr} />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card-iranian p-5">
              <h3 className="font-bold mb-4">{t({ en: 'Revenue by Plan', fa: 'درآمد بر اساس طرح' })}</h3>
              {PLANS.filter(p => p.priceMonthly > 0).map(plan => {
                const count = users.filter(u => u.subscriptionTier === plan.tier && u.role === 'USER').length;
                return (
                  <div key={plan.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm">{plan.name} ({count} {t({ en: 'users', fa: 'کاربران' })})</span>
                    <span className="text-sm font-bold text-success">{formatToman(plan.priceMonthly * count)}/{t({ en: 'mo', fa: 'ماه' })}</span>
                  </div>
                );
              })}
            </div>
            <div className="card-iranian p-5">
              <h3 className="font-bold mb-4">{t({ en: 'Content Overview', fa: 'نمای کلی محتوا' })}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-subtle">{t({ en: 'Exercises', fa: 'تمرین‌ها' })}</span>
                  <span className="font-bold">{EXERCISES.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-subtle">{t({ en: 'Programs', fa: 'برنامه‌ها' })}</span>
                  <span className="font-bold">{PROGRAMS.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-subtle">{t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' })}</span>
                  <span className="font-bold">{DIET_PLANS.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-subtle">{t({ en: 'Articles', fa: 'مقاله‌ها' })}</span>
                  <span className="font-bold">{ARTICLES.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card-iranian overflow-hidden p-0 animate-fade-in">
          {usersError && (
            <div className="p-4 text-sm text-danger border-b border-border">{usersError}</div>
          )}
          {usersLoading ? (
            <div className="p-8 flex justify-center" role="status">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-elevated/50">
                    <th className="text-left rtl:text-right p-4 font-medium text-fg-subtle">{t({ en: 'Name', fa: 'نام' })}</th>
                    <th className="text-left rtl:text-right p-4 font-medium text-fg-subtle">{t({ en: 'Email', fa: 'ایمیل' })}</th>
                    <th className="p-4 text-center font-medium text-fg-subtle">{t({ en: 'Role', fa: 'نقش' })}</th>
                    <th className="p-4 text-center font-medium text-fg-subtle">{t({ en: 'Tier', fa: 'طرح' })}</th>
                    <th className="p-4 text-center font-medium text-fg-subtle">{t({ en: 'Joined', fa: 'تاریخ عضویت' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-fg-subtle">
                        {t({ en: 'No users found', fa: 'کاربری یافت نشد' })}
                      </td>
                    </tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-elevated/50">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-fg-subtle">{u.email ?? '—'}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'ADMIN' ? 'bg-danger/15 text-danger' :
                          u.role === 'COACH' ? 'bg-terracotta/15 text-terracotta' :
                          'bg-elevated-hover text-fg-muted'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.subscriptionTier === 'ELITE' ? 'bg-terracotta/15 text-terracotta' :
                          u.subscriptionTier === 'VIP' ? 'bg-brand-muted text-brand' :
                          u.subscriptionTier === 'ECONOMY' ? 'bg-accent-muted text-accent' :
                          'bg-elevated-hover text-fg-muted'
                        }`}>
                          {u.subscriptionTier}
                        </span>
                      </td>
                      <td className="p-4 text-center text-fg-subtle">
                        {formatDate(u.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="card-iranian overflow-hidden p-0 animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Exercise Library', fa: 'کتابخانه تمرین‌ها' })} ({EXERCISES.length} {t({ en: 'exercises', fa: 'تمرین' })})</h3>
            <button className="px-3 py-1.5 bg-brand text-brand-fg text-sm font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">+ {t({ en: 'Add Exercise', fa: 'افزودن تمرین' })}</button>
          </div>
          <div className="divide-y divide-border">
            {EXERCISES.map(ex => (
              <div key={ex.id} className="px-4 py-3 flex items-center justify-between hover:bg-elevated/50">
                <div>
                  <div className="font-medium text-sm">{ex.name}</div>
                  <div className="text-xs text-fg-subtle">{ex.muscleGroups.join(', ')} · {ex.difficulty}</div>
                </div>
                <button className="text-xs text-fg-subtle hover:text-fg">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="card-iranian overflow-hidden p-0 animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Training Programs', fa: 'برنامه‌های آموزشی' })} ({PROGRAMS.length})</h3>
            <button className="px-3 py-1.5 bg-brand text-brand-fg text-sm font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">+ {t({ en: 'Add Program', fa: 'افزودن برنامه' })}</button>
          </div>
          <div className="divide-y divide-border">
            {PROGRAMS.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-elevated/50">
                <div>
                  <div className="font-medium text-sm">{p.title}</div>
                  <div className="text-xs text-fg-subtle">{p.level} · {p.daysPerWeek} {t({ en: 'days/week', fa: 'روز/هفته' })} · {p.requiredTier}</div>
                </div>
                <button className="text-xs text-fg-subtle hover:text-fg">{t({ en: 'Edit', fa: 'ویرایش' })}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'diet' && (
        <div className="card-iranian overflow-hidden p-0 animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' })} ({DIET_PLANS.length})</h3>
            <button className="px-3 py-1.5 bg-brand text-brand-fg text-sm font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">+ {t({ en: 'Add Diet Plan', fa: 'افزودن برنامه غذایی' })}</button>
          </div>
          <div className="divide-y divide-border">
            {DIET_PLANS.map(d => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between hover:bg-elevated/50">
                <div>
                  <div className="font-medium text-sm">{d.title}</div>
                  <div className="text-xs text-fg-subtle">{d.totalCalories} {t({ en: 'kcal', fa: 'کالری' })} · {d.meals.length} {t({ en: 'meals', fa: 'وعده' })} · {d.requiredTier}</div>
                </div>
                <button className="text-xs text-fg-subtle hover:text-fg">{t({ en: 'Edit', fa: 'ویرایش' })}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="card-iranian overflow-hidden p-0 animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Blog Articles', fa: 'مقاله‌های وبلاگ' })} ({ARTICLES.length})</h3>
            <button className="px-3 py-1.5 bg-brand text-brand-fg text-sm font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">+ {t({ en: 'Add Article', fa: 'افزودن مقاله' })}</button>
          </div>
          <div className="divide-y divide-border">
            {ARTICLES.map(a => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between hover:bg-elevated/50">
                <div>
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-fg-subtle">{a.category} · {a.publishedAt}</div>
                </div>
                <button className="text-xs text-fg-subtle hover:text-fg">{t({ en: 'Edit', fa: 'ویرایش' })}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
