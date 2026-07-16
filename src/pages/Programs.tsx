import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Target, Calendar, Clock, CheckCircle2, Lock, ArrowRight, Zap, Award } from 'lucide-react';
import { PROGRAMS, getExerciseSlugById, getExerciseNameById, getState, addExerciseLog, subscribe } from '@/lib/store';
import TierGate from '@/components/TierGate';
import { hasTierAccess } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { localizedProgram } from '@/lib/content-i18n';
import { useEntitlements } from '@/lib/entitlements';
import { programImage } from '@/lib/media';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

const goalColors: Record<string, { bg: string; text: string }> = {
  MUSCLE_GAIN: { bg: 'var(--theme-accent-dim)', text: 'var(--theme-accent)' },
  FAT_LOSS: { bg: 'color-mix(in srgb, var(--theme-error) 12%, transparent)', text: 'var(--theme-error)' },
  GENERAL_FITNESS: { bg: 'var(--theme-primary-dim)', text: 'var(--theme-primary)' },
  STRENGTH: { bg: 'var(--theme-secondary-dim)', text: 'var(--theme-secondary)' },
};

export function ProgramList() {
  const { t, lang } = useI18n();
  const { subscriptionTier } = useEntitlements();
  const userTier = subscriptionTier;

  const goalLabels: Record<string, string> = {
    MUSCLE_GAIN: t({ en: 'Muscle Gain', fa: 'عضله‌سازی' }),
    FAT_LOSS: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }),
    GENERAL_FITNESS: t({ en: 'General Fitness', fa: 'تناسب اندام عمومی' }),
    STRENGTH: t({ en: 'Strength', fa: 'افزایش قدرت' }),
  };

  const levelColors: Record<string, string> = {
    beginner: 'var(--theme-primary)', intermediate: 'var(--theme-warning)', advanced: 'var(--theme-accent)',
  };

  return (
    <PageContainer>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: 'var(--theme-accent-dim)', color: 'var(--theme-accent)', border: '1px solid rgba(255,107,53,0.2)' }}>
          <Award className="w-3.5 h-3.5" />
          {t({ en: 'Expert-Crafted Programs', fa: 'برنامه‌های تخصصی' })}
        </div>
        <h1 className="text-5xl font-black mb-3 font-display">
          {t({ en: 'Training Programs', fa: 'برنامه‌های تمرینی' })}
        </h1>
        <p className="text-lg" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: 'Structured programs for every goal and experience level.', fa: 'برنامه‌های ساختاریافته برای هر هدف و سطح تجربه.' })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROGRAMS.map(prog => {
          const locked = !hasTierAccess(userTier, prog.requiredTier);
          const copy = localizedProgram(prog, lang);
          const img = programImage(prog.slug);
          const gc = goalColors[prog.goal] || { bg: 'var(--theme-elevated)', text: 'var(--theme-fg-subtle)' };
          const lc = levelColors[copy.level.toLowerCase()] || 'var(--theme-fg-subtle)';
          return (
            <Link key={prog.id} to={`/programs/${prog.slug}`}
              className="group card-premium overflow-hidden p-0 transition-all duration-[280ms] animate-slide-up-children">
              <div className="h-48 relative overflow-hidden">
                {img ? (
                  <img src={img.src} alt={t(img.alt)} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--theme-accent-dim), var(--theme-primary-dim))' }}>
                    <Target className="w-16 h-16" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--theme-surface), transparent 50%)' }} />
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-surface) 70%, transparent)' }}>
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--theme-primary)' }} />
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>
                        {prog.requiredTier}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: gc.bg, color: gc.text }}>
                    {goalLabels[prog.goal]}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `color-mix(in srgb, ${lc} 12%, transparent)`, color: lc }}>
                    {copy.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 font-display group-hover:translate-x-0.5 transition-transform">{copy.title}</h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--theme-fg-subtle)' }}>{copy.description}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{prog.daysPerWeek} {t({ en: 'days/wk', fa: 'روز/هفته' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{prog.days.length} {t({ en: 'weeks', fa: 'هفته' })}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}

export function ProgramDetail() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(getState());
  const [completedExercises, setCompleted] = useState<Set<string>>(new Set());
  const [activeDay, setActiveDay] = useState(0);
  const { subscriptionTier } = useEntitlements();
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const goalLabels: Record<string, string> = {
    MUSCLE_GAIN: t({ en: 'Muscle Gain', fa: 'عضله‌سازی' }),
    FAT_LOSS: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }),
    GENERAL_FITNESS: t({ en: 'General Fitness', fa: 'تناسب اندام عمومی' }),
    STRENGTH: t({ en: 'Strength', fa: 'افزایش قدرت' }),
  };

  const program = PROGRAMS.find(p => p.slug === slug);
  if (!program) {
    return (
      <PageContainer className="text-center py-20">
        <Breadcrumbs items={[
          { label: t({ en: 'Programs', fa: 'برنامه‌ها' }), href: '/programs' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-2">{t({ en: 'Program not found', fa: 'برنامه یافت نشد' })}</h1>
        <button onClick={() => navigate('/programs')} style={{ color: 'var(--theme-primary)' }}
          className="text-sm font-semibold">{t({ en: '← Back to programs', fa: 'بازگشت به برنامه‌ها' })}</button>
      </PageContainer>
    );
  }

  const userTier = subscriptionTier;
  const hasAccess = hasTierAccess(userTier, program.requiredTier);
  const copy = localizedProgram(program, lang);

  const toggleComplete = (peId: string, exerciseId: string) => {
    const next = new Set(completedExercises);
    if (next.has(peId)) { next.delete(peId); }
    else {
      next.add(peId);
      if (state.currentUser) {
        addExerciseLog({
          exerciseId, exerciseName: getExerciseNameById(exerciseId, lang),
          date: new Date().toISOString(), sets: 3, reps: 10, weightKg: 0,
        });
      }
    }
    setCompleted(next);
  };

  const progress = program.days[activeDay]?.exercises.length
    ? Math.round(([...completedExercises].filter(id =>
        program.days[activeDay]?.exercises.some(e => e.id === id)
      ).length / program.days[activeDay].exercises.length) * 100)
    : 0;

  return (
    <PageContainer padY="md">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[
          { label: t({ en: 'Programs', fa: 'برنامه‌ها' }), href: '/programs' },
          { label: copy.title },
        ]} />

        {/* Program header */}
        <div className="card-premium p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {['MUSCLE_GAIN', 'FAT_LOSS', 'GENERAL_FITNESS', 'STRENGTH'].map(g => {
              if (program.goal !== g) return null;
              const gc = goalColors[g] || { bg: 'var(--theme-elevated)', text: 'var(--theme-fg-subtle)' };
              return (
                <span key={g} className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: gc.bg, color: gc.text }}>{goalLabels[g]}</span>
              );
            })}
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--theme-elevated-hover)', color: 'var(--theme-fg-muted)' }}>
              {copy.level}
            </span>
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--theme-elevated-hover)', color: 'var(--theme-fg-muted)' }}>
              {program.daysPerWeek} {t({ en: 'days/wk', fa: 'روز/هفته' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 font-display">{copy.title}</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--theme-fg-subtle)' }}>{copy.description}</p>
        </div>

        {hasAccess ? (
          <>
            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {program.days.map((day, i) => (
                <button key={day.id} onClick={() => setActiveDay(i)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-[180ms] ${
                    activeDay === i ? '' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: activeDay === i ? 'var(--theme-primary)' : 'var(--theme-elevated)',
                    color: activeDay === i ? 'var(--theme-primary-fg)' : 'var(--theme-fg-muted)',
                  }}>
                  {t({ en: 'Day', fa: 'روز' })} {day.dayNumber}
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{t({ en: 'Progress', fa: 'پیشرفت' })}</span>
                <span style={{ color: 'var(--theme-primary)' }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--theme-elevated)' }}>
                <div className="h-full rounded-full transition-all duration-[280ms]"
                  style={{ width: `${progress}%`, backgroundColor: 'var(--theme-primary)' }} />
              </div>
            </div>

            {/* Exercises */}
            {program.days[activeDay] && (
              <div className="space-y-3 animate-fade-in">
                {program.days[activeDay].exercises.map((pe, i) => (
                  <div key={pe.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-[180ms] ${
                      completedExercises.has(pe.id) ? 'border-success/30' : ''
                    }`}
                    style={{
                      backgroundColor: completedExercises.has(pe.id)
                        ? 'color-mix(in srgb, var(--theme-success) 6%, transparent)'
                        : 'var(--theme-surface)',
                      border: `1px solid ${
                        completedExercises.has(pe.id)
                          ? 'color-mix(in srgb, var(--theme-success) 25%, transparent)'
                          : 'var(--theme-border)'
                      }`,
                    }}>
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--theme-fg-faint)' }}>#{i + 1}</span>
                      <button onClick={() => toggleComplete(pe.id, pe.exerciseId)} className="shrink-0">
                        <CheckCircle2 className="w-6 h-6 transition-all duration-[180ms]"
                          style={{
                            color: completedExercises.has(pe.id) ? 'var(--theme-success)' : 'var(--theme-fg-faint)',
                          }} />
                      </button>
                      <div>
                        <Link to={`/exercises/${getExerciseSlugById(pe.exerciseId) ?? ''}`}
                          className="font-bold text-sm transition-all duration-[180ms]"
                          style={{ color: completedExercises.has(pe.id) ? 'var(--theme-success)' : 'var(--theme-fg)' }}>
                          {getExerciseNameById(pe.exerciseId, lang)}
                        </Link>
                        <div className="text-xs mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>
                          {pe.sets} {t({ en: 'sets', fa: 'ست' })} × {pe.reps} {t({ en: 'reps', fa: 'تکرار' })} · {pe.restSeconds}s {t({ en: 'rest', fa: 'استراحت' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <TierGate minTier={program.requiredTier}>
            <div className="space-y-3">
              {program.days[0]?.exercises.map((pe, i) => (
                <div key={pe.id} className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--theme-fg-faint)' }}>#{i + 1}</span>
                  <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--theme-fg-faint)' }} />
                  <div>
                    <div className="font-bold text-sm">{getExerciseNameById(pe.exerciseId, lang)}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>
                      {pe.sets} {t({ en: 'sets', fa: 'ست' })} × {pe.reps} {t({ en: 'reps', fa: 'تکرار' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TierGate>
        )}
      </div>
    </PageContainer>
  );
}
