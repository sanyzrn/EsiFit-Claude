import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, DollarSign, TrendingUp, BarChart3, FileText, Dumbbell, Apple } from 'lucide-react';
import { getState, subscribe, PLANS, EXERCISES, PROGRAMS, DIET_PLANS, ARTICLES } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useEntitlements } from '@/lib/entitlements';

export default function Admin() {
  const [state, setState] = useState(getState());
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useI18n();
  const { role, loading } = useEntitlements();
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  useEffect(() => {
    if (!loading && (!state.currentUser || role !== 'ADMIN')) navigate('/');
  }, [state.currentUser, role, loading, navigate]);

  if (loading || !state.currentUser || role !== 'ADMIN') return null;

  const tabs = [
    { id: 'overview', icon: BarChart3, label: t({ en: 'Overview', fa: 'نمای کلی' }) },
    { id: 'users', icon: Users, label: t({ en: 'Users', fa: 'کاربران' }) },
    { id: 'exercises', icon: Dumbbell, label: t({ en: 'Exercises', fa: 'تمرین‌ها' }) },
    { id: 'programs', icon: FileText, label: t({ en: 'Programs', fa: 'برنامه‌ها' }) },
    { id: 'diet', icon: Apple, label: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }) },
    { id: 'articles', icon: FileText, label: t({ en: 'Articles', fa: 'مقاله‌ها' }) },
  ];

  // Simulated users
  const demoUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'USER', tier: 'VIP', created: '2024-10-15' },
    { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'USER', tier: 'ECONOMY', created: '2024-11-01' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'USER', tier: 'FREE', created: '2024-11-20' },
    { id: '4', name: 'Coach Smith', email: 'coach@esifit.com', role: 'COACH', tier: 'ELITE', created: '2024-09-01' },
    { id: '5', name: 'Admin User', email: 'admin@esifit.com', role: 'ADMIN', tier: 'ELITE', created: '2024-08-01' },
    { id: '6', name: 'Lisa Davis', email: 'lisa@example.com', role: 'USER', tier: 'ELITE', created: '2024-12-01' },
  ];

  const vipCount = demoUsers.filter(u => u.tier === 'VIP').length;
  const economyCount = demoUsers.filter(u => u.tier === 'ECONOMY').length;
  const eliteCount = demoUsers.filter(u => u.tier === 'ELITE' && u.role === 'USER').length;
  const mrr = vipCount * 2999 + economyCount * 999 + eliteCount * 7999;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-elevated text-fg-muted hover:bg-elevated-hover'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-green-400" /><span className="text-sm text-fg-subtle">{t({ en: 'MRR', fa: 'درآمد ماهانه' })}</span></div>
              <div className="text-3xl font-black text-green-400">${(mrr / 100).toFixed(0)}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-blue-400" /><span className="text-sm text-fg-subtle">{t({ en: 'Total Users', fa: 'کل کاربران' })}</span></div>
              <div className="text-3xl font-black">{demoUsers.length}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-orange-400" /><span className="text-sm text-fg-subtle">{t({ en: 'New This Week', fa: 'جدید در این هفته' })}</span></div>
              <div className="text-3xl font-black">3</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-purple-400" /><span className="text-sm text-fg-subtle">{t({ en: 'Paid Subscribers', fa: 'مشترکین پولی' })}</span></div>
              <div className="text-3xl font-black">{vipCount + economyCount + eliteCount}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-bold mb-4">{t({ en: 'Revenue by Plan', fa: 'درآمد بر اساس طرح' })}</h3>
              {PLANS.filter(p => p.priceMonthly > 0).map(plan => {
                const count = demoUsers.filter(u => u.tier === plan.tier && u.role === 'USER').length;
                return (
                  <div key={plan.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm">{plan.name} ({count} {t({ en: 'users', fa: 'کاربران' })})</span>
                    <span className="text-sm font-bold text-green-400">${((plan.priceMonthly * count) / 100).toFixed(2)}/mo</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
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
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
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
                {demoUsers.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-elevated/50">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-fg-subtle">{u.email}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                        u.role === 'COACH' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-elevated-hover text-fg-muted'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.tier === 'ELITE' ? 'bg-purple-500/20 text-purple-400' :
                        u.tier === 'VIP' ? 'bg-orange-500/20 text-orange-400' :
                        u.tier === 'ECONOMY' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-elevated-hover text-fg-muted'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="p-4 text-center text-fg-subtle">{u.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Exercise Library', fa: 'کتابخانه تمرین‌ها' })} ({EXERCISES.length} {t({ en: 'exercises', fa: 'تمرین' })})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ {t({ en: 'Add Exercise', fa: 'افزودن تمرین' })}</button>
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
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Training Programs', fa: 'برنامه‌های آموزشی' })} ({PROGRAMS.length})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ {t({ en: 'Add Program', fa: 'افزودن برنامه' })}</button>
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
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' })} ({DIET_PLANS.length})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ {t({ en: 'Add Diet Plan', fa: 'افزودن برنامه غذایی' })}</button>
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
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">{t({ en: 'Blog Articles', fa: 'مقاله‌های وبلاگ' })} ({ARTICLES.length})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ {t({ en: 'Add Article', fa: 'افزودن مقاله' })}</button>
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
    </div>
  );
}
