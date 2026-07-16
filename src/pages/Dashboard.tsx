import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, User, Target, BarChart3, MessageSquare, CreditCard,
  Flame, TrendingUp, Dumbbell, Plus, Calendar, Save, Crown, Activity,
  Heart, Clock, Award, Zap, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import {
  getState, subscribe, updateProfile, addBodyLog, addExerciseLog,
  addTicket, addMessageToTicket, getStreak, PLANS, EXERCISES
} from '@/lib/store';
import type { Goal, ActivityLevel } from '@/lib/types';
import { useI18n, faDict } from '@/lib/i18n';
import { ProgressCharts } from '@/components/charts/IranianCharts';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageContainer } from '@/components/ui/PageContainer';
import { useEntitlements } from '@/lib/entitlements';
import { fetchPaymentsEnabled } from '@/lib/payments';
import PaymentsNotice from '@/components/PaymentsNotice';

// ─── Sidebar ───
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(getState());
  const location = useLocation();
  const { t } = useI18n();
  const { subscriptionTier } = useEntitlements();
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  if (!state.currentUser) return null;

  const tabs = [
    { path: '/dashboard', icon: LayoutDashboard, label: t({ en: 'Overview', fa: 'نمای کلی' }) },
    { path: '/dashboard/profile', icon: User, label: t({ en: 'Profile', fa: 'نمایه' }) },
    { path: '/dashboard/programs', icon: Target, label: t({ en: 'Programs', fa: 'برنامه‌ها' }) },
    { path: '/dashboard/progress', icon: BarChart3, label: t({ en: 'Progress', fa: 'پیشرفت' }) },
    { path: '/dashboard/chat', icon: MessageSquare, label: t({ en: 'Chat', fa: 'گفتگو' }) },
    { path: '/dashboard/billing', icon: CreditCard, label: t({ en: 'Billing', fa: 'صورتحساب' }) },
  ];

  return (
    <PageContainer padY="md">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-60 shrink-0">
          <div className="card-premium p-4 md:sticky md:top-24">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
                {state.currentUser.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{state.currentUser.name}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--theme-primary)' }}>{subscriptionTier}</div>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => {
                const active = location.pathname === tab.path;
                return (
                  <Link key={tab.path} to={tab.path}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-[180ms]"
                    style={{
                      backgroundColor: active ? 'var(--theme-primary-dim)' : 'transparent',
                      color: active ? 'var(--theme-primary)' : 'var(--theme-fg-subtle)',
                    }}>
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </PageContainer>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, accent }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; accent?: { text: string; href: string };
}) {
  return (
    <div className="card-premium p-5 transition-all duration-[280ms]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-xs font-medium" style={{ color: 'var(--theme-fg-subtle)' }}>{label}</span>
      </div>
      <div className="text-3xl font-black font-display mb-1">{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--theme-fg-faint)' }}>{sub}</div>}
      {accent && (
        <Link to={accent.href} className="text-xs font-semibold mt-2 inline-flex items-center gap-1"
          style={{ color: accent.text }}>
          {accent.text} <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, desc, href, color }: {
  icon: any; title: string; desc: string; href: string; color: string;
}) {
  return (
    <Link to={href} className="card-premium p-5 hover:border-border-accent transition-all duration-[280ms] group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3 className="font-bold text-sm mb-1">{title}</h3>
      <p className="text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>{desc}</p>
    </Link>
  );
}

// ─── Overview ───
export function DashboardOverview() {
  const { t } = useI18n();
  const { formatDate, formatNumber } = useLocaleFormat();
  const [state, setState] = useState(getState());
  const { subscriptionTier } = useEntitlements();
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const streak = getStreak();
  const totalWorkouts = state.exerciseLogs.length;
  const totalLogs = state.bodyLogs.length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
            <Activity className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-black font-display">
              {t({ en: `Welcome back`, fa: `خوش‌آمدید` })}
            </h1>
            <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: "Here's your fitness overview.", fa: 'در اینجا نمای کلی تناسب اندام شما را مشاهده می‌کنید.' })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Flame} label={t({ en: 'Streak', fa: 'روزهای متوالی' })}
            value={formatNumber(streak)} sub={t({ en: 'days', fa: 'روز' })}
            color="var(--theme-primary)" />
          <StatCard icon={Dumbbell} label={t({ en: 'Workouts', fa: 'تمرین‌ها' })}
            value={totalWorkouts} sub={t({ en: 'logged', fa: 'ثبت‌شده' })}
            color="var(--theme-accent)" />
          <StatCard icon={TrendingUp} label={t({ en: 'Body Logs', fa: 'سوابق بدن' })}
            value={totalLogs} sub={t({ en: 'entries', fa: 'مورد' })}
            color="var(--theme-secondary)" />
          <StatCard icon={Crown} label={t({ en: 'Plan', fa: 'طرح' })}
            value={subscriptionTier}
            accent={{ text: t({ en: 'Upgrade', fa: 'ارتقا' }), href: '/pricing' }}
            color="var(--theme-primary)" />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <QuickActionCard icon={BarChart3} color="var(--theme-primary)"
            title={t({ en: 'Log Progress', fa: 'ثبت پیشرفت' })}
            desc={t({ en: 'Track your body measurements', fa: 'اندازه‌های بدن خود را پیگیری کنید' })}
            href="/dashboard/progress" />
          <QuickActionCard icon={Target} color="var(--theme-accent)"
            title={t({ en: 'Browse Programs', fa: 'مرور برنامه‌ها' })}
            desc={t({ en: 'Find your next training program', fa: 'برنامه بعدی را پیدا کنید' })}
            href="/programs" />
          <QuickActionCard icon={Zap} color="var(--theme-secondary)"
            title={t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' })}
            desc={t({ en: 'BMI, TDEE, macros, and more', fa: 'BMI، TDEE، درشت‌مغذی‌ها و...' })}
            href="/calculators" />
        </div>

        {/* Recent Activity */}
        {state.exerciseLogs.length > 0 && (
          <div className="card-premium p-5">
            <h3 className="font-bold mb-4 font-display">{t({ en: 'Recent Exercise Logs', fa: 'سوابق جدید تمرین' })}</h3>
            <div className="space-y-2">
              {state.exerciseLogs.slice(-5).reverse().map(log => (
                <div key={log.id} className="flex justify-between items-center text-sm py-2.5 border-b last:border-0"
                  style={{ borderColor: 'var(--theme-border)' }}>
                  <div>
                    <span className="font-medium">{log.exerciseName}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--theme-fg-subtle)' }}>
                      {log.sets}×{log.reps} @ {log.weightKg}kg
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--theme-fg-faint)' }}>{formatDate(log.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Profile ───
export function DashboardProfile() {
  const { t } = useI18n();
  const { calendar, setCalendar } = useLocaleFormat();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  const user = state.currentUser;
  const [form, setForm] = useState({
    name: user?.name || '', age: user?.age?.toString() || '',
    gender: user?.gender || 'male', heightCm: user?.heightCm?.toString() || '',
    weightKg: user?.weightKg?.toString() || '',
    goal: (user?.goal || 'MUSCLE_GAIN') as Goal,
    activityLevel: (user?.activityLevel || 'MODERATE') as ActivityLevel,
    injuries: user?.injuries || '',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: form.name, age: Number(form.age) || undefined, gender: form.gender,
      heightCm: Number(form.heightCm) || undefined, weightKg: Number(form.weightKg) || undefined,
      goal: form.goal as Goal, activityLevel: form.activityLevel as ActivityLevel, injuries: form.injuries,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goalOptions: Record<Goal, string> = {
    MUSCLE_GAIN: t({ en: 'Muscle Gain', fa: 'عضله‌سازی' }),
    FAT_LOSS: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }),
    GENERAL_FITNESS: t({ en: 'General Fitness', fa: 'تناسب اندام عمومی' }),
    STRENGTH: t({ en: 'Strength', fa: 'افزایش قدرت' }),
  };
  const activityOptions: Record<ActivityLevel, string> = {
    SEDENTARY: t({ en: 'Sedentary', fa: 'بی‌تحرک' }),
    LIGHT: t({ en: 'Light', fa: 'سبک' }),
    MODERATE: t({ en: 'Moderate', fa: 'متوسط' }),
    ACTIVE: t({ en: 'Active', fa: 'فعال' }),
    VERY_ACTIVE: t({ en: 'Very Active', fa: 'بسیار فعال' }),
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black mb-6 font-display">{t({ en: 'Profile', fa: 'نمایه' })}</h1>
        <form onSubmit={handleSave} className="card-premium p-6 space-y-5 max-w-2xl">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: t({ en: 'Full Name', fa: 'نام کامل' }), key: 'name', type: 'text' },
              { label: t({ en: 'Age', fa: 'سن' }), key: 'age', type: 'number' },
              { label: t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' }), key: 'heightCm', type: 'number' },
              { label: t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' }), key: 'weightKg', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-fg-muted)' }}>{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm outline-none rounded-xl transition-all duration-[180ms]"
                  style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-fg-muted)' }}>{t({ en: 'Gender', fa: 'جنسیت' })}</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }}>
                <option value="male">{t({ en: 'Male', fa: 'مرد' })}</option><option value="female">{t({ en: 'Female', fa: 'زن' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-fg-muted)' }}>{t({ en: 'Goal', fa: 'هدف' })}</label>
              <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value as Goal})}
                className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }}>
                {Object.entries(goalOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-fg-muted)' }}>{t({ en: 'Activity', fa: 'فعالیت' })}</label>
              <select value={form.activityLevel} onChange={e => setForm({...form, activityLevel: e.target.value as ActivityLevel})}
                className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }}>
                {Object.entries(activityOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-fg-muted)' }}>
              {t({ en: 'Injuries / Notes', fa: 'آسیب‌دیدگی‌ها / یادداشت‌ها' })}
            </label>
            <textarea value={form.injuries} onChange={e => setForm({...form, injuries: e.target.value})} rows={3}
              className="w-full px-3 py-2.5 text-sm outline-none rounded-xl resize-none"
              style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }}
              placeholder={t({ en: 'Any injuries or conditions...', fa: 'هرگونه آسیب‌دیدگی یا شرایط پزشکی...' })} />
          </div>
          <div className="border-t pt-5" style={{ borderColor: 'var(--theme-border)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-fg-muted)' }}>
              {t({ en: 'Calendar', fa: 'تقویم' })}
            </label>
            <div className="flex gap-2">
              {(['jalali', 'gregorian'] as const).map(c => (
                <button key={c} type="button" onClick={() => setCalendar(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms]`}
                  style={{
                    backgroundColor: calendar === c ? 'var(--theme-primary)' : 'var(--theme-elevated)',
                    color: calendar === c ? 'var(--theme-primary-fg)' : 'var(--theme-fg-muted)',
                  }}>
                  {c === 'jalali' ? t({ en: 'Jalali', fa: 'شمسی' }) : t({ en: 'Gregorian', fa: 'میلادی' })}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-[180ms] disabled:opacity-50"
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
            <Save className="w-4 h-4" />
            {saving ? t({ en: 'Saving...', fa: 'در حال ذخیره...' }) : saved ? t({ en: 'Saved!', fa: 'ذخیره شد!' }) : t({ en: 'Save', fa: 'ذخیره' })}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

// ─── Programs ───
export function DashboardPrograms() {
  const { t } = useI18n();
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black mb-6 font-display">{t({ en: 'My Programs', fa: 'برنامه‌های من' })}</h1>
        <div className="card-premium">
          <EmptyState icon={Target} variant="firuze"
            title={t({ en: 'No active programs yet', fa: 'هنوز برنامه فعالی ندارید' })}
            description={t({ en: 'Browse our programs and start training!', fa: 'برنامه‌ها را مرور کنید و تمرین را شروع کنید!' })}
            action={{ label: t({ en: 'Browse Programs', fa: 'مرور برنامه‌ها' }), href: '/programs' }} />
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Progress ───
export function DashboardProgress() {
  const { t } = useI18n();
  const { formatDate, formatNumber } = useLocaleFormat();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const [showForm, setShowForm] = useState(false);
  const [logForm, setLogForm] = useState({ weightKg: '', waistCm: '', neckCm: '', hipCm: '', chestCm: '', armCm: '', bodyFatPct: '' });
  const [showExForm, setShowExForm] = useState(false);
  const [exForm, setExForm] = useState({ exerciseId: EXERCISES[0]?.id || '', sets: '3', reps: '10', weightKg: '60' });

  const handleLogBody = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyLog({
      date: new Date().toISOString(), weightKg: Number(logForm.weightKg) || undefined,
      waistCm: Number(logForm.waistCm) || undefined, neckCm: Number(logForm.neckCm) || undefined,
      hipCm: Number(logForm.hipCm) || undefined, chestCm: Number(logForm.chestCm) || undefined,
      armCm: Number(logForm.armCm) || undefined, bodyFatPct: Number(logForm.bodyFatPct) || undefined,
    });
    setShowForm(false);
    setLogForm({ weightKg: '', waistCm: '', neckCm: '', hipCm: '', chestCm: '', armCm: '', bodyFatPct: '' });
  };

  const handleLogExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const exercise = EXERCISES.find(ex => ex.id === exForm.exerciseId);
    addExerciseLog({
      exerciseId: exForm.exerciseId, exerciseName: exercise?.name || 'Exercise',
      date: new Date().toISOString(), sets: Number(exForm.sets), reps: Number(exForm.reps), weightKg: Number(exForm.weightKg),
    });
    setShowExForm(false);
  };

  const weightData = state.bodyLogs.filter(l => l.weightKg).map(l => ({ date: formatDate(l.date, { month: 'short', day: 'numeric' }), weight: l.weightKg! }));
  const strengthData = state.exerciseLogs.slice(-20).map(l => ({ date: formatDate(l.date, { month: 'short', day: 'numeric' }), estimated1RM: Math.round(l.weightKg * (1 + l.reps / 30)) }));
  const measurementData = state.bodyLogs.map(l => ({ date: formatDate(l.date, { month: 'short', day: 'numeric' }), waist: l.waistCm, chest: l.chestCm, arm: l.armCm }));
  const volumeByDate = new Map<string, number>();
  state.exerciseLogs.forEach((l) => { const key = formatDate(l.date, { month: 'short', day: 'numeric' }); const vol = l.sets * l.reps * l.weightKg; volumeByDate.set(key, (volumeByDate.get(key) ?? 0) + vol); });
  const volumeData = [...volumeByDate.entries()].map(([date, volume]) => ({ date, volume }));

  const fields = [
    { key: 'weightKg', label: t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' }) },
    { key: 'waistCm', label: t({ en: 'Waist (cm)', fa: 'دور کمر (سانتی‌متر)' }) },
    { key: 'neckCm', label: t({ en: 'Neck (cm)', fa: 'دور گردن (سانتی‌متر)' }) },
    { key: 'hipCm', label: t({ en: 'Hip (cm)', fa: 'دور باسن (سانتی‌متر)' }) },
    { key: 'chestCm', label: t({ en: 'Chest (cm)', fa: 'دور سینه (سانتی‌متر)' }) },
    { key: 'armCm', label: t({ en: 'Arm (cm)', fa: 'دور بازو (سانتی‌متر)' }) },
    { key: 'bodyFatPct', label: t({ en: 'Body Fat %', fa: 'درصد چربی بدن' }) },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            </div>
            <h1 className="text-2xl font-black font-display">{t({ en: 'Progress', fa: 'پیشرفت' })}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-[180ms]"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
              <Plus className="w-4 h-4" /> {t({ en: 'Log Body', fa: 'ثبت بدن' })}
            </button>
            <button onClick={() => setShowExForm(!showExForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-[180ms]"
              style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border-strong)' }}>
              <Dumbbell className="w-4 h-4" /> {t({ en: 'Exercise', fa: 'تمرین' })}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleLogBody} className="card-premium p-5 space-y-4 animate-fade-in">
            <h3 className="font-bold text-sm">{t({ en: 'New Body Log', fa: 'ثبت وضعیت جدید بدن' })}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--theme-fg-subtle)' }}>{f.label}</label>
                  <input type="number" step="0.1" value={logForm[f.key as keyof typeof logForm]}
                    onChange={e => setLogForm({...logForm, [f.key]: e.target.value})}
                    className="w-full px-3 py-2 text-sm outline-none rounded-xl"
                    style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
                {t({ en: 'Save', fa: 'ذخیره' })}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg-muted)' }}>
                {t({ en: 'Cancel', fa: 'لغو' })}
              </button>
            </div>
          </form>
        )}

        {showExForm && (
          <form onSubmit={handleLogExercise} className="card-premium p-5 space-y-4 animate-fade-in">
            <h3 className="font-bold text-sm">{t({ en: 'Log Exercise', fa: 'ثبت تمرین' })}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: 'var(--theme-fg-subtle)' }}>{t({ en: 'Exercise', fa: 'تمرین' })}</label>
                <select value={exForm.exerciseId} onChange={e => setExForm({...exForm, exerciseId: e.target.value})}
                  className="w-full px-3 py-2 text-sm outline-none rounded-xl"
                  style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }}>
                  {EXERCISES.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
              </div>
              {[
                { key: 'sets', label: t({ en: 'Sets', fa: 'ست‌ها' }) },
                { key: 'reps', label: t({ en: 'Reps', fa: 'تکرارها' }) },
                { key: 'weightKg', label: t({ en: 'Weight', fa: 'وزن' }) },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--theme-fg-subtle)' }}>{f.label}</label>
                  <input type="number" value={exForm[f.key as keyof typeof exForm]}
                    onChange={e => setExForm({...exForm, [f.key]: e.target.value})}
                    className="w-full px-3 py-2 text-sm outline-none rounded-xl"
                    style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
                {t({ en: 'Save', fa: 'ذخیره' })}
              </button>
              <button type="button" onClick={() => setShowExForm(false)} className="px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg-muted)' }}>
                {t({ en: 'Cancel', fa: 'لغو' })}
              </button>
            </div>
          </form>
        )}

        <ProgressCharts
          weightData={weightData as { date: string; weight: number }[]}
          strengthData={strengthData}
          measurementData={measurementData}
          volumeData={volumeData}
        />

        <div className="card-premium overflow-hidden p-0">
          <div className="p-5 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <h3 className="font-bold font-display">{t({ en: 'Body Log History', fa: 'تاریخچه سوابق بدن' })}</h3>
          </div>
          {state.bodyLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--theme-fg-faint)' }} />
              <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
                {t({ en: 'No body logs yet.', fa: 'هنوز سابقه بدنی ثبت نشده است.' })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                    {[
                      t({ en: 'Date', fa: 'تاریخ' }), t({ en: 'Weight', fa: 'وزن' }),
                      t({ en: 'Waist', fa: 'کمر' }), t({ en: 'Fat', fa: 'چربی' }),
                      t({ en: 'Chest', fa: 'سینه' }), t({ en: 'Arm', fa: 'بازو' }),
                    ].map(h => (
                      <th key={h} className="text-left p-3 font-medium text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.bodyLogs.slice().reverse().map(log => (
                    <tr key={log.id} className="border-b last:border-0" style={{ borderColor: 'var(--theme-border)' }}>
                      <td className="p-3">{formatDate(log.date)}</td>
                      <td className="p-3">{log.weightKg ? `${formatNumber(log.weightKg)} kg` : '—'}</td>
                      <td className="p-3">{log.waistCm ? `${formatNumber(log.waistCm)} cm` : '—'}</td>
                      <td className="p-3">{log.bodyFatPct ? `${formatNumber(log.bodyFatPct)}%` : '—'}</td>
                      <td className="p-3">{log.chestCm ? `${formatNumber(log.chestCm)} cm` : '—'}</td>
                      <td className="p-3">{log.armCm ? `${formatNumber(log.armCm)} cm` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Chat ───
export function DashboardChat() {
  const { t } = useI18n();
  const { formatTime } = useLocaleFormat();
  const [state, setState] = useState(getState());
  const { subscriptionTier } = useEntitlements();
  const isCoachChat = subscriptionTier === 'VIP' || subscriptionTier === 'ELITE';
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [showNew, setShowNew] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMsg) return;
    addTicket(newTicketSubject, newTicketMsg);
    setNewTicketSubject(''); setNewTicketMsg(''); setShowNew(false);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply || !selectedTicket) return;
    addMessageToTicket(selectedTicket, reply);
    setReply('');
    setTimeout(() => {
      addMessageToTicket(selectedTicket,
        isCoachChat
          ? t({ en: "I'll review this shortly! 💪", fa: "به زودی بررسی می‌کنم! 💪" })
          : t({ en: 'Support will review within 24-48h.', fa: 'پشتیبانی ظرف ۲۴-۴۸ ساعت بررسی می‌کند.' }),
        isCoachChat ? 'coach' : 'support');
    }, 1500);
  };

  const ticket = state.tickets.find(t => t.id === selectedTicket);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
              <MessageSquare className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            </div>
            <h1 className="text-2xl font-black font-display">
              {isCoachChat ? t({ en: 'Coach Chat', fa: 'چت با مربی' }) : t({ en: 'Support', fa: 'پشتیبانی' })}
            </h1>
          </div>
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-[180ms]"
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
            <Plus className="w-4 h-4" /> {t({ en: 'New', fa: 'جدید' })}
          </button>
        </div>

        {showNew && (
          <form onSubmit={handleCreateTicket} className="card-premium p-5 space-y-3 animate-fade-in">
            <input value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)}
              placeholder={t({ en: 'Subject', fa: 'موضوع' })}
              className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
              style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }} />
            <textarea value={newTicketMsg} onChange={e => setNewTicketMsg(e.target.value)} rows={3}
              placeholder={t({ en: 'Your message...', fa: 'پیام شما...' })}
              className="w-full px-3 py-2.5 text-sm outline-none rounded-xl resize-none"
              style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }} />
            <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
              {t({ en: 'Send', fa: 'ارسال' })}
            </button>
          </form>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            {state.tickets.length === 0 ? (
              <div className="card-premium p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--theme-fg-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
                  {t({ en: 'No conversations yet', fa: 'هنوز هیچ گفتگویی وجود ندارد' })}
                </p>
              </div>
            ) : (
              state.tickets.map(tData => (
                <button key={tData.id} onClick={() => setSelectedTicket(tData.id)}
                  className="w-full text-left p-4 rounded-2xl border transition-all duration-[180ms]"
                  style={{
                    backgroundColor: selectedTicket === tData.id ? 'var(--theme-elevated)' : 'var(--theme-surface)',
                    borderColor: selectedTicket === tData.id ? 'var(--theme-border-accent)' : 'var(--theme-border)',
                  }}>
                  <div className="font-bold text-sm">{tData.subject}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>
                    {tData.messages.length} msgs · {tData.status}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {ticket ? (
              <div className="card-premium overflow-hidden p-0 flex flex-col max-h-[550px]">
                <div className="p-4 border-b shrink-0 font-bold" style={{ borderColor: 'var(--theme-border)' }}>
                  {ticket.subject}
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {ticket.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === state.currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.senderId === state.currentUser?.id ? '' : ''
                      }`}
                        style={{
                          backgroundColor: msg.senderId === state.currentUser?.id ? 'var(--theme-primary)' : 'var(--theme-elevated)',
                          color: msg.senderId === state.currentUser?.id ? 'var(--theme-primary-fg)' : 'var(--theme-fg-muted)',
                        }}>
                        <div className="text-xs opacity-75 mb-1">{msg.senderName}</div>
                        <p>{msg.content}</p>
                        <div className="text-[10px] opacity-50 mt-1">{formatTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="p-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--theme-border)' }}>
                  <input value={reply} onChange={e => setReply(e.target.value)}
                    placeholder={t({ en: 'Type a message...', fa: 'پیامی تایپ کنید...' })}
                    className="flex-1 px-3 py-2 text-sm outline-none rounded-xl"
                    style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }} />
                  <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold shrink-0"
                    style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
                    {t({ en: 'Send', fa: 'ارسال' })}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card-premium p-12 text-center h-[500px] flex flex-col justify-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--theme-fg-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>
                  {t({ en: 'Select a conversation', fa: 'یک گفتگو را انتخاب کنید' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Billing ───
export function DashboardBilling() {
  const { t } = useI18n();
  const { formatToman } = useLocaleFormat();
  const { subscriptionTier, refresh } = useEntitlements();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const currentPlan = PLANS.find(p => p.tier === subscriptionTier);
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  useEffect(() => { fetchPaymentsEnabled().then(setPaymentsEnabled); }, []);
  useEffect(() => {
    if (checkoutSuccess) {
      void refresh();
      const next = new URLSearchParams(searchParams); next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
  }, [checkoutSuccess, refresh, searchParams, setSearchParams]);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
            <CreditCard className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <h1 className="text-2xl font-black font-display">{t({ en: 'Billing', fa: 'صورتحساب' })}</h1>
        </div>

        {checkoutSuccess && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', color: 'var(--theme-success)', border: '1px solid color-mix(in srgb, var(--theme-success) 25%, transparent)' }}>
            {t({ en: 'Payment received! Plan updating...', fa: 'پرداخت دریافت شد! طرح در حال به‌روزرسانی...' })}
          </div>
        )}

        {paymentsEnabled === false && <PaymentsNotice />}

        <div className="card-premium p-6">
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'Current Plan', fa: 'طرح فعلی' })}</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-black font-display">{currentPlan?.name || 'Free'}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>
                {currentPlan && currentPlan.priceMonthly > 0
                  ? `${formatToman(currentPlan.priceMonthly)}/${t({ en: 'month', fa: 'ماه' })}`
                  : t({ en: 'Free plan', fa: 'طرح رایگان' })}
              </div>
            </div>
            <Link to="/pricing" className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
              {subscriptionTier === 'FREE' ? t({ en: 'Upgrade', fa: 'ارتقا' }) : t({ en: 'Change', fa: 'تغییر' })}
            </Link>
          </div>
        </div>

        {currentPlan && currentPlan.priceMonthly > 0 && (
          <div className="card-premium p-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: 'Plan Features', fa: 'ویژگی‌های طرح' })}</h3>
            <ul className="space-y-2">
              {currentPlan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-fg-muted)' }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span>{t({ en: f, fa: f })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
