import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Bookmark, BookmarkCheck, Dumbbell } from 'lucide-react';
import { EXERCISES, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT, getState, toggleSavedExercise, subscribe } from '@/lib/store';

export function ExerciseList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [muscle, setMuscle] = useState(searchParams.get('muscle') || '');
  const [equip, setEquip] = useState(searchParams.get('equipment') || '');
  const [diff, setDiff] = useState(searchParams.get('difficulty') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [state, setState] = useState(getState());

  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const updateParams = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set(key, val); else params.delete(key);
    setSearchParams(params);
  };

  const filtered = EXERCISES.filter(ex => {
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
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
        <h1 className="text-4xl font-black mb-4">Exercise Library</h1>
        <p className="text-gray-400 text-lg">Browse our comprehensive database of exercises with detailed instructions.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); updateParams('q', e.target.value); }}
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in">
          <select value={muscle} onChange={e => { setMuscle(e.target.value); updateParams('muscle', e.target.value); }} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
            <option value="">All Muscles</option>
            {ALL_MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={equip} onChange={e => { setEquip(e.target.value); updateParams('equipment', e.target.value); }} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
            <option value="">All Equipment</option>
            {ALL_EQUIPMENT.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={diff} onChange={e => { setDiff(e.target.value); updateParams('difficulty', e.target.value); }} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select value={type} onChange={e => { setType(e.target.value); updateParams('type', e.target.value); }} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
            <option value="">All Types</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="corrective">Corrective</option>
            <option value="mobility">Mobility</option>
          </select>
        </div>
      )}

      <div className="text-sm text-gray-400 mb-4">{filtered.length} exercises found</div>

      {/* Exercise Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
            <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <Dumbbell className="w-12 h-12 text-gray-600" />
              {state.currentUser && (
                <button
                  onClick={(e) => { e.preventDefault(); toggleSavedExercise(ex.id); }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors"
                >
                  {state.savedExercises.includes(ex.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>
            <Link to={`/exercises/${ex.slug}`} className="block p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[ex.difficulty]}`}>
                  {ex.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 capitalize">{ex.type}</span>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors">{ex.name}</h3>
              <div className="flex flex-wrap gap-1">
                {ex.muscleGroups.map(mg => (
                  <span key={mg} className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">{mg}</span>
                ))}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400">No exercises found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

export function ExerciseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const exercise = EXERCISES.find(e => e.slug === slug);
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  if (!exercise) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Exercise not found</h1>
        <button onClick={() => navigate('/exercises')} className="text-orange-400">← Back to exercises</button>
      </div>
    );
  }

  const diffColors = { beginner: 'bg-green-500/20 text-green-400', intermediate: 'bg-yellow-500/20 text-yellow-400', advanced: 'bg-red-500/20 text-red-400' };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/exercises')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Exercises
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
          <Dumbbell className="w-20 h-20 text-gray-600" />
          {state.currentUser && (
            <button
              onClick={() => toggleSavedExercise(exercise.id)}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors"
            >
              {state.savedExercises.includes(exercise.id) ? (
                <><BookmarkCheck className="w-4 h-4 text-orange-400" /> Saved</>
              ) : (
                <><Bookmark className="w-4 h-4 text-gray-400" /> Save</>
              )}
            </button>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diffColors[exercise.difficulty]}`}>{exercise.difficulty}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 capitalize">{exercise.type}</span>
          </div>
          <h1 className="text-3xl font-black mb-4">{exercise.name}</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Target Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.muscleGroups.map(mg => (
                  <span key={mg} className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium">{mg}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map(eq => (
                  <span key={eq} className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-sm">{eq}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Instructions</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{exercise.instructions}</p>
          </div>

          {exercise.commonMistakes && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h2 className="text-lg font-bold mb-3 text-red-400">Common Mistakes</h2>
              <p className="text-gray-300 leading-relaxed">{exercise.commonMistakes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
