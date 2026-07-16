import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Bookmark, BookmarkCheck, Dumbbell, LayoutGrid, PersonStanding, SlidersHorizontal, X } from 'lucide-react';
import Model, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { EXERCISES, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT, getState, toggleSavedExercise, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localizedExercise, localizedMuscleGroup, localizedEquipment } from '@/lib/content-i18n';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

const MUSCLE_MAPPING: Record<string, string> = {
  'abs': 'Core', 'biceps': 'Biceps', 'calves': 'Legs', 'chest': 'Chest',
  'deltoids': 'Shoulders', 'gluteal': 'Glutes', 'hamstring': 'Hamstrings',
  'lower-back': 'Back', 'neck': 'Back', 'obliques': 'Core',
  'quadriceps': 'Quadriceps', 'trapezius': 'Back', 'triceps': 'Triceps',
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
    const mapped = MUSCLE_MAPPING[part.slug || ''];
    if (mapped) { setMuscle(mapped); updateParams('muscle', mapped); }
  };

  const filtered = EXERCISES.filter(ex => {
    if (search) { const q = search.toLowerCase(); if (!ex.name.toLowerCase().includes(q)) return false; }
    if (muscle && !ex.muscleGroups.includes(muscle)) return false;
    if (equip && !ex.equipment.includes(equip)) return false;
    if (diff && ex.difficulty !== diff) return false;
    if (type && ex.type !== type) return false;
    return true;
  });

  const diffColors = {
    beginner: { bg: 'color-mix(in srgb, var(--theme-success) 12%, transparent)', text: 'var(--theme-success)' },
    intermediate: { bg: 'color-mix(in srgb, var(--theme-warning) 12%, transparent)', text: 'var(--theme-warning)' },
    advanced: { bg: 'color-mix(in srgb, var(--theme-error) 12%, transparent)', text: 'var(--theme-error)' },
  };

  const typeColors: Record<string, string> = {
    strength: 'var(--theme-primary)', cardio: 'var(--theme-accent)',
    corrective: 'var(--theme-secondary)', mobility: 'var(--theme-warning)',
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-3 font-display">
          {t({ en: 'Exercise Library', fa: 'کتابخانه تمرین‌ها' })}
        </h1>
        <p className="text-lg" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: 'Browse our comprehensive database of exercises with detailed instructions.', fa: 'پایگاه داده جامع تمرین‌های ما را با دستورالعمل‌های دقیق مرور کنید.' })}
        </p>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col mb-6 gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-fg-subtle)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); updateParams('q', e.target.value); }}
              placeholder={t({ en: 'Search exercises...', fa: 'جستجوی تمرین‌ها...' })}
              className="w-full pl-10 pr-4 py-3 text-sm outline-none transition-all duration-[180ms]"
              style={{
                backgroundColor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                borderRadius: 'var(--radius-input)',
                color: 'var(--theme-fg)',
              }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-[180ms]"
            style={{
              backgroundColor: showFilters ? 'var(--theme-primary-dim)' : 'var(--theme-surface)',
              color: showFilters ? 'var(--theme-primary)' : 'var(--theme-fg-muted)',
              border: '1px solid var(--theme-border)',
            }}>
            <SlidersHorizontal className="w-4 h-4" />
            {t({ en: 'Filters', fa: 'فیلترها' })}
            {(muscle || equip || diff || type) && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
            )}
          </button>
        </div>

        <div className="flex p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--theme-elevated)' }}>
          <button onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms] ${
              viewMode === 'list' ? '' : 'opacity-60'
            }`}
            style={{
              backgroundColor: viewMode === 'list' ? 'var(--theme-elevated-hover)' : 'transparent',
              color: viewMode === 'list' ? 'var(--theme-fg)' : 'var(--theme-fg-subtle)',
            }}>
            <LayoutGrid className="w-4 h-4" /> {t({ en: 'Grid', fa: 'شبکه‌ای' })}
          </button>
          <button onClick={() => setViewMode('anatomy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms] ${
              viewMode === 'anatomy' ? '' : 'opacity-60'
            }`}
            style={{
              backgroundColor: viewMode === 'anatomy' ? 'var(--theme-elevated-hover)' : 'transparent',
              color: viewMode === 'anatomy' ? 'var(--theme-fg)' : 'var(--theme-fg-subtle)',
            }}>
            <PersonStanding className="w-4 h-4" /> {t({ en: 'Anatomy', fa: 'آناتومی' })}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in">
          {[
            { val: muscle, set: setMuscle, param: 'muscle', placeholder: t({ en: 'All Muscles', fa: 'همه عضلات' }),
              options: ALL_MUSCLE_GROUPS.map(m => ({ value: m, label: localizedMuscleGroup(lang, m) })) },
            { val: equip, set: setEquip, param: 'equipment', placeholder: t({ en: 'All Equipment', fa: 'همه تجهیزات' }),
              options: ALL_EQUIPMENT.map(e => ({ value: e, label: localizedEquipment(lang, e) })) },
            { val: diff, set: setDiff, param: 'difficulty', placeholder: t({ en: 'All Levels', fa: 'همه سطوح' }),
              options: ['beginner', 'intermediate', 'advanced'].map(d => ({ value: d, label: t({ en: d, fa: d }) })) },
            { val: type, set: setType, param: 'type', placeholder: t({ en: 'All Types', fa: 'همه انواع' }),
              options: ['strength', 'cardio', 'corrective', 'mobility'].map(d => ({ value: d, label: d })) },
          ].map((filter, fi) => (
            <select key={fi} value={filter.val}
              onChange={e => { filter.set(e.target.value); updateParams(filter.param, e.target.value); }}
              className="px-3 py-2.5 text-sm outline-none rounded-xl"
              style={{ backgroundColor: 'var(--theme-elevated)', border: '1px solid var(--theme-border)', color: 'var(--theme-fg)' }}>
              <option value="">{filter.placeholder}</option>
              {filter.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Anatomy View */}
      {viewMode === 'anatomy' && (
        <div className="mb-10 card-premium p-6 flex flex-col md:flex-row gap-8 items-center md:items-start animate-scale-in overflow-hidden">
          <div className="flex-1 flex flex-col items-center">
            <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ backgroundColor: 'var(--theme-elevated)' }}>
              <button onClick={() => setAnatomyGender('male')}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-[180ms] ${
                  anatomyGender === 'male' ? '' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: anatomyGender === 'male' ? 'var(--theme-elevated-hover)' : 'transparent',
                  color: 'var(--theme-fg)',
                }}>{t({ en: 'Male', fa: 'آقا' })}</button>
              <button onClick={() => setAnatomyGender('female')}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-[180ms] ${
                  anatomyGender === 'female' ? '' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: anatomyGender === 'female' ? 'var(--theme-elevated-hover)' : 'transparent',
                  color: 'var(--theme-fg)',
                }}>{t({ en: 'Female', fa: 'خانم' })}</button>
            </div>
            <div className="h-[380px] w-full max-w-full overflow-hidden flex items-center justify-center">
              <Model
                data={Object.keys(MUSCLE_MAPPING)
                  .filter(s => MUSCLE_MAPPING[s] === muscle)
                  .map(s => ({ slug: s as Slug, intensity: 2, color: 'var(--theme-primary)' }))}
                side={anatomySide} gender={anatomyGender}
                onBodyPartPress={handleMuscleSelect} scale={1}
                colors={['var(--theme-primary)', 'var(--theme-primary-hover)', 'var(--theme-accent)']}
              />
            </div>
            <div className="flex gap-2 mt-6 p-1 rounded-xl" style={{ backgroundColor: 'var(--theme-elevated)' }}>
              <button onClick={() => setAnatomySide('front')}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-[180ms] ${
                  anatomySide === 'front' ? '' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: anatomySide === 'front' ? 'var(--theme-elevated-hover)' : 'transparent',
                  color: 'var(--theme-fg)',
                }}>{t({ en: 'Front', fa: 'جلو' })}</button>
              <button onClick={() => setAnatomySide('back')}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-[180ms] ${
                  anatomySide === 'back' ? '' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: anatomySide === 'back' ? 'var(--theme-elevated-hover)' : 'transparent',
                  color: 'var(--theme-fg)',
                }}>{t({ en: 'Back', fa: 'پشت' })}</button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-xl font-bold mb-4 font-display">
              {t({ en: 'Selected Muscle', fa: 'عضله انتخاب شده' })}:{' '}
              <span style={{ color: 'var(--theme-primary)' }}>
                {muscle ? localizedMuscleGroup(lang, muscle) : t({ en: 'None (Showing All)', fa: 'همه عضلات' })}
              </span>
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: 'Click on a muscle group on the model to filter exercises.', fa: 'روی یک گروه عضلانی در مدل کلیک کنید تا تمرینات مخصوص آن فیلتر شود.' })}
            </p>
            {muscle && (
              <button onClick={() => { setMuscle(''); updateParams('muscle', ''); }}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms]"
                style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg-muted)' }}>
                <X className="w-4 h-4 inline mr-1" />
                {t({ en: 'Clear', fa: 'پاک کردن' })}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm mb-5" style={{ color: 'var(--theme-fg-subtle)' }}>
        {filtered.length} {t({ en: 'exercises', fa: 'تمرین' })}
      </div>

      {/* Exercise Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => {
          const copy = localizedExercise(ex, lang);
          const dc = diffColors[ex.difficulty];
          const tc = typeColors[ex.type] || 'var(--theme-fg-subtle)';
          return (
            <div key={ex.id} className="card-premium overflow-hidden group p-0 animate-slide-up-children">
              {/* Card image area */}
              <div className="h-44 flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, var(--theme-elevated), var(--theme-surface))' }}>
                <Dumbbell className="w-14 h-14" style={{ color: 'var(--theme-fg-faint)' }} />
                {state.currentUser && (
                  <button onClick={(e) => { e.preventDefault(); toggleSavedExercise(ex.id); }}
                    className="absolute top-3 right-3 p-2 rounded-xl transition-all duration-[180ms]"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-elevated) 80%, transparent)' }}>
                    {state.savedExercises.includes(ex.id) ? (
                      <BookmarkCheck className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                    ) : (
                      <Bookmark className="w-4 h-4" style={{ color: 'var(--theme-fg-subtle)' }} />
                    )}
                  </button>
                )}
              </div>
              <Link to={`/exercises/${ex.slug}`} className="block p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: dc.bg, color: dc.text }}>
                    {copy.difficulty}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `color-mix(in srgb, ${tc} 12%, transparent)`, color: tc }}>
                    {copy.type}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2.5 group-hover:translate-x-0.5 transition-transform">{copy.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {copy.muscleGroups.map(mg => (
                    <span key={mg} className="text-xs px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>{mg}</span>
                  ))}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Dumbbell className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--theme-fg-faint)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'No exercises found', fa: 'هیچ تمرینی یافت نشد' })}
          </h3>
          <p className="text-sm" style={{ color: 'var(--theme-fg-faint)' }}>
            {t({ en: 'Try adjusting your filters', fa: 'سعی کنید فیلترهای خود را تنظیم کنید' })}
          </p>
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
      <PageContainer className="text-center py-20">
        <Breadcrumbs items={[
          { label: t({ en: 'Exercises', fa: 'تمرین‌ها' }), href: '/exercises' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-2">{t({ en: 'Exercise not found', fa: 'تمرین یافت نشد' })}</h1>
        <button onClick={() => navigate('/exercises')} className="text-sm font-semibold"
          style={{ color: 'var(--theme-primary)' }}>
          {t({ en: '← Back to exercises', fa: 'بازگشت به تمرین‌ها' })}
        </button>
      </PageContainer>
    );
  }

  const copy = localizedExercise(exercise, lang);
  const diffColors: Record<string, string> = {
    beginner: 'var(--theme-success)', intermediate: 'var(--theme-warning)', advanced: 'var(--theme-error)',
  };
  const dc = diffColors[exercise.difficulty];

  return (
    <PageContainer padY="md">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[
          { label: t({ en: 'Exercises', fa: 'تمرین‌ها' }), href: '/exercises' },
          { label: copy.name },
        ]} />

        <div className="card-premium overflow-hidden">
          {/* Hero image area */}
          <div className="h-64 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary-dim), var(--theme-accent-dim), var(--theme-surface))' }}>
            <Dumbbell className="w-24 h-24" style={{ color: 'var(--theme-fg-faint)' }} />
            {state.currentUser && (
              <button onClick={() => toggleSavedExercise(exercise.id)}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-[180ms]"
                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-elevated) 80%, transparent)' }}>
                {state.savedExercises.includes(exercise.id) ? (
                  <><BookmarkCheck className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} /> {t({ en: 'Saved', fa: 'ذخیره شد' })}</>
                ) : (
                  <><Bookmark className="w-4 h-4" /> {t({ en: 'Save', fa: 'ذخیره' })}</>
                )}
              </button>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ backgroundColor: `color-mix(in srgb, ${dc} 12%, transparent)`, color: dc }}>
                {copy.difficulty}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: 'var(--theme-elevated-hover)', color: 'var(--theme-fg-muted)' }}>
                {copy.type}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black mb-6 font-display">{copy.name}</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--theme-elevated)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--theme-fg-subtle)' }}>
                  {t({ en: 'Target Muscles', fa: 'عضلات هدف' })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {copy.muscleGroups.map(mg => (
                    <span key={mg} className="px-3 py-1.5 rounded-xl text-sm font-medium"
                      style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>{mg}</span>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--theme-elevated)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--theme-fg-subtle)' }}>
                  {t({ en: 'Equipment', fa: 'تجهیزات' })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {copy.equipment.map(eq => (
                    <span key={eq} className="px-3 py-1.5 rounded-xl text-sm"
                      style={{ backgroundColor: 'var(--theme-elevated-hover)', color: 'var(--theme-fg-muted)' }}>{eq}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 font-display">
                {t({ en: 'Instructions', fa: 'دستورالعمل‌ها' })}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--theme-fg-muted)' }}>
                {copy.instructions}
              </p>
            </div>

            {copy.commonMistakes && (
              <div className="p-6 rounded-2xl"
                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-error) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-error) 18%, transparent)' }}>
                <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--theme-error)' }}>
                  {t({ en: 'Common Mistakes', fa: 'اشتباهات رایج' })}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-fg-muted)' }}>
                  {copy.commonMistakes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
