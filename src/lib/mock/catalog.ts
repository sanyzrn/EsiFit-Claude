import type { MuscleGroup } from "@/components/anatomy/anatomy-body-map";

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  difficulty: ExerciseDifficulty;
  muscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  instructions: string[];
  mistakes: string[];
  mediaPlaceholder: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "ex_bench",
    name: "Barbell Bench Press",
    equipment: "barbell",
    difficulty: "intermediate",
    muscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
    instructions: ["Lie on bench, eyes under bar", "Unrack with locked elbows", "Lower to mid-chest", "Press up without bouncing"],
    mistakes: ["Flaring elbows excessively", "Bouncing off chest", "Uneven lockout"],
    mediaPlaceholder: "bench-press",
  },
  {
    id: "ex_squat",
    name: "Back Squat",
    equipment: "barbell",
    difficulty: "intermediate",
    muscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "lower-back"],
    instructions: ["Bar on upper traps", "Brace, sit between heels", "Drive up through midfoot"],
    mistakes: ["Knees collapsing inward", "Losing brace", "Heels rising"],
    mediaPlaceholder: "squat",
  },
  {
    id: "ex_deadlift",
    name: "Conventional Deadlift",
    equipment: "barbell",
    difficulty: "advanced",
    muscles: ["hamstrings", "glutes", "lower-back"],
    secondaryMuscles: ["traps", "forearms"],
    instructions: ["Bar over midfoot", "Hinge, shins to bar", "Push floor away, lock hips"],
    mistakes: ["Rounding lumbar", "Yank from floor", "Hips shooting up"],
    mediaPlaceholder: "deadlift",
  },
  {
    id: "ex_ohp",
    name: "Overhead Press",
    equipment: "barbell",
    difficulty: "intermediate",
    muscles: ["shoulders"],
    secondaryMuscles: ["triceps", "traps"],
    instructions: ["Bar at collarbone", "Brace glutes", "Press overhead, finish by ears"],
    mistakes: ["Excessive lean", "Flaring ribs", "Pressing forward"],
    mediaPlaceholder: "ohp",
  },
  {
    id: "ex_row",
    name: "Barbell Row",
    equipment: "barbell",
    difficulty: "intermediate",
    muscles: ["lats", "traps"],
    secondaryMuscles: ["biceps", "lower-back"],
    instructions: ["Hinge to ~45°", "Pull to lower ribs", "Control the eccentric"],
    mistakes: ["Using momentum", "Shrugging only", "Rounding upper back"],
    mediaPlaceholder: "row",
  },
  {
    id: "ex_pullup",
    name: "Pull-Up",
    equipment: "bodyweight",
    difficulty: "intermediate",
    muscles: ["lats"],
    secondaryMuscles: ["biceps", "forearms"],
    instructions: ["Hang with full stretch", "Pull chest toward bar", "Lower with control"],
    mistakes: ["Half reps", "Kipping when aiming strict", "Shrugging into ears"],
    mediaPlaceholder: "pullup",
  },
  {
    id: "ex_rdl",
    name: "Romanian Deadlift",
    equipment: "barbell",
    difficulty: "intermediate",
    muscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower-back"],
    instructions: ["Soft knees", "Hinge until hamstring stretch", "Drive hips forward"],
    mistakes: ["Squatting the hinge", "Rounding back", "Bar drifting forward"],
    mediaPlaceholder: "rdl",
  },
  {
    id: "ex_lunges",
    name: "Walking Lunges",
    equipment: "dumbbell",
    difficulty: "beginner",
    muscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "calves"],
    instructions: ["Step long enough for 90° front knee", "Keep torso tall", "Push through front heel"],
    mistakes: ["Knee past toes aggressively", "Narrow base", "Rushing steps"],
    mediaPlaceholder: "lunges",
  },
  {
    id: "ex_curl",
    name: "Dumbbell Curl",
    equipment: "dumbbell",
    difficulty: "beginner",
    muscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    instructions: ["Elbows pinned", "Curl without swinging", "Squeeze at top"],
    mistakes: ["Using hips", "Incomplete ROM", "Elbows drifting forward"],
    mediaPlaceholder: "curl",
  },
  {
    id: "ex_triceps",
    name: "Cable Pushdown",
    equipment: "cable",
    difficulty: "beginner",
    muscles: ["triceps"],
    instructions: ["Elbows tight to sides", "Extend fully", "Control return"],
    mistakes: ["Elbows flaring", "Leaning into press", "Partial lockout"],
    mediaPlaceholder: "pushdown",
  },
  {
    id: "ex_plank",
    name: "Front Plank",
    equipment: "bodyweight",
    difficulty: "beginner",
    muscles: ["abs"],
    secondaryMuscles: ["obliques", "shoulders"],
    instructions: ["Elbows under shoulders", "Ribs down, glutes on", "Breathe steadily"],
    mistakes: ["Hips sagging", "Holding breath", "Shrugging shoulders"],
    mediaPlaceholder: "plank",
  },
  {
    id: "ex_calf",
    name: "Standing Calf Raise",
    equipment: "machine",
    difficulty: "beginner",
    muscles: ["calves"],
    instructions: ["Full stretch at bottom", "Rise onto big toe", "Pause briefly"],
    mistakes: ["Bouncing", "Knees locking hard", "Partial ROM"],
    mediaPlaceholder: "calf",
  },
];

export interface FoodItem {
  id: string;
  name: string;
  category: "produce" | "protein" | "dairy" | "grains" | "pantry" | "other";
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number;
  servingLabel: string;
}

export const FOODS: FoodItem[] = [
  { id: "f_chicken", name: "Chicken breast", category: "protein", protein_g: 31, carbs_g: 0, fat_g: 3.6, calories: 165, servingLabel: "100g" },
  { id: "f_rice", name: "Cooked rice", category: "grains", protein_g: 2.7, carbs_g: 28, fat_g: 0.3, calories: 130, servingLabel: "100g" },
  { id: "f_oats", name: "Oats", category: "grains", protein_g: 13, carbs_g: 67, fat_g: 7, calories: 389, servingLabel: "100g dry" },
  { id: "f_egg", name: "Egg", category: "protein", protein_g: 6.3, carbs_g: 0.4, fat_g: 5, calories: 72, servingLabel: "1 large" },
  { id: "f_banana", name: "Banana", category: "produce", protein_g: 1.1, carbs_g: 23, fat_g: 0.3, calories: 89, servingLabel: "1 medium" },
  { id: "f_yogurt", name: "Greek yogurt", category: "dairy", protein_g: 10, carbs_g: 3.6, fat_g: 0.4, calories: 59, servingLabel: "100g" },
  { id: "f_salmon", name: "Salmon", category: "protein", protein_g: 20, carbs_g: 0, fat_g: 13, calories: 208, servingLabel: "100g" },
  { id: "f_broccoli", name: "Broccoli", category: "produce", protein_g: 2.8, carbs_g: 7, fat_g: 0.4, calories: 34, servingLabel: "100g" },
  { id: "f_almonds", name: "Almonds", category: "pantry", protein_g: 6, carbs_g: 6, fat_g: 14, calories: 164, servingLabel: "28g" },
  { id: "f_bread", name: "Sourdough slice", category: "grains", protein_g: 4, carbs_g: 20, fat_g: 1, calories: 110, servingLabel: "1 slice" },
  { id: "f_whey", name: "Whey shake", category: "protein", protein_g: 24, carbs_g: 3, fat_g: 1.5, calories: 120, servingLabel: "1 scoop" },
  { id: "f_avocado", name: "Avocado", category: "produce", protein_g: 2, carbs_g: 9, fat_g: 15, calories: 160, servingLabel: "1/2 fruit" },
];
