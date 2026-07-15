import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Calendar, Clock, CheckCircle2, Lock } from 'lucide-react';
import { PROGRAMS, getExerciseSlugById, getState, addExerciseLog, subscribe } from '@/lib/store';
import TierGate from '@/components/TierGate';
import { hasTierAccess } from '@/lib/types';
import { useI18n, faDict } from '@/lib/i18n';
import { useEntitlements } from '@/lib/entitlements';

const goalColors: Record<string, string> = { MUSCLE_GAIN: 'bg-blue-500/20 text-blue-400', FAT_LOSS: 'bg-red-500/20 text-red-400', GENERAL_FITNESS: 'bg-green-500/20 text-green-400', STRENGTH: 'bg-purple-500/20 text-purple-400' };

export function ProgramList() {
  const { t } = useI18n();
  const { subscriptionTier } = useEntitlements();
  const userTier = subscriptionTier;

  const goalLabels: Record<string, string> = { 
    MUSCLE_GAIN: t({ en: 'Muscle Gain', fa: 'عضله‌سازی' }), 
    FAT_LOSS: t({ en: 'Fat Loss', fa: 'چربی‌سوزی' }), 
    GENERAL_FITNESS: t({ en: 'General Fitness', fa: 'تناسب اندام عمومی' }), 
    STRENGTH: t({ en: 'Strength', fa: 'افزایش قدرت' }) 
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Training Programs', fa: 'برنامه‌های تمرینی' })}</h1>
        <p className="text-gray-400 text-lg">{t({ en: 'Structured programs for every goal and experience level.', fa: 'برنامه‌های ساختاریافته برای هر هدف و سطح تجربه.' })}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROGRAMS.map(prog => {
          const locked = !hasTierAccess(userTier, prog.requiredTier);
          return (
            <Link
              key={prog.id}
              to={`/programs/${prog.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all relative"
            >
              <div className="h-48 bg-gradient-to-br from-orange-500/10 to-orange-600/5 flex items-center justify-center relative">
                <Target className="w-16 h-16 text-orange-500/30" />
                {locked && (
                  <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">{prog.requiredTier} {t({ en: 'Required', fa: 'نیاز است' })}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${goalColors[prog.goal]}`}>
                    {goalLabels[prog.goal]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                    {t({
                      en: prog.level,
                      fa: faDict[prog.level] || prog.level
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">
                  {t({
                    en: prog.title,
                    fa: faDict[prog.title] || prog.title
                  })}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {t({
                    en: prog.description,
                    fa: faDict[prog.description] || prog.description
                  })}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400 flex-row-reverse rtl:flex-row justify-end rtl:justify-start">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />{prog.daysPerWeek} {t({ en: 'days/week', fa: 'روز در هفته' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />{prog.days.length} {t({ en: 'days', fa: 'روز' })}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ProgramDetail() {
  const { t } = useI18n();
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Program not found', fa: 'برنامه یافت نشد' })}</h1>
        <button onClick={() => navigate('/programs')} className="text-orange-400">{t({ en: '← Back to programs', fa: '← بازگشت به برنامه‌ها' })}</button>
      </div>
    );
  }

  const userTier = subscriptionTier;
  const hasAccess = hasTierAccess(userTier, program.requiredTier);

  const toggleComplete = (peId: string, exerciseName: string) => {
    const next = new Set(completedExercises);
    if (next.has(peId)) {
      next.delete(peId);
    } else {
      next.add(peId);
      if (state.currentUser) {
        addExerciseLog({
          exerciseId: peId,
          exerciseName,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/programs')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 flex-row-reverse rtl:flex-row justify-end rtl:justify-start">
        <ArrowLeft className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1 rtl:!rotate-180" /> {t({ en: 'Back to Programs', fa: 'بازگشت به برنامه‌ها' })}
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${goalColors[program.goal]}`}>{goalLabels[program.goal]}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300">
            {t({
              en: program.level,
              fa: faDict[program.level] || program.level
            })}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300">{program.daysPerWeek} {t({ en: 'days/week', fa: 'روز در هفته' })}</span>
        </div>
        <h1 className="text-3xl font-black mb-4">
          {t({
            en: program.title,
            fa: faDict[program.title] || program.title
          })}
        </h1>
        <p className="text-gray-400 leading-relaxed">
          {t({
            en: program.description,
            fa: faDict[program.description] || program.description
          })}
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
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeDay === i ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {t({ en: 'Day', fa: 'روز' })} {day.dayNumber}: {t({
                  en: day.title,
                  fa: faDict[day.title] || day.title
                })}
              </button>
            ))}
          </div>

          {/* Day exercises */}
          {program.days[activeDay] && (
            <div className="space-y-3 animate-fade-in">
              {program.days[activeDay].exercises.map(pe => (
                <div
                  key={pe.id}
                  className={`flex items-center gap-4 bg-gray-900 border rounded-xl p-4 transition-all flex-row-reverse rtl:flex-row ${
                    completedExercises.has(pe.id) ? 'border-green-500/30 bg-green-500/5' : 'border-gray-800'
                  }`}
                >
                  <button onClick={() => toggleComplete(pe.id, pe.exerciseName)} className="shrink-0">
                    <CheckCircle2 className={`w-6 h-6 transition-colors ${completedExercises.has(pe.id) ? 'text-green-400' : 'text-gray-600'}`} />
                  </button>
                  <div className="flex-1 text-right rtl:text-left">
                    <Link to={`/exercises/${getExerciseSlugById(pe.exerciseId) ?? ''}`} className="font-bold hover:text-orange-400 transition-colors">
                      {pe.exerciseName}
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      {pe.sets} {t({ en: 'sets', fa: 'ست' })} × {pe.reps} {t({ en: 'reps', fa: 'تکرار' })} · {pe.restSeconds}s {t({ en: 'rest', fa: 'استراحت' })}
                    </div>
                  </div>
                  <div className="text-left rtl:text-right text-sm text-gray-500">
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
              <div key={pe.id} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 flex-row-reverse rtl:flex-row">
                <CheckCircle2 className="w-6 h-6 text-gray-600 shrink-0" />
                <div className="flex-1 text-right rtl:text-left">
                  <div className="font-bold">{pe.exerciseName}</div>
                  <div className="text-sm text-gray-400 mt-1">{pe.sets} {t({ en: 'sets', fa: 'ست' })} × {pe.reps} {t({ en: 'reps', fa: 'تکرار' })}</div>
                </div>
              </div>
            ))}
          </div>
        </TierGate>
      )}
    </div>
  );
}
