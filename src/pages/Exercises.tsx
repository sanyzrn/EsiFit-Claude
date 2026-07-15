import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Bookmark, BookmarkCheck, Dumbbell, LayoutGrid, PersonStanding } from 'lucide-react';
import Model, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { EXERCISES, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT, getState, toggleSavedExercise, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localizedExercise, localizedMuscleGroup, localizedEquipment } from '@/lib/content-i18n';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

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

  const diffColors = { beginner: 'bg-success/15 text-success', intermediate: 'bg-warning/15 text-warning', advanced: 'bg-danger/15 text-danger' };

  return (
    <PageContainer>
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
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-surface border border-border rounded-[12px] text-fg focus:border-brand outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-[12px] hover:bg-elevated transition-[color,background-color] duration-[180ms]">
            <Filter className="w-4 h-4" /> {t({ en: 'Filters', fa: 'فیلترها' })}
          </button>
        </div>

        <div className="flex p-1 bg-elevated rounded-[12px] w-fit">
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${viewMode === 'list' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            <LayoutGrid className="w-4 h-4" /> {t({ en: 'List View', fa: 'نمایش لیستی' })}
          </button>
          <button 
            onClick={() => setViewMode('anatomy')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${viewMode === 'anatomy' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            <PersonStanding className="w-4 h-4" /> {t({ en: 'Anatomy View', fa: 'نمایش آناتومی' })}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in">
          <select value={muscle} onChange={e => { setMuscle(e.target.value); updateParams('muscle', e.target.value); }} className="px-3 py-2 bg-surface border border-border rounded-[12px] text-fg text-sm">
            <option value="">{t({ en: 'All Muscles', fa: 'همه عضلات' })}</option>
            {ALL_MUSCLE_GROUPS.map(m => <option key={m} value={m}>{localizedMuscleGroup(lang, m)}</option>)}
          </select>
          <select value={equip} onChange={e => { setEquip(e.target.value); updateParams('equipment', e.target.value); }} className="px-3 py-2 bg-surface border border-border rounded-[12px] text-fg text-sm">
            <option value="">{t({ en: 'All Equipment', fa: 'همه تجهیزات' })}</option>
            {ALL_EQUIPMENT.map(e => <option key={e} value={e}>{localizedEquipment(lang, e)}</option>)}
          </select>
          <select value={diff} onChange={e => { setDiff(e.target.value); updateParams('difficulty', e.target.value); }} className="px-3 py-2 bg-surface border border-border rounded-[12px] text-fg text-sm">
            <option value="">{t({ en: 'All Difficulties', fa: 'همه سختی‌ها' })}</option>
            <option value="beginner">{t({ en: 'Beginner', fa: 'مبتدی' })}</option>
            <option value="intermediate">{t({ en: 'Intermediate', fa: 'متوسط' })}</option>
            <option value="advanced">{t({ en: 'Advanced', fa: 'پیشرفته' })}</option>
          </select>
          <select value={type} onChange={e => { setType(e.target.value); updateParams('type', e.target.value); }} className="px-3 py-2 bg-surface border border-border rounded-[12px] text-fg text-sm">
            <option value="">{t({ en: 'All Types', fa: 'همه انواع' })}</option>
            <option value="strength">{t({ en: 'Strength', fa: 'قدرتی' })}</option>
            <option value="cardio">{t({ en: 'Cardio', fa: 'هوازی' })}</option>
            <option value="corrective">{t({ en: 'Corrective', fa: 'اصلاحی' })}</option>
            <option value="mobility">{t({ en: 'Mobility', fa: 'تحرک' })}</option>
          </select>
        </div>
      )}

      {viewMode === 'anatomy' && (
        <div className="mb-10 card-iranian p-6 flex flex-col md:flex-row gap-8 items-center md:items-start animate-fade-in max-w-full min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col items-center">
            <div className="flex gap-2 mb-6 p-1 bg-elevated rounded-[12px]">
              <button onClick={() => setAnatomyGender('male')} className={`px-4 py-1.5 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${anatomyGender === 'male' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Male', fa: 'آقا' })}</button>
              <button onClick={() => setAnatomyGender('female')} className={`px-4 py-1.5 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${anatomyGender === 'female' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Female', fa: 'خانم' })}</button>
            </div>
            
            <div className="h-[400px] w-full max-w-full overflow-hidden flex items-center justify-center">
              <Model
                data={Object.keys(MUSCLE_MAPPING)
                  .filter(slug => MUSCLE_MAPPING[slug] === muscle)
                  .map(slug => ({ slug: slug as Slug, intensity: 2, color: 'var(--theme-primary)' }))}
                side={anatomySide}
                gender={anatomyGender}
                onBodyPartPress={handleMuscleSelect}
                scale={1}
                colors={['var(--theme-primary)', 'var(--theme-primary-hover)', 'var(--theme-accent)']}
              />
            </div>
            
            <div className="flex gap-2 mt-6 p-1 bg-elevated rounded-[12px]">
              <button onClick={() => setAnatomySide('front')} className={`px-4 py-1.5 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${anatomySide === 'front' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Front', fa: 'جلو' })}</button>
              <button onClick={() => setAnatomySide('back')} className={`px-4 py-1.5 rounded-[12px] text-sm font-medium transition-[color,background-color] duration-[180ms] ${anatomySide === 'back' ? 'bg-elevated text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}>{t({ en: 'Back', fa: 'پشت' })}</button>
            </div>
          </div>
          
          <div className="flex-1 w-full md:w-auto">
            <h3 className="text-xl font-bold mb-4">{t({ en: 'Selected Muscle', fa: 'عضله انتخاب شده' })}: <span className="text-brand">{muscle ? localizedMuscleGroup(lang, muscle) : t({ en: 'None (Showing All)', fa: 'هیچ (نمایش همه)' })}</span></h3>
            <p className="text-fg-subtle mb-6">{t({ en: 'Click on a muscle group on the model to filter exercises specifically for that area.', fa: 'روی یک گروه عضلانی در مدل کلیک کنید تا تمرینات مخصوص آن قسمت فیلتر شود.' })}</p>
            
            {muscle && (
              <button 
                onClick={() => { setMuscle(''); updateParams('muscle', ''); }}
                className="px-4 py-2 bg-elevated text-fg rounded-[12px] hover:bg-elevated-hover transition-[color,background-color] duration-[180ms] text-sm font-medium"
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
          <div key={ex.id} className="card-iranian overflow-hidden hover:border-border-strong transition-[border-color] duration-[180ms] group p-0">
            <div className="h-40 bg-gradient-to-br from-elevated to-surface flex items-center justify-center relative">
              <Dumbbell className="w-12 h-12 text-fg-faint" />
              {state.currentUser && (
                <button
                  onClick={(e) => { e.preventDefault(); toggleSavedExercise(ex.id); }}
                  className="absolute top-3 right-3 p-2 rounded-[12px] bg-elevated/80 hover:bg-elevated-hover transition-[background-color] duration-[180ms]"
                >
                  {state.savedExercises.includes(ex.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-brand" />
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
              <h3 className="font-bold text-lg mb-2 group-hover:text-brand transition-colors">{copy.name}</h3>
              <div className="flex flex-wrap gap-1">
                {copy.muscleGroups.map(mg => (
                  <span key={mg} className="text-xs px-2 py-0.5 rounded bg-brand-muted text-brand">{mg}</span>
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
    </PageContainer>
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
      <PageContainer className="text-center">
        <Breadcrumbs items={[
          { label: t({ en: 'Exercises', fa: 'تمرین‌ها' }), href: '/exercises' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-4">{t({ en: 'Exercise not found', fa: 'تمرین یافت نشد' })}</h1>
        <button onClick={() => navigate('/exercises')} className="text-brand">← {t({ en: 'Back to exercises', fa: 'بازگشت به تمرین‌ها' })}</button>
      </PageContainer>
    );
  }

  const diffColors = { beginner: 'bg-success/15 text-success', intermediate: 'bg-warning/15 text-warning', advanced: 'bg-danger/15 text-danger' };
  const copy = localizedExercise(exercise, lang);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
      <Breadcrumbs items={[
        { label: t({ en: 'Exercises', fa: 'تمرین‌ها' }), href: '/exercises' },
        { label: copy.name },
      ]} />

      <div className="card-iranian overflow-hidden p-0">
        <div className="h-64 bg-gradient-to-br from-elevated to-surface flex items-center justify-center relative">
          <Dumbbell className="w-20 h-20 text-fg-faint" />
          {state.currentUser && (
            <button
              onClick={() => toggleSavedExercise(exercise.id)}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-[12px] bg-elevated/80 hover:bg-elevated-hover transition-[background-color] duration-[180ms]"
            >
              {state.savedExercises.includes(exercise.id) ? (
                <><BookmarkCheck className="w-4 h-4 text-brand" /> {t({ en: 'Saved', fa: 'ذخیره شد' })}</>
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
                  <span key={mg} className="px-3 py-1.5 rounded-[12px] bg-brand-muted text-brand text-sm font-medium">{mg}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-fg-subtle mb-2">{t({ en: 'Equipment', fa: 'تجهیزات' })}</h3>
              <div className="flex flex-wrap gap-2">
                {copy.equipment.map(eq => (
                  <span key={eq} className="px-3 py-1.5 rounded-[12px] bg-elevated-hover text-fg-muted text-sm">{eq}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">{t({ en: 'Instructions', fa: 'دستورالعمل‌ها' })}</h2>
            <p className="text-fg-muted leading-relaxed whitespace-pre-line">{copy.instructions}</p>
          </div>

          {copy.commonMistakes && (
            <div className="bg-danger/5 border border-danger/20 rounded-[20px] p-5">
              <h2 className="text-lg font-bold mb-3 text-danger">{t({ en: 'Common Mistakes', fa: 'اشتباهات رایج' })}</h2>
              <p className="text-fg-muted leading-relaxed">{copy.commonMistakes}</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </PageContainer>
  );
}
