import type { DietPlan } from '../types';

export const DIET_PLANS: DietPlan[] = [
  {
    id: 'dp1', slug: 'clean-bulk-3000', title: 'Clean Bulk — 3000 kcal', description: 'A clean bulking meal plan designed for muscle gain with minimal fat accumulation. High protein, moderate carbs, and healthy fats spread across 5 meals.', totalCalories: 3000, requiredTier: 'FREE',
    meals: [
      { id: 'm1', name: 'Breakfast', items: [
        { id: 'mi1', foodName: 'Oatmeal', grams: 100, calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
        { id: 'mi2', foodName: 'Whole Eggs', grams: 150, calories: 233, protein: 19.5, carbs: 1.1, fat: 15.8 },
        { id: 'mi3', foodName: 'Banana', grams: 120, calories: 107, protein: 1.3, carbs: 27.4, fat: 0.4 },
      ]},
      { id: 'm2', name: 'Mid-Morning Snack', items: [
        { id: 'mi4', foodName: 'Greek Yogurt', grams: 200, calories: 118, protein: 20.0, carbs: 7.4, fat: 0.7 },
        { id: 'mi5', foodName: 'Mixed Nuts', grams: 40, calories: 240, protein: 6.0, carbs: 8.0, fat: 20.0 },
      ]},
      { id: 'm3', name: 'Lunch', items: [
        { id: 'mi6', foodName: 'Chicken Breast', grams: 200, calories: 330, protein: 62.0, carbs: 0, fat: 7.2 },
        { id: 'mi7', foodName: 'Brown Rice', grams: 150, calories: 165, protein: 3.8, carbs: 34.5, fat: 1.3 },
        { id: 'mi8', foodName: 'Broccoli', grams: 150, calories: 51, protein: 4.2, carbs: 10.0, fat: 0.5 },
      ]},
      { id: 'm4', name: 'Post-Workout', items: [
        { id: 'mi9', foodName: 'Whey Protein', grams: 40, calories: 160, protein: 32.0, carbs: 4.0, fat: 2.0 },
        { id: 'mi10', foodName: 'Sweet Potato', grams: 200, calories: 172, protein: 3.2, carbs: 40.2, fat: 0.2 },
      ]},
      { id: 'm5', name: 'Dinner', items: [
        { id: 'mi11', foodName: 'Salmon', grams: 200, calories: 412, protein: 40.0, carbs: 0, fat: 28.0 },
        { id: 'mi12', foodName: 'Quinoa', grams: 100, calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
        { id: 'mi13', foodName: 'Mixed Vegetables', grams: 200, calories: 80, protein: 3.4, carbs: 16.0, fat: 0.4 },
      ]},
    ],
  },
  {
    id: 'dp2', slug: 'fat-loss-1800', title: 'Fat Loss — 1800 kcal', description: 'A calorie-controlled meal plan designed for fat loss while preserving muscle mass. High protein intake with moderate healthy fats and controlled carbohydrates.', totalCalories: 1800, requiredTier: 'ECONOMY',
    meals: [
      { id: 'm6', name: 'Breakfast', items: [
        { id: 'mi14', foodName: 'Egg Whites', grams: 200, calories: 104, protein: 22.0, carbs: 1.4, fat: 0.4 },
        { id: 'mi15', foodName: 'Whole Wheat Toast', grams: 60, calories: 155, protein: 5.2, carbs: 28.0, fat: 2.8 },
        { id: 'mi16', foodName: 'Avocado', grams: 50, calories: 80, protein: 1.0, carbs: 4.3, fat: 7.3 },
      ]},
      { id: 'm7', name: 'Lunch', items: [
        { id: 'mi17', foodName: 'Chicken Breast', grams: 180, calories: 297, protein: 55.8, carbs: 0, fat: 6.5 },
        { id: 'mi18', foodName: 'Mixed Salad', grams: 200, calories: 40, protein: 2.0, carbs: 8.0, fat: 0.4 },
        { id: 'mi19', foodName: 'Olive Oil Dressing', grams: 15, calories: 120, protein: 0, carbs: 0, fat: 14.0 },
      ]},
      { id: 'm8', name: 'Afternoon Snack', items: [
        { id: 'mi20', foodName: 'Whey Protein', grams: 30, calories: 120, protein: 24.0, carbs: 3.0, fat: 1.5 },
        { id: 'mi21', foodName: 'Apple', grams: 150, calories: 78, protein: 0.5, carbs: 20.7, fat: 0.2 },
      ]},
      { id: 'm9', name: 'Dinner', items: [
        { id: 'mi22', foodName: 'White Fish (Tilapia)', grams: 200, calories: 192, protein: 41.2, carbs: 0, fat: 2.2 },
        { id: 'mi23', foodName: 'Sweet Potato', grams: 150, calories: 129, protein: 2.4, carbs: 30.2, fat: 0.1 },
        { id: 'mi24', foodName: 'Steamed Vegetables', grams: 200, calories: 70, protein: 3.0, carbs: 14.0, fat: 0.4 },
      ]},
    ],
  },
  {
    id: 'dp3', slug: 'maintenance-2500', title: 'Maintenance — 2500 kcal', description: 'A balanced maintenance plan for lifters who want to hold body weight while supporting training recovery. Even protein distribution and flexible whole-food choices.', totalCalories: 2500, requiredTier: 'FREE',
    meals: [
      { id: 'm10', name: 'Breakfast', items: [
        { id: 'mi25', foodName: 'Greek Yogurt', grams: 250, calories: 148, protein: 25.0, carbs: 9.3, fat: 0.9 },
        { id: 'mi26', foodName: 'Granola', grams: 60, calories: 270, protein: 6.0, carbs: 42.0, fat: 9.0 },
        { id: 'mi27', foodName: 'Blueberries', grams: 100, calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
      ]},
      { id: 'm11', name: 'Lunch', items: [
        { id: 'mi28', foodName: 'Turkey Breast', grams: 180, calories: 250, protein: 50.0, carbs: 0, fat: 4.0 },
        { id: 'mi29', foodName: 'White Rice', grams: 180, calories: 234, protein: 4.3, carbs: 52.0, fat: 0.4 },
        { id: 'mi30', foodName: 'Green Beans', grams: 150, calories: 47, protein: 2.7, carbs: 10.5, fat: 0.2 },
      ]},
      { id: 'm12', name: 'Snack', items: [
        { id: 'mi31', foodName: 'Cottage Cheese', grams: 200, calories: 196, protein: 22.0, carbs: 8.0, fat: 8.0 },
        { id: 'mi32', foodName: 'Almonds', grams: 30, calories: 174, protein: 6.0, carbs: 6.0, fat: 15.0 },
      ]},
      { id: 'm13', name: 'Dinner', items: [
        { id: 'mi33', foodName: 'Lean Beef', grams: 180, calories: 360, protein: 46.0, carbs: 0, fat: 18.0 },
        { id: 'mi34', foodName: 'Roasted Potatoes', grams: 200, calories: 186, protein: 4.0, carbs: 42.0, fat: 0.2 },
        { id: 'mi35', foodName: 'Asparagus', grams: 150, calories: 40, protein: 4.2, carbs: 7.5, fat: 0.2 },
      ]},
    ],
  },
  {
    id: 'dp4', slug: 'high-protein-cut-2200', title: 'High Protein Cut — 2200 kcal', description: 'A higher-protein fat-loss plan for trained athletes who need more food than a standard cut while staying in a moderate deficit. Emphasizes lean protein and high-fiber carbs.', totalCalories: 2200, requiredTier: 'VIP',
    meals: [
      { id: 'm14', name: 'Breakfast', items: [
        { id: 'mi36', foodName: 'Egg Whites', grams: 250, calories: 130, protein: 27.5, carbs: 1.8, fat: 0.5 },
        { id: 'mi37', foodName: 'Whole Eggs', grams: 100, calories: 155, protein: 13.0, carbs: 0.7, fat: 10.5 },
        { id: 'mi38', foodName: 'Oatmeal', grams: 80, calories: 311, protein: 13.5, carbs: 53.0, fat: 5.5 },
      ]},
      { id: 'm15', name: 'Lunch', items: [
        { id: 'mi39', foodName: 'Chicken Breast', grams: 220, calories: 363, protein: 68.2, carbs: 0, fat: 7.9 },
        { id: 'mi40', foodName: 'Quinoa', grams: 120, calories: 144, protein: 5.3, carbs: 25.6, fat: 2.3 },
        { id: 'mi41', foodName: 'Spinach Salad', grams: 150, calories: 35, protein: 4.3, carbs: 5.4, fat: 0.6 },
      ]},
      { id: 'm16', name: 'Pre-Workout Snack', items: [
        { id: 'mi42', foodName: 'Rice Cakes', grams: 40, calories: 154, protein: 3.2, carbs: 33.0, fat: 0.8 },
        { id: 'mi43', foodName: 'Peanut Butter', grams: 20, calories: 118, protein: 5.0, carbs: 4.0, fat: 10.0 },
      ]},
      { id: 'm17', name: 'Dinner', items: [
        { id: 'mi44', foodName: 'Salmon', grams: 180, calories: 371, protein: 36.0, carbs: 0, fat: 25.2 },
        { id: 'mi45', foodName: 'Sweet Potato', grams: 180, calories: 155, protein: 2.9, carbs: 36.2, fat: 0.2 },
        { id: 'mi46', foodName: 'Broccoli', grams: 150, calories: 51, protein: 4.2, carbs: 10.0, fat: 0.5 },
      ]},
    ],
  },
];
