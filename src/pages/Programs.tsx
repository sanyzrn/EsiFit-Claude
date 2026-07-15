import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Target, Calendar, Clock, CheckCircle2, Lock } from 'lucide-react';
import { PROGRAMS, getExerciseSlugById, getExerciseNameById, getState, addExerciseLog, subscribe } from '@/lib/store';
import TierGate from '@/components/TierGate';
import { hasTierAccess } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { localizedProgram } from '@/lib/content-i18n';
import { useEntitlements } from '@/lib/entitlements';
import { programImage } from '@/lib/media';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

const goalColors: Record<string, string> = { MUSCLE_GAIN: 'bg-accent-muted text-accent', FAT_LOSS: 'bg-danger/15 text-danger', GENERAL_FITNESS: 'bg-success/15 text-success', STRENGTH: 'bg-terracotta/15 text-terracotta' };

export function ProgramList() {
  const { t, lang } = useI18n();
  const { subscriptionTier } = useEntitlements();
  const userTier = subscriptionTier;

  const goalLabels: Record<string, string> = { 
    MUSCLE_GAIN: t({ en: 'Muscle Gain', fa: 'عضله‌سازی' }), 
    FAT_LOSS: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }), 
    GENERAL_FITNESS: t({ en: 'General Fitness', fa: 'تناسب اندام عمومی' }), 
    STRENGTH: t({ en: 'Strength', fa: 'افزایش قدرت' }) 
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Training Programs', fa: 'برنامه‌های تمرینی' })}</h1>
        <p className="text-fg-subtle text-lg">{t({ en: 'Structured programs for every goal and experience level.', fa: 'برنامه‌های ساختاریافته برای هر هدف و سطح تجربه.' })}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROGRAMS.map(prog => {
          const locked = !hasTierAccess(userTier, prog.requiredTier);
          const copy = localizedProgram(prog, lang);
          const img = programImage(prog.slug);
          return (
            <Link
              key={prog.id}
              to={`/programs/${prog.slug}`}
              className="group card-iranian overflow-hidden hover:border-brand/40 transition-all relative p-0"
            >
              <div className="h-48 relative overflow-hidden">
                {img ? (
                  <img
                    src={img.src}
                    alt={t(img.alt)}
                    className="w-full h-full object-cover transition-[filter] duration-[200ms]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full gradient-hero flex items-center justify-center">
                    <Target className="w-16 h-16 text-brand/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                {locked && (
                  <div className="absolute inset-0 bg-surface/70 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-brand mx-auto mb-2" />
                      <span className="text-xs font-bold text-brand bg-brand-muted px-3 py-1 rounded-full">{prog.requiredTier} {t({ en: 'Required', fa: 'نیاز است' })}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${goalColors[prog.goal]}`}>
                    {goalLabels[prog.goal]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-elevated-hover text-fg-muted">
                    {copy.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-brand transition-colors font-display">
                  {copy.title}
                </h3>
                <p className="text-fg-subtle text-sm mb-4 line-clamp-2">
                  {copy.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-fg-subtle flex-row-reverse rtl:flex-row justify-end rtl:justify-start">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />{prog.daysPerWeek} {t({ en: 'days/week', fa: 'روز در هفته' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />{prog.days.length} {t({ en: 'days', fa: 'روز' })}</span>
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
    STRENGTH: t({ en: 'Strength', fa: 'افزایش قدرت' }) 
  };

  const program = PROGRAMS.find(p => p.slug === slug);
  if (!program) {
    return (
      <PageContainer className="text-center">
        <Breadcrumbs items={[
          { label: t({ en: 'Programs', fa: 'برنامه‌ها' }), href: '/programs' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Program not found', fa: 'برنامه یافت نشد' })}</h1>
        <button onClick={() => navigate('/programs')} className="text-brand">{t({ en: '← Back to programs', fa: '← بازگشت به برنامه‌ها' })}</button>
      </PageContainer>
    );
  }

  const userTier = subscriptionTier;
  const hasAccess = hasTierAccess(userTier, program.requiredTier);
  const copy = localizedProgram(program, lang);

  const toggleComplete = (peId: string, exerciseId: string) => {
    const next = new Set(completedExercises);
    if (next.has(peId)) {
      next.delete(peId);
    } else {
      next.add(peId);
      if (state.currentUser) {
        addExerciseLog({
          exerciseId: exerciseId,
          exerciseName: getExerciseNameById(exerciseId, lang),
          date: new Date().toISOString(),
          sets: 3,
          reps: 10,
          weightKg: 0,
        });
      }
    }
    setCompleted(next);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
      <Breadcrumbs items={[
        { label: t({ en: 'Programs', fa: 'برنامه‌ها' }), href: '/programs' },
        { label: copy.title },
      ]} />

      <div className="card-iranian p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${goalColors[program.goal]}`}>{goalLabels[program.goal]}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-elevated-hover text-fg-muted">
            {copy.level}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-elevated-hover text-fg-muted">{program.daysPerWeek} {t({ en: 'days/week', fa: 'روز در هفته' })}</span>
        </div>
        <h1 className="text-3xl font-black mb-4">
          {copy.title}
        </h1>
        <p className="text-fg-subtle leading-relaxed">
          {copy.description}
        </p>
      </div>

      {hasAccess ? (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {program.days.map((day, i) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(i)}
                className={`px-4 py-2 rounded-[12px] font-medium text-sm whitespace-nowrap transition-[color,background-color] duration-[180ms] ${
                  activeDay === i ? 'bg-brand text-brand-fg font-semibold' : 'bg-elevated text-fg-muted hover:bg-elevated-hover'
                }`}
              >
                {t({ en: 'Day', fa: 'روز' })} {day.dayNumber}: {copy.days[i]?.title ?? day.title}
              </button>
            ))}
          </div>

          {/* Day exercises */}
          {program.days[activeDay] && (
            <div className="space-y-3 animate-fade-in">
              {program.days[activeDay].exercises.map(pe => (
                <div
                  key={pe.id}
                  className={`flex items-center gap-4 bg-surface border rounded-[20px] p-4 transition-[border-color,background-color] duration-[180ms] flex-row-reverse rtl:flex-row ${
                    completedExercises.has(pe.id) ? 'border-success/30 bg-success/5' : 'border-border'
                  }`}
                >
                  <button onClick={() => toggleComplete(pe.id, pe.exerciseId)} className="shrink-0">
                    <CheckCircle2 className={`w-6 h-6 transition-colors ${completedExercises.has(pe.id) ? 'text-success' : 'text-fg-faint'}`} />
                  </button>
                  <div className="flex-1 text-right rtl:text-left">
                    <Link to={`/exercises/${getExerciseSlugById(pe.exerciseId) ?? ''}`} className="font-bold hover:text-brand transition-colors">
                      {getExerciseNameById(pe.exerciseId, lang)}
                    </Link>
                    <div className="text-sm text-fg-subtle mt-1">
                      {pe.sets} {t({ en: 'sets', fa: 'ست' })} × {pe.reps} {t({ en: 'reps', fa: 'تکرار' })} · {pe.restSeconds}s {t({ en: 'rest', fa: 'استراحت' })}
                    </div>
                  </div>
                  <div className="text-left rtl:text-right text-sm text-fg-faint">
                    #{pe.order}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <TierGate minTier={program.requiredTier}>
          <div className="space-y-3">
            {program.days[0]?.exercises.map(pe => (
              <div key={pe.id} className="flex items-center gap-4 bg-surface border border-border rounded-[20px] p-4 flex-row-reverse rtl:flex-row">
                <CheckCircle2 className="w-6 h-6 text-fg-faint shrink-0" />
                <div className="flex-1 text-right rtl:text-left">
                  <div className="font-bold">{getExerciseNameById(pe.exerciseId, lang)}</div>
                  <div className="text-sm text-fg-subtle mt-1">{pe.sets} {t({ en: 'sets', fa: 'ست' })} × {pe.reps} {t({ en: 'reps', fa: 'تکرار' })}</div>
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
