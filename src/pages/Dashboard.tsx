import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, User, Target, BarChart3, MessageSquare, CreditCard,
  Flame, TrendingUp, Dumbbell, Plus, Calendar, Save, Crown
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

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(getState());
  const location = useLocation();
  const { t } = useI18n();
  const { subscriptionTier } = useEntitlements();
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  // Auth redirect is handled by <ProtectedRoute> in App.tsx
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
        <div className="w-full md:w-56 shrink-0">
          <div className="card-iranian p-4 md:sticky md:top-24">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-[12px] bg-brand text-brand-fg flex items-center justify-center font-semibold">
                {state.currentUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-sm">{state.currentUser.name}</div>
                <div className="text-xs text-brand">{subscriptionTier}</div>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${
                    location.pathname === tab.path
                      ? 'bg-brand-muted text-brand'
                      : 'text-fg-subtle hover:text-fg hover:bg-elevated'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </PageContainer>
  );
}

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
        <div>
          <h1 className="text-2xl font-black mb-1">{t({ en: `Welcome back, ${state.currentUser?.name}!`, fa: `خوش‌آمدید, ${state.currentUser?.name}!` })}</h1>
          <p className="text-fg-subtle">{t({ en: "Here's your fitness overview.", fa: 'در اینجا نمای کلی تناسب اندام شما را مشاهده می‌کنید.' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-iranian p-5">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-brand" />
              <span className="text-sm text-fg-subtle">{t({ en: 'Streak', fa: 'روزهای متوالی' })}</span>
            </div>
            <div className="text-3xl font-black">{formatNumber(streak)}</div>
            <div className="text-xs text-fg-faint">{t({ en: 'days', fa: 'روز' })}</div>
          </div>
          <div className="card-iranian p-5">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-accent" />
              <span className="text-sm text-fg-subtle">{t({ en: 'Workouts', fa: 'تمرین‌ها' })}</span>
            </div>
            <div className="text-3xl font-black">{totalWorkouts}</div>
            <div className="text-xs text-fg-faint">{t({ en: 'logged', fa: 'ثبت‌شده' })}</div>
          </div>
          <div className="card-iranian p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm text-fg-subtle">{t({ en: 'Body Logs', fa: 'سوابق بدن' })}</span>
            </div>
            <div className="text-3xl font-black">{totalLogs}</div>
            <div className="text-xs text-fg-faint">{t({ en: 'entries', fa: 'مورد' })}</div>
          </div>
          <div className="card-iranian p-5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-brand" />
              <span className="text-sm text-fg-subtle">{t({ en: 'Plan', fa: 'طرح' })}</span>
            </div>
            <div className="text-2xl font-black">{subscriptionTier}</div>
            <Link to="/pricing" className="text-xs text-brand hover:text-brand">{t({ en: 'Upgrade', fa: 'ارتقا' })}</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/dashboard/progress" className="card-iranian p-5 hover:border-border-strong transition-[border-color] duration-[180ms]">
            <BarChart3 className="w-6 h-6 text-brand mb-2" />
            <h3 className="font-bold text-sm mb-1">{t({ en: 'Log Progress', fa: 'ثبت پیشرفت' })}</h3>
            <p className="text-xs text-fg-subtle">{t({ en: 'Track your body measurements and weight', fa: 'اندازه‌های بدن و وزن خود را پیگیری کنید' })}</p>
          </Link>
          <Link to="/programs" className="card-iranian p-5 hover:border-border-strong transition-[border-color] duration-[180ms]">
            <Target className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-bold text-sm mb-1">{t({ en: 'Browse Programs', fa: 'مرور برنامه‌ها' })}</h3>
            <p className="text-xs text-fg-subtle">{t({ en: 'Find your next training program', fa: 'برنامه تمرینی بعدی خود را پیدا کنید' })}</p>
          </Link>
          <Link to="/calculators" className="card-iranian p-5 hover:border-border-strong transition-[border-color] duration-[180ms]">
            <TrendingUp className="w-6 h-6 text-success mb-2" />
            <h3 className="font-bold text-sm mb-1">{t({ en: 'Calculators', fa: 'ماشین‌حساب‌ها' })}</h3>
            <p className="text-xs text-fg-subtle">{t({ en: 'Check your BMI, TDEE, macros, and more', fa: 'BMI، TDEE، درشت‌مغذی‌ها و موارد دیگر خود را بررسی کنید' })}</p>
          </Link>
        </div>

        {/* Recent Activity */}
        {state.exerciseLogs.length > 0 && (
          <div className="card-iranian p-5">
            <h3 className="font-bold mb-4">{t({ en: 'Recent Exercise Logs', fa: 'سوابق جدید تمرین' })}</h3>
            <div className="space-y-2">
              {state.exerciseLogs.slice(-5).reverse().map(log => (
                <div key={log.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0 flex-row-reverse rtl:flex-row">
                  <div>
                    <span className="font-medium">{log.exerciseName}</span>
                    <span className="text-fg-subtle ml-2 rtl:ml-0 rtl:mr-2">{log.sets}×{log.reps} @ {log.weightKg}kg</span>
                  </div>
                  <span className="text-xs text-fg-faint">{formatDate(log.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export function DashboardProfile() {
  const { t } = useI18n();
  const { calendar, setCalendar } = useLocaleFormat();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  const user = state.currentUser;
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || 'male',
    heightCm: user?.heightCm?.toString() || '',
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
      name: form.name,
      age: Number(form.age) || undefined,
      gender: form.gender,
      heightCm: Number(form.heightCm) || undefined,
      weightKg: Number(form.weightKg) || undefined,
      goal: form.goal as Goal,
      activityLevel: form.activityLevel as ActivityLevel,
      injuries: form.injuries,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black mb-6">{t({ en: 'Profile Settings', fa: 'تنظیمات نمایه' })}</h1>
        <form onSubmit={handleSave} className="card-iranian p-6 space-y-5 max-w-2xl">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Full Name', fa: 'نام کامل' })}</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Gender', fa: 'جنسیت' })}</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none">
                <option value="male">{t({ en: 'Male', fa: 'مرد' })}</option>
                <option value="female">{t({ en: 'Female', fa: 'زن' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Age', fa: 'سن' })}</label>
              <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Height (cm)', fa: 'قد (سانتی‌متر)' })}</label>
              <input type="number" value={form.heightCm} onChange={e => setForm({...form, heightCm: e.target.value})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })}</label>
              <input type="number" value={form.weightKg} onChange={e => setForm({...form, weightKg: e.target.value})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Goal', fa: 'هدف' })}</label>
              <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value as Goal})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none">
                <option value="MUSCLE_GAIN">{t({ en: 'Muscle Gain', fa: 'عضله‌سازی' })}</option>
                <option value="FAT_LOSS">{t({ en: 'Fat Loss', fa: 'چربی‌سوزی' })}</option>
                <option value="GENERAL_FITNESS">{t({ en: 'General Fitness', fa: 'تناسب اندام عمومی' })}</option>
                <option value="STRENGTH">{t({ en: 'Strength', fa: 'افزایش قدرت' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Activity Level', fa: 'سطح فعالیت' })}</label>
              <select value={form.activityLevel} onChange={e => setForm({...form, activityLevel: e.target.value as ActivityLevel})} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none">
                <option value="SEDENTARY">{t({ en: 'Sedentary', fa: 'بی‌تحرک' })}</option>
                <option value="LIGHT">{t({ en: 'Light (1-3 days/week)', fa: 'سبک (۱-۳ روز/هفته)' })}</option>
                <option value="MODERATE">{t({ en: 'Moderate (3-5 days/week)', fa: 'متوسط (۳-۵ روز/هفته)' })}</option>
                <option value="ACTIVE">{t({ en: 'Active (6-7 days/week)', fa: 'فعال (۶-۷ روز/هفته)' })}</option>
                <option value="VERY_ACTIVE">{t({ en: 'Very Active', fa: 'بسیار فعال' })}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">{t({ en: 'Injuries / Notes', fa: 'آسیب‌دیدگی‌ها / یادداشت‌ها' })}</label>
            <textarea value={form.injuries} onChange={e => setForm({...form, injuries: e.target.value})} rows={3} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none resize-none" placeholder={t({ en: 'Any injuries or conditions to note...', fa: 'هرگونه آسیب‌دیدگی یا شرایط پزشکی...' })} />
          </div>
          <div className="border-t border-border pt-5">
            <label className="block text-sm font-medium text-fg-muted mb-2">{t({ en: 'Calendar', fa: 'تقویم' })}</label>
            <p className="text-xs text-fg-subtle mb-3">
              {t({
                en: 'Persian (Jalali) is the default for Farsi. Switch to Gregorian if you prefer.',
                fa: 'تقویم شمسی پیش‌فرض برای فارسی است. در صورت تمایل می‌توانید میلادی را انتخاب کنید.',
              })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCalendar('jalali')}
                className={`px-4 py-2 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${
                  calendar === 'jalali' ? 'bg-brand text-brand-fg' : 'bg-elevated text-fg-muted hover:bg-elevated-hover'
                }`}
              >
                {t({ en: 'Jalali (Shamsi)', fa: 'شمسی' })}
              </button>
              <button
                type="button"
                onClick={() => setCalendar('gregorian')}
                className={`px-4 py-2 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${
                  calendar === 'gregorian' ? 'bg-brand text-brand-fg' : 'bg-elevated text-fg-muted hover:bg-elevated-hover'
                }`}
              >
                {t({ en: 'Gregorian', fa: 'میلادی' })}
              </button>
            </div>
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand text-brand-fg font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms] disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? t({ en: 'Saving...', fa: 'در حال ذخیره...' }) : saved ? t({ en: 'Saved!', fa: 'ذخیره شد!' }) : t({ en: 'Save Profile', fa: 'ذخیره نمایه' })}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export function DashboardPrograms() {
  const { t } = useI18n();
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black mb-6">{t({ en: 'My Programs', fa: 'برنامه‌های من' })}</h1>
        <div className="card-iranian p-8">
          <EmptyState
            icon={Target}
            variant="firuze"
            title={t({ en: 'No active programs yet', fa: 'هنوز برنامه فعالی ندارید' })}
            description={t({ en: 'Browse our programs and start training!', fa: 'برنامه‌ها را مرور کنید و تمرین را شروع کنید!' })}
            action={{ label: t({ en: 'Browse Programs', fa: 'مرور برنامه‌ها' }), href: '/programs' }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export function DashboardProgress() {
  const { t } = useI18n();
  const { formatDate, formatNumber } = useLocaleFormat();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const [showForm, setShowForm] = useState(false);
  const [logForm, setLogForm] = useState({
    weightKg: '', waistCm: '', neckCm: '', hipCm: '', chestCm: '', armCm: '', bodyFatPct: '',
  });

  const [showExForm, setShowExForm] = useState(false);
  const [exForm, setExForm] = useState({ exerciseId: EXERCISES[0]?.id || '', sets: '3', reps: '10', weightKg: '60' });

  const handleLogBody = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyLog({
      date: new Date().toISOString(),
      weightKg: Number(logForm.weightKg) || undefined,
      waistCm: Number(logForm.waistCm) || undefined,
      neckCm: Number(logForm.neckCm) || undefined,
      hipCm: Number(logForm.hipCm) || undefined,
      chestCm: Number(logForm.chestCm) || undefined,
      armCm: Number(logForm.armCm) || undefined,
      bodyFatPct: Number(logForm.bodyFatPct) || undefined,
    });
    setShowForm(false);
    setLogForm({ weightKg: '', waistCm: '', neckCm: '', hipCm: '', chestCm: '', armCm: '', bodyFatPct: '' });
  };

  const handleLogExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const exercise = EXERCISES.find(ex => ex.id === exForm.exerciseId);
    addExerciseLog({
      exerciseId: exForm.exerciseId,
      exerciseName: exercise?.name || 'Exercise',
      date: new Date().toISOString(),
      sets: Number(exForm.sets),
      reps: Number(exForm.reps),
      weightKg: Number(exForm.weightKg),
    });
    setShowExForm(false);
  };

  const weightData = state.bodyLogs
    .filter(l => l.weightKg)
    .map(l => ({ date: formatDate(l.date, { month: 'short', day: 'numeric' }), weight: l.weightKg! }));

  const strengthData = state.exerciseLogs
    .slice(-20)
    .map(l => ({
      date: formatDate(l.date, { month: 'short', day: 'numeric' }),
      estimated1RM: Math.round(l.weightKg * (1 + l.reps / 30)),
    }));

  const measurementData = state.bodyLogs.map(l => ({
    date: formatDate(l.date, { month: 'short', day: 'numeric' }),
    waist: l.waistCm,
    chest: l.chestCm,
    arm: l.armCm,
  }));

  const volumeByDate = new Map<string, number>();
  state.exerciseLogs.forEach((l) => {
    const key = formatDate(l.date, { month: 'short', day: 'numeric' });
    const vol = l.sets * l.reps * l.weightKg;
    volumeByDate.set(key, (volumeByDate.get(key) ?? 0) + vol);
  });
  const volumeData = [...volumeByDate.entries()].map(([date, volume]) => ({ date, volume }));

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black">{t({ en: 'Progress Tracking', fa: 'پیگیری پیشرفت' })}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">
              <Plus className="w-4 h-4" /> {t({ en: 'Log Body', fa: 'ثبت وضعیت بدن' })}
            </button>
            <button onClick={() => setShowExForm(!showExForm)} className="flex items-center gap-2 px-4 py-2 bg-elevated text-fg font-semibold text-sm rounded-[12px] hover:bg-elevated-hover border border-border transition-[color,background-color] duration-[180ms]">
              <Dumbbell className="w-4 h-4" /> {t({ en: 'Log Exercise', fa: 'ثبت تمرین' })}
            </button>
          </div>
        </div>

        {/* Body Log Form */}
        {showForm && (
          <form onSubmit={handleLogBody} className="card-iranian p-5 space-y-4 animate-fade-in">
            <h3 className="font-bold">{t({ en: 'New Body Log', fa: 'ثبت وضعیت جدید بدن' })} — {formatDate(new Date())}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'weightKg', label: t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' }) },
                { key: 'waistCm', label: t({ en: 'Waist (cm)', fa: 'دور کمر (سانتی‌متر)' }) },
                { key: 'neckCm', label: t({ en: 'Neck (cm)', fa: 'دور گردن (سانتی‌متر)' }) },
                { key: 'hipCm', label: t({ en: 'Hip (cm)', fa: 'دور باسن (سانتی‌متر)' }) },
                { key: 'chestCm', label: t({ en: 'Chest (cm)', fa: 'دور سینه (سانتی‌متر)' }) },
                { key: 'armCm', label: t({ en: 'Arm (cm)', fa: 'دور بازو (سانتی‌متر)' }) },
                { key: 'bodyFatPct', label: t({ en: 'Body Fat %', fa: 'درصد چربی بدن' }) },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-fg-subtle mb-1">{f.label}</label>
                  <input type="number" step="0.1" value={logForm[f.key as keyof typeof logForm]} onChange={e => setLogForm({...logForm, [f.key]: e.target.value})} className="w-full px-3 py-2 bg-elevated border border-border rounded-[12px] text-fg text-sm focus:border-brand outline-none" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">{t({ en: 'Save Log', fa: 'ذخیره گزارش' })}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-elevated text-fg text-sm rounded-[12px] hover:bg-elevated-hover border border-border transition-[color,background-color] duration-[180ms]">{t({ en: 'Cancel', fa: 'لغو' })}</button>
            </div>
          </form>
        )}

        {/* Exercise Log Form */}
        {showExForm && (
          <form onSubmit={handleLogExercise} className="card-iranian p-5 space-y-4 animate-fade-in">
            <h3 className="font-bold">{t({ en: 'Log Exercise', fa: 'ثبت تمرین' })}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-fg-subtle mb-1">{t({ en: 'Exercise', fa: 'تمرین' })}</label>
                <select value={exForm.exerciseId} onChange={e => setExForm({...exForm, exerciseId: e.target.value})} className="w-full px-3 py-2 bg-elevated border border-border rounded-[12px] text-fg text-sm focus:border-brand outline-none">
                  {EXERCISES.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-fg-subtle mb-1">{t({ en: 'Sets', fa: 'ست‌ها' })}</label>
                <input type="number" value={exForm.sets} onChange={e => setExForm({...exForm, sets: e.target.value})} className="w-full px-3 py-2 bg-elevated border border-border rounded-[12px] text-fg text-sm focus:border-brand outline-none" />
              </div>
              <div>
                <label className="block text-xs text-fg-subtle mb-1">{t({ en: 'Reps', fa: 'تکرارها' })}</label>
                <input type="number" value={exForm.reps} onChange={e => setExForm({...exForm, reps: e.target.value})} className="w-full px-3 py-2 bg-elevated border border-border rounded-[12px] text-fg text-sm focus:border-brand outline-none" />
              </div>
              <div>
                <label className="block text-xs text-fg-subtle mb-1">{t({ en: 'Weight (kg)', fa: 'وزن (کیلوگرم)' })}</label>
                <input type="number" value={exForm.weightKg} onChange={e => setExForm({...exForm, weightKg: e.target.value})} className="w-full px-3 py-2 bg-elevated border border-border rounded-[12px] text-fg text-sm focus:border-brand outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">{t({ en: 'Save Exercise', fa: 'ذخیره تمرین' })}</button>
              <button type="button" onClick={() => setShowExForm(false)} className="px-4 py-2 bg-elevated text-fg text-sm rounded-[12px] hover:bg-elevated-hover border border-border transition-[color,background-color] duration-[180ms]">{t({ en: 'Cancel', fa: 'لغو' })}</button>
            </div>
          </form>
        )}

        <ProgressCharts
          weightData={weightData as { date: string; weight: number }[]}
          strengthData={strengthData}
          measurementData={measurementData}
          volumeData={volumeData}
        />

        {/* Body Logs Table */}
        <div className="card-iranian overflow-hidden p-0">
          <div className="p-5 border-b border-border">
            <h3 className="font-bold">{t({ en: 'Body Log History', fa: 'تاریخچه سوابق بدن' })}</h3>
          </div>
          {state.bodyLogs.length === 0 ? (
            <div className="p-8 text-center text-fg-subtle">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-fg-faint" />
              <p className="text-sm">{t({ en: 'No body logs yet. Start tracking your progress!', fa: 'هنوز سابقه بدنی ثبت نشده است. پیگیری پیشرفت خود را شروع کنید!' })}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left rtl:text-right p-3 font-medium text-fg-subtle">{t({ en: 'Date', fa: 'تاریخ' })}</th>
                    <th className="p-3 text-center font-medium text-fg-subtle">{t({ en: 'Weight', fa: 'وزن' })}</th>
                    <th className="p-3 text-center font-medium text-fg-subtle">{t({ en: 'Waist', fa: 'کمر' })}</th>
                    <th className="p-3 text-center font-medium text-fg-subtle">{t({ en: 'Body Fat', fa: 'چربی بدن' })}</th>
                    <th className="p-3 text-center font-medium text-fg-subtle">{t({ en: 'Chest', fa: 'سینه' })}</th>
                    <th className="p-3 text-center font-medium text-fg-subtle">{t({ en: 'Arm', fa: 'بازو' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.bodyLogs.slice().reverse().map(log => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="p-3">{formatDate(log.date)}</td>
                      <td className="p-3 text-center">{log.weightKg ? `${formatNumber(log.weightKg)} kg` : '—'}</td>
                      <td className="p-3 text-center">{log.waistCm ? `${formatNumber(log.waistCm)} cm` : '—'}</td>
                      <td className="p-3 text-center">{log.bodyFatPct ? `${formatNumber(log.bodyFatPct)}%` : '—'}</td>
                      <td className="p-3 text-center">{log.chestCm ? `${formatNumber(log.chestCm)} cm` : '—'}</td>
                      <td className="p-3 text-center">{log.armCm ? `${formatNumber(log.armCm)} cm` : '—'}</td>
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
    setNewTicketSubject('');
    setNewTicketMsg('');
    setShowNew(false);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply || !selectedTicket) return;
    addMessageToTicket(selectedTicket, reply);
    setReply('');
    setTimeout(() => {
      const replyTextEn = isCoachChat 
        ? "Thank you for your message! I'll review this and get back to you shortly. Keep up the great work with your training! 💪"
        : "Thank you for reaching out to EsiFit Support. A representative will review your ticket within 24-48 hours.";
      const replyTextFa = isCoachChat
        ? "از پیام شما متشکرم! این را بررسی خواهم کرد و به زودی به شما پاسخ خواهم داد. به کار عالی خود در تمرین ادامه دهید! 💪"
        : "از تماس شما با پشتیبانی اسی‌فیت متشکریم. یک نماینده ظرف ۲۴ تا ۴۸ ساعت تیکت شما را بررسی خواهد کرد.";
        
      addMessageToTicket(selectedTicket, t({ en: replyTextEn, fa: replyTextFa }), isCoachChat ? 'coach' : 'support');
    }, 1500);
  };

  const ticket = state.tickets.find(t => t.id === selectedTicket);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black">
            {isCoachChat ? t({ en: 'Coach Chat', fa: 'چت با مربی' }) : t({ en: 'Support Tickets', fa: 'تیکت‌های پشتیبانی' })}
          </h1>
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">
            <Plus className="w-4 h-4" /> {isCoachChat ? t({ en: 'New Message', fa: 'پیام جدید' }) : t({ en: 'New Ticket', fa: 'تیکت جدید' })}
          </button>
        </div>

        {showNew && (
          <form onSubmit={handleCreateTicket} className="card-iranian p-5 space-y-3 animate-fade-in">
            <input value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} placeholder={t({ en: 'Subject', fa: 'موضوع' })} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none" />
            <textarea value={newTicketMsg} onChange={e => setNewTicketMsg(e.target.value)} rows={3} placeholder={t({ en: 'Your message...', fa: 'پیام شما...' })} className="w-full px-3 py-2.5 bg-elevated border border-border rounded-[12px] text-fg focus:border-brand outline-none resize-none" />
            <button type="submit" className="px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]">{t({ en: 'Send', fa: 'ارسال' })}</button>
          </form>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {/* Ticket List */}
          <div className="space-y-2">
            {state.tickets.length === 0 ? (
              <div className="card-iranian p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-fg-faint" />
                <p className="text-sm text-fg-subtle">{t({ en: 'No conversations yet', fa: 'هنوز هیچ گفتگویی وجود ندارد' })}</p>
              </div>
            ) : (
              state.tickets.map(tData => (
                <button
                  key={tData.id}
                  onClick={() => setSelectedTicket(tData.id)}
                  className={`w-full text-left rtl:text-right p-4 rounded-[20px] border transition-[color,background-color,border-color] duration-[180ms] ${
                    selectedTicket === tData.id ? 'bg-elevated border-brand/30' : 'bg-surface border-border hover:border-border-strong'
                  }`}
                >
                  <div className="font-bold text-sm">{tData.subject}</div>
                  <div className="text-xs text-fg-subtle mt-1">{tData.messages.length} {t({ en: 'messages', fa: 'پیام' })} · {tData.status === 'open' ? t({ en: 'Open', fa: 'باز' }) : tData.status === 'closed' ? t({ en: 'Closed', fa: 'بسته' }) : tData.status}</div>
                </button>
              ))
            )}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2">
            {ticket ? (
              <div className="card-iranian overflow-hidden p-0 flex flex-col max-h-[500px]">
                <div className="p-4 border-b border-border shrink-0">
                  <h3 className="font-bold">{ticket.subject}</h3>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {ticket.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === state.currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-[12px] px-4 py-2.5 ${
                        msg.senderId === state.currentUser?.id
                          ? 'bg-brand text-brand-fg rtl:text-right'
                          : 'bg-elevated text-fg-muted rtl:text-right'
                      }`}>
                        <div className="text-xs opacity-75 mb-1">{msg.senderId === state.currentUser?.id ? t({ en: 'You', fa: 'شما' }) : msg.senderName}</div>
                        <p className="text-sm">{msg.content}</p>
                        <div className="text-[10px] opacity-50 mt-1">{formatTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="p-4 border-t border-border flex gap-2 shrink-0">
                  <input value={reply} onChange={e => setReply(e.target.value)} placeholder={t({ en: 'Type a message...', fa: 'پیامی تایپ کنید...' })} className="flex-1 px-3 py-2 bg-elevated border border-border rounded-[12px] text-fg text-sm focus:border-brand outline-none" />
                  <button type="submit" className="px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms] shrink-0">{t({ en: 'Send', fa: 'ارسال' })}</button>
                </form>
              </div>
            ) : (
              <div className="card-iranian p-12 text-center h-[500px] flex flex-col justify-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-fg-faint" />
                <p className="text-fg-subtle text-sm">{t({ en: 'Select a conversation or start a new one', fa: 'یک گفتگو را انتخاب کنید یا یکی جدید شروع کنید' })}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function DashboardBilling() {
  const { t } = useI18n();
  const { formatToman } = useLocaleFormat();
  const { subscriptionTier, refresh } = useEntitlements();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);
  const currentPlan = PLANS.find(p => p.tier === subscriptionTier);
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  useEffect(() => {
    fetchPaymentsEnabled().then(setPaymentsEnabled);
  }, []);

  useEffect(() => {
    if (checkoutSuccess) {
      void refresh();
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
  }, [checkoutSuccess, refresh, searchParams, setSearchParams]);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-black">{t({ en: 'Billing & Subscription', fa: 'صورتحساب و اشتراک' })}</h1>

        {checkoutSuccess && (
          <div className="rounded-[12px] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {t({ en: 'Payment received! Your plan will update shortly once confirmed.', fa: 'پرداخت دریافت شد! طرح شما پس از تأیید به‌روزرسانی می‌شود.' })}
          </div>
        )}

        {paymentsEnabled === false && <PaymentsNotice />}

        <div className="card-iranian p-6">
          <h3 className="text-sm font-medium text-fg-subtle mb-4">{t({ en: 'Current Plan', fa: 'طرح فعلی' })}</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-black">{currentPlan?.name || t({ en: 'Free', fa: 'رایگان' })}</div>
              <div className="text-fg-subtle text-sm mt-1">
                {currentPlan && currentPlan.priceMonthly > 0
                  ? `${formatToman(currentPlan.priceMonthly)}/${t({ en: 'month', fa: 'ماه' })}`
                  : t({ en: 'No active subscription', fa: 'بدون اشتراک فعال' })
                }
              </div>
            </div>
            <Link
              to="/pricing"
              className="px-4 py-2 bg-brand text-brand-fg font-semibold text-sm rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]"
            >
              {subscriptionTier === 'FREE' ? t({ en: 'Upgrade', fa: 'ارتقا' }) : t({ en: 'Change Plan', fa: 'تغییر طرح' })}
            </Link>
          </div>
        </div>

        {currentPlan && currentPlan.priceMonthly > 0 && (
          <div className="card-iranian p-6">
            <h3 className="text-sm font-medium text-fg-subtle mb-4">{t({ en: 'Plan Features', fa: 'ویژگی‌های طرح' })}</h3>
            <ul className="space-y-2">
              {currentPlan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-fg-muted">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  <span>
                    {t({
                      en: f,
                      fa: faDict[f] || f
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-iranian p-6">
          <h3 className="text-sm font-medium text-fg-subtle mb-4">{t({ en: 'Manage Subscription', fa: 'مدیریت اشتراک' })}</h3>
          <div className="space-y-3">
            <button
              disabled={paymentsEnabled !== true}
              title={paymentsEnabled === false ? t({ en: 'Coming soon', fa: 'به‌زودی' }) : undefined}
              className="w-full text-left rtl:text-right p-4 bg-elevated rounded-[12px] text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-border"
            >
              📧 {t({ en: 'Update payment method', fa: 'به‌روزرسانی روش پرداخت' })}
              {paymentsEnabled === false && (
                <span className="block text-xs text-fg-faint mt-1">{t({ en: 'Available when Stripe is configured', fa: 'پس از پیکربندی Stripe' })}</span>
              )}
            </button>
            <button
              disabled={paymentsEnabled !== true}
              className="w-full text-left rtl:text-right p-4 bg-elevated rounded-[12px] text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-border"
            >
              📄 {t({ en: 'View invoices', fa: 'مشاهده فاکتورها' })}
              {paymentsEnabled === false && (
                <span className="block text-xs text-fg-faint mt-1">{t({ en: 'Available when Stripe is configured', fa: 'پس از پیکربندی Stripe' })}</span>
              )}
            </button>
            {subscriptionTier !== 'FREE' && (
              <button
                disabled={paymentsEnabled !== true}
                className="w-full text-left rtl:text-right p-4 bg-danger/10 border border-danger/20 rounded-[12px] text-sm text-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ {t({ en: 'Cancel subscription', fa: 'لغو اشتراک' })}
                {paymentsEnabled === false && (
                  <span className="block text-xs text-danger/70 mt-1">{t({ en: 'Contact support to cancel until billing portal is live', fa: 'تا فعال شدن پورتال پرداخت با پشتیبانی تماس بگیرید' })}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
