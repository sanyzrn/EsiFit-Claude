import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Bookmark, BookmarkCheck, Dumbbell, LayoutGrid, PersonStanding } from 'lucide-react';
import Model, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { EXERCISES, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT, getState, toggleSavedExercise, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localizedExercise, localizedMuscleGroup, localizedEquipment } from '@/lib/content-i18n';

const MUSCLE_MAPPING: Record<string, string> = {
  'abs': 'Core',
  'biceps': 'Biceps',
  'calves': 'Legs',
  'chest': 'Chest',
  'deltoids': 'Shoulders',
  'gluteal': 'Glutes',
  'hamstring': 'Hamstrings',
  'lower-back': 'Back',
  'neck': 'Back',
  'obliques': 'Core',
  'quadriceps': 'Quadriceps',
  'trapezius': 'Back',
  'triceps': 'Triceps',
  'upper-back': 'Back'
};

export function ExerciseList() {
  const { t, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [muscle, setMuscle] = useState(searchParams.get('muscle') || '');
  const [equip, setEquip] = useState(searchParams.get('equipment') || '');
  const [diff, setDiff] = useState(searchParams.get('difficulty') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'anatomy'>('anatomy');
  const [anatomyGender, setAnatomyGender] = useState<'male' | 'female'>('male');
  const [anatomySide, setAnatomySide] = useState<'front' | 'back'>('front');
  const [state, setState] = useState(getState());

  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const updateParams = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set(key, val); else params.delete(key);
    setSearchParams(params);
  };

  const handleMuscleSelect = (part: ExtendedBodyPart) => {
    const mappedMuscle = MUSCLE_MAPPING[part.slug || ''];
    if (mappedMuscle) {
      setMuscle(mappedMuscle);
      updateParams('muscle', mappedMuscle);
    }
  };

  const filtered = EXERCISES.filter(ex => {
    const copy = localizedExercise(ex, lang);
    if (search) {
      const q = search.toLowerCase();
      if (!copy.name.toLowerCase().includes(q) && !ex.name.toLowerCase().includes(q)) return false;
    }
    if (muscle && !ex.muscleGroups.includes(muscle)) return false;
    if (equip && !ex.equipment.includes(equip)) return false;
    if (diff && ex.difficulty !== diff) return false;
    if (type && ex.type !== type) return false;
    return true;
  });

  const diffColors = { beginner: 'bg-green-500/20 text-green-400', intermediate: 'bg-yellow-500/20 text-yellow-400', advanced: 'bg-red-500/20 text-red-400' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">{t({ en: 'Exercise Library', fa: 'کتابخانه تمرین‌ها' })}</h1>
        <p className="text-fg-subtle text-lg">{t({ en: 'Browse our comprehensive database of exercises with detailed instructions.', fa: 'پایگاه داده جامع تمرین‌های ما را با دستورالعمل‌های دقیق مرور کنید.' })}</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col mb-6 gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-subtle" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); updateParams('q', e.target.value); }}
              placeholder={t({ en: 'Search exercises...', fa: 'جستجوی تمرین‌ها...' })}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-surface border border-strong rounded-lg text-fg focus:border-orange-500 outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-strong rounded-lg hover:bg-elevated transition-colors">
            <Filter className="w-4 h-4" /> {t({ en: 'Filters', fa: 'فیلترها' })}
          </button>
        </div>

        <div className="flex p-1 bg-surface rounded-lg w-fit">
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            <LayoutGrid className="w-4 h-4" /> {t({ en: 'List View', fa: 'نمایش لیستی' })}
          </button>
          <button 
            onClick={() => setViewMode('anatomy')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'anatomy' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            <PersonStanding className="w-4 h-4" /> {t({ en: 'Anatomy View', fa: 'نمایش آناتومی' })}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in">
          <select value={muscle} onChange={e => { setMuscle(e.target.value); updateParams('muscle', e.target.value); }} className="px-3 py-2 bg-surface border border-strong rounded-lg text-fg text-sm">
            <option value="">{t({ en: 'All Muscles', fa: 'همه عضلات' })}</option>
            {ALL_MUSCLE_GROUPS.map(m => <option key={m} value={m}>{localizedMuscleGroup(lang, m)}</option>)}
          </select>
          <select value={equip} onChange={e => { setEquip(e.target.value); updateParams('equipment', e.target.value); }} className="px-3 py-2 bg-surface border border-strong rounded-lg text-fg text-sm">
            <option value="">{t({ en: 'All Equipment', fa: 'همه تجهیزات' })}</option>
            {ALL_EQUIPMENT.map(e => <option key={e} value={e}>{localizedEquipment(lang, e)}</option>)}
          </select>
          <select value={diff} onChange={e => { setDiff(e.target.value); updateParams('difficulty', e.target.value); }} className="px-3 py-2 bg-surface border border-strong rounded-lg text-fg text-sm">
            <option value="">{t({ en: 'All Difficulties', fa: 'همه سختی‌ها' })}</option>
            <option value="beginner">{t({ en: 'Beginner', fa: 'مبتدی' })}</option>
            <option value="intermediate">{t({ en: 'Intermediate', fa: 'متوسط' })}</option>
            <option value="advanced">{t({ en: 'Advanced', fa: 'پیشرفته' })}</option>
          </select>
          <select value={type} onChange={e => { setType(e.target.value); updateParams('type', e.target.value); }} className="px-3 py-2 bg-surface border border-strong rounded-lg text-fg text-sm">
            <option value="">{t({ en: 'All Types', fa: 'همه انواع' })}</option>
            <option value="strength">{t({ en: 'Strength', fa: 'قدرتی' })}</option>
            <option value="cardio">{t({ en: 'Cardio', fa: 'هوازی' })}</option>
            <option value="corrective">{t({ en: 'Corrective', fa: 'اصلاحی' })}</option>
            <option value="mobility">{t({ en: 'Mobility', fa: 'تحرک' })}</option>
          </select>
        </div>
      )}

      {viewMode === 'anatomy' && (
        <div className="mb-10 bg-surface/50 border border-border rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center md:items-start animate-fade-in max-w-full min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col items-center">
            <div className="flex gap-2 mb-6 p-1 bg-surface rounded-lg">
              <button onClick={() => setAnatomyGender('male')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${anatomyGender === 'male' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Male', fa: 'آقا' })}</button>
              <button onClick={() => setAnatomyGender('female')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${anatomyGender === 'female' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Female', fa: 'خانم' })}</button>
            </div>
            
            <div className="h-[400px] w-full max-w-full overflow-hidden flex items-center justify-center">
              <Model
                data={Object.keys(MUSCLE_MAPPING)
                  .filter(slug => MUSCLE_MAPPING[slug] === muscle)
                  .map(slug => ({ slug: slug as Slug, intensity: 2, color: '#f97316' }))}
                side={anatomySide}
                gender={anatomyGender}
                onBodyPartPress={handleMuscleSelect}
                scale={1}
                colors={['#f97316', '#ea580c', '#c2410c']}
              />
            </div>
            
            <div className="flex gap-2 mt-6 p-1 bg-surface rounded-lg">
              <button onClick={() => setAnatomySide('front')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${anatomySide === 'front' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Front', fa: 'جلو' })}</button>
              <button onClick={() => setAnatomySide('back')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${anatomySide === 'back' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Back', fa: 'پشت' })}</button>
            </div>
          </div>
          
          <div className="flex-1 w-full md:w-auto">
            <h3 className="text-xl font-bold mb-4">{t({ en: 'Selected Muscle', fa: 'عضله انتخاب شده' })}: <span className="text-orange-500">{muscle ? localizedMuscleGroup(lang, muscle) : t({ en: 'None (Showing All)', fa: 'هیچ (نمایش همه)' })}</span></h3>
            <p className="text-fg-subtle mb-6">{t({ en: 'Click on a muscle group on the model to filter exercises specifically for that area.', fa: 'روی یک گروه عضلانی در مدل کلیک کنید تا تمرینات مخصوص آن قسمت فیلتر شود.' })}</p>
            
            {muscle && (
              <button 
                onClick={() => { setMuscle(''); updateParams('muscle', ''); }}
                className="px-4 py-2 bg-elevated text-fg rounded-lg hover:bg-elevated-hover transition-colors text-sm font-medium"
              >
                {t({ en: 'Clear Selection', fa: 'پاک کردن انتخاب' })}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-sm text-fg-subtle mb-4">{filtered.length} {t({ en: 'exercises found', fa: 'تمرین یافت شد' })}</div>

      {/* Exercise Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => {
          const copy = localizedExercise(ex, lang);
          return (
          <div key={ex.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-strong transition-all group">
            <div className="h-40 bg-gradient-to-br from-elevated to-surface flex items-center justify-center relative">
              <Dumbbell className="w-12 h-12 text-fg-faint" />
              {state.currentUser && (
                <button
                  onClick={(e) => { e.preventDefault(); toggleSavedExercise(ex.id); }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-elevated/80 hover:bg-elevated-hover transition-colors"
                >
                  {state.savedExercises.includes(ex.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-fg-subtle" />
                  )}
                </button>
              )}
            </div>
            <Link to={`/exercises/${ex.slug}`} className="block p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[ex.difficulty]}`}>
                  {copy.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-elevated-hover text-fg-muted capitalize">{copy.type}</span>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors">{copy.name}</h3>
              <div className="flex flex-wrap gap-1">
                {copy.muscleGroups.map(mg => (
                  <span key={mg} className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">{mg}</span>
                ))}
              </div>
            </Link>
          </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-fg-faint mx-auto mb-4" />
          <h3 className="text-lg font-bold text-fg-subtle">{t({ en: 'No exercises found', fa: 'هیچ تمرینی یافت نشد' })}</h3>
          <p className="text-fg-faint text-sm">{t({ en: 'Try adjusting your filters', fa: 'سعی کنید فیلترهای خود را تنظیم کنید' })}</p>
        </div>
      )}
    </div>
  );
}

export function ExerciseDetail() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const navigate = useNavigate();
  const exercise = EXERCISES.find(e => e.slug === slug);
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  if (!exercise) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Exercise not found', fa: 'تمرین یافت نشد' })}</h1>
        <button onClick={() => navigate('/exercises')} className="text-orange-400">← {t({ en: 'Back to exercises', fa: 'بازگشت به تمرین‌ها' })}</button>
      </div>
    );
  }

  const diffColors = { beginner: 'bg-green-500/20 text-green-400', intermediate: 'bg-yellow-500/20 text-yellow-400', advanced: 'bg-red-500/20 text-red-400' };
  const copy = localizedExercise(exercise, lang);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/exercises')} className="flex items-center gap-2 text-fg-subtle hover:text-fg transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t({ en: 'Back to Exercises', fa: 'بازگشت به تمرین‌ها' })}
      </button>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-elevated to-surface flex items-center justify-center relative">
          <Dumbbell className="w-20 h-20 text-fg-faint" />
          {state.currentUser && (
            <button
              onClick={() => toggleSavedExercise(exercise.id)}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated/80 hover:bg-elevated-hover transition-colors"
            >
              {state.savedExercises.includes(exercise.id) ? (
                <><BookmarkCheck className="w-4 h-4 text-orange-400" /> {t({ en: 'Saved', fa: 'ذخیره شد' })}</>
              ) : (
                <><Bookmark className="w-4 h-4 text-fg-subtle" /> {t({ en: 'Save', fa: 'ذخیره' })}</>
              )}
            </button>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diffColors[exercise.difficulty]}`}>{copy.difficulty}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-elevated-hover text-fg-muted capitalize">{copy.type}</span>
          </div>
          <h1 className="text-3xl font-black mb-4">{copy.name}</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-fg-subtle mb-2">{t({ en: 'Target Muscles', fa: 'عضلات هدف' })}</h3>
              <div className="flex flex-wrap gap-2">
                {copy.muscleGroups.map(mg => (
                  <span key={mg} className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium">{mg}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-fg-subtle mb-2">{t({ en: 'Equipment', fa: 'تجهیزات' })}</h3>
              <div className="flex flex-wrap gap-2">
                {copy.equipment.map(eq => (
                  <span key={eq} className="px-3 py-1.5 rounded-lg bg-elevated-hover text-fg-muted text-sm">{eq}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">{t({ en: 'Instructions', fa: 'دستورالعمل‌ها' })}</h2>
            <p className="text-fg-muted leading-relaxed whitespace-pre-line">{copy.instructions}</p>
          </div>

          {copy.commonMistakes && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h2 className="text-lg font-bold mb-3 text-red-400">{t({ en: 'Common Mistakes', fa: 'اشتباهات رایج' })}</h2>
              <p className="text-fg-muted leading-relaxed">{copy.commonMistakes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
