import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Apple, Lock, UtensilsCrossed } from 'lucide-react';
import { DIET_PLANS, getState, subscribe } from '@/lib/store';
import TierGate from '@/components/TierGate';
import { hasTierAccess } from '@/lib/types';

export function DietList() {
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  const userTier = state.currentUser?.subscriptionTier || 'FREE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">Diet Plans</h1>
        <p className="text-gray-400 text-lg">Calorie-calculated meal plans with macros broken down per meal.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DIET_PLANS.map(plan => {
          const locked = !hasTierAccess(userTier, plan.requiredTier);
          return (
            <Link
              key={plan.id}
              to={`/diet/${plan.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all relative"
            >
              <div className="h-48 bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center relative">
                <Apple className="w-16 h-16 text-green-500/30" />
                {locked && (
                  <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">{plan.requiredTier} Required</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{plan.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{plan.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="text-orange-400 font-bold">{plan.totalCalories} kcal</span>
                  <span>{plan.meals.length} meals</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DietDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const plan = DIET_PLANS.find(p => p.slug === slug);
  if (!plan) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Diet plan not found</h1>
        <button onClick={() => navigate('/diet')} className="text-orange-400">← Back to diet plans</button>
      </div>
    );
  }

  const userTier = state.currentUser?.subscriptionTier || 'FREE';
  const hasAccess = hasTierAccess(userTier, plan.requiredTier);

  const totalMacros = plan.meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealContent = (
    <div className="space-y-6">
      {plan.meals.map(meal => {
        const mealTotals = meal.items.reduce((a, i) => ({
          calories: a.calories + i.calories,
          protein: a.protein + i.protein,
          carbs: a.carbs + i.carbs,
          fat: a.fat + i.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return (
          <div key={meal.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold">{meal.name}</h3>
              </div>
              <span className="text-sm text-orange-400 font-bold">{Math.round(mealTotals.calories)} kcal</span>
            </div>
            <div className="divide-y divide-gray-800">
              {meal.items.map(item => (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{item.foodName}</div>
                    <div className="text-xs text-gray-400">{item.grams}g</div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>{Math.round(item.calories)} cal</span>
                    <span className="text-blue-400">P: {Math.round(item.protein)}g</span>
                    <span className="text-green-400">C: {Math.round(item.carbs)}g</span>
                    <span className="text-yellow-400">F: {Math.round(item.fat)}g</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-gray-800/50 flex justify-between text-xs font-medium">
              <span className="text-gray-400">Meal Total</span>
              <div className="flex gap-4">
                <span className="text-blue-400">P: {Math.round(mealTotals.protein)}g</span>
                <span className="text-green-400">C: {Math.round(mealTotals.carbs)}g</span>
                <span className="text-yellow-400">F: {Math.round(mealTotals.fat)}g</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/diet')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Diet Plans
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 mb-6">
        <h1 className="text-3xl font-black mb-4">{plan.title}</h1>
        <p className="text-gray-400 leading-relaxed mb-6">{plan.description}</p>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-orange-400">{Math.round(totalMacros.calories)}</div>
            <div className="text-xs text-gray-400">Total Calories</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-400">{Math.round(totalMacros.protein)}g</div>
            <div className="text-xs text-gray-400">Protein</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{Math.round(totalMacros.carbs)}g</div>
            <div className="text-xs text-gray-400">Carbs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{Math.round(totalMacros.fat)}g</div>
            <div className="text-xs text-gray-400">Fat</div>
          </div>
        </div>
      </div>

      {hasAccess ? mealContent : (
        <TierGate minTier={plan.requiredTier}>
          {mealContent}
        </TierGate>
      )}
    </div>
  );
}
