// All calculator pure functions

export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export function calcBMI(weightKg: number, heightCm: number): Result<{ bmi: number; category: string }> {
  if (heightCm <= 0) {
    return { ok: false, error: 'Height must be greater than zero' };
  }
  if (weightKg <= 0) {
    return { ok: false, error: 'Weight must be greater than zero' };
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi)) {
    return { ok: false, error: 'Invalid BMI — check height and weight inputs' };
  }
  const category =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25 ? 'Normal weight' :
    bmi < 30 ? 'Overweight' :
    'Obese';
  return { ok: true, value: { bmi: Math.round(bmi * 10) / 10, category } };
}

export function calcBodyFat(
  gender: 'male' | 'female',
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm?: number
): Result<{ bodyFatPct: number; category: string }> {
  if (gender === 'male' && waistCm <= neckCm) {
    return { ok: false, error: 'Waist must be greater than neck circumference' };
  }
  
  let bf: number;
  if (gender === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    const hip = hipCm || 0;
    if (waistCm + hip <= neckCm) {
      return { ok: false, error: 'Waist + Hip must be greater than neck circumference' };
    }
    if (waistCm <= neckCm) {
       return { ok: false, error: 'Waist must be greater than neck circumference' };
    }
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hip - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
  }
  bf = Math.round(bf * 10) / 10;
  const category = gender === 'male'
    ? bf < 6 ? 'Essential fat'
      : bf < 14 ? 'Athletic'
      : bf < 18 ? 'Fitness'
      : bf < 25 ? 'Average'
      : 'Obese'
    : bf < 14 ? 'Essential fat'
      : bf < 21 ? 'Athletic'
      : bf < 25 ? 'Fitness'
      : bf < 32 ? 'Average'
      : 'Obese';
  return { ok: true, value: { bodyFatPct: bf, category } };
}

export function calcBMR(
  gender: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calcTDEE(bmr: number, activityLevel: keyof typeof ACTIVITY_FACTORS): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

export function calcMacros(
  weightKg: number,
  tdee: number,
  goal: 'muscle_gain' | 'fat_loss' | 'maintenance'
): Result<{ protein: number; fat: number; carbs: number; calories: number }> {
  const proteinMultiplier = goal === 'muscle_gain' ? 2.0 : goal === 'fat_loss' ? 2.2 : 1.8;
  const protein = Math.round(weightKg * proteinMultiplier);
  const fat = Math.round(weightKg * 0.9);
  const remainingKcal = tdee - (protein * 4 + fat * 9);
  const carbs = Math.max(0, Math.round(remainingKcal / 4));
  const calories = protein * 4 + fat * 9 + carbs * 4;
  
  if (remainingKcal < 0) {
    return { ok: false, error: 'TDEE is too low to support these minimum macro targets based on your weight. The calories do not reconcile.' };
  }
    
  return { ok: true, value: { protein, fat, carbs, calories } };
}

export function calcOneRepMax(
  weight: number,
  reps: number,
  formula: 'epley' | 'brzycki' = 'epley'
): Result<number> {
  if (weight <= 0) {
    return { ok: false, error: 'Weight must be greater than zero' };
  }
  if (reps <= 0) {
    return { ok: true, value: weight };
  }
  if (reps === 1) {
    return { ok: true, value: weight };
  }
  if (formula === 'brzycki' && reps >= 37) {
    return { ok: false, error: 'Brzycki formula requires fewer than 37 reps' };
  }
  let oneRM: number;
  if (formula === 'epley') {
    oneRM = weight * (1 + reps / 30);
  } else {
    oneRM = weight * 36 / (37 - reps);
  }
  if (!Number.isFinite(oneRM)) {
    return { ok: false, error: 'Could not estimate 1RM — check weight and reps' };
  }
  return { ok: true, value: Math.round(oneRM) };
}

export function getRepMaxTable(oneRM: number): { percentage: number; reps: number; weight: number }[] {
  const table = [
    { percentage: 100, reps: 1 },
    { percentage: 95, reps: 2 },
    { percentage: 90, reps: 4 },
    { percentage: 85, reps: 6 },
    { percentage: 80, reps: 8 },
    { percentage: 75, reps: 10 },
    { percentage: 70, reps: 12 },
    { percentage: 65, reps: 15 },
    { percentage: 60, reps: 20 },
  ];
  return table.map(r => ({ ...r, weight: Math.round(oneRM * r.percentage / 100 * 10) / 10 }));
}

export function calcFFMI(weightKg: number, heightCm: number, bodyFatPct: number): { ffmi: number; adjusted: number; category: string } {
  const heightM = heightCm / 100;
  const leanMass = weightKg * (1 - bodyFatPct / 100);
  const ffmi = leanMass / (heightM * heightM);
  const adjusted = ffmi + 6.1 * (1.8 - heightM);
  const category =
    adjusted < 18 ? 'Below average' :
    adjusted < 20 ? 'Average' :
    adjusted < 22 ? 'Above average' :
    adjusted < 23 ? 'Excellent' :
    adjusted < 26 ? 'Superior' :
    'Suspicious (may indicate steroid use)';
  return {
    ffmi: Math.round(ffmi * 10) / 10,
    adjusted: Math.round(adjusted * 10) / 10,
    category,
  };
}

export function calcWHR(waistCm: number, hipCm: number, gender: 'male' | 'female'): Result<{ whr: number; risk: string }> {
  if (hipCm <= 0) {
    return { ok: false, error: 'Hip circumference must be greater than zero' };
  }
  if (waistCm <= 0) {
    return { ok: false, error: 'Waist circumference must be greater than zero' };
  }
  const whr = Math.round((waistCm / hipCm) * 100) / 100;
  if (!Number.isFinite(whr)) {
    return { ok: false, error: 'Invalid WHR — check waist and hip inputs' };
  }
  const threshold = gender === 'male' ? 0.90 : 0.85;
  const risk = whr > threshold ? 'Elevated health risk' : 'Normal range';
  return { ok: true, value: { whr, risk } };
}

export function calcWaterIntake(weightKg: number): { liters: number } {
  return { liters: Math.round(weightKg * 0.033 * 10) / 10 };
}

export function calcGoalDate(
  currentWeight: number,
  goalWeight: number,
  weeklyCalorieDelta: number
): Result<{ weeks: number; estimatedDate: string; message?: string }> {
  if (currentWeight === goalWeight) {
    return { ok: true, value: { weeks: 0, estimatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), message: 'You have already reached your goal.' } };
  }
  if (weeklyCalorieDelta === 0) {
    return { ok: false, error: 'You must have a calorie deficit/surplus to change weight.' };
  }
  
  const kgDiff = Math.abs(currentWeight - goalWeight);
  // Note: 7700 kcal per kg of fat is an estimation.
  const weeks = Math.ceil((kgDiff * 7700) / Math.abs(weeklyCalorieDelta));
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return {
    ok: true,
    value: {
      weeks,
      estimatedDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      message: 'Note: 7700 kcal per kg of fat is a simplified estimate.',
    }
  };
}

export function calcVolumeLoad(logs: { sets: number; reps: number; weightKg: number }[]): number {
  return logs.reduce((sum, l) => sum + l.sets * l.reps * l.weightKg, 0);
}

export const MET_TABLE: Record<string, number> = {
  'Running (8 km/h)': 8.3,
  'Running (10 km/h)': 10.0,
  'Running (12 km/h)': 11.8,
  'Cycling (moderate)': 6.8,
  'Cycling (vigorous)': 10.0,
  'Swimming (moderate)': 5.8,
  'Swimming (vigorous)': 9.8,
  'Weight Training': 6.0,
  'Walking (5 km/h)': 3.5,
  'Walking (6.5 km/h)': 4.3,
  'Jump Rope': 11.0,
  'Rowing': 7.0,
  'Yoga': 3.0,
  'HIIT': 12.0,
  'Elliptical': 5.0,
  'Stair Climbing': 9.0,
};

export function calcCaloriesBurned(met: number, weightKg: number, durationMinutes: number): number {
  return Math.round(met * weightKg * (durationMinutes / 60));
}

export interface BodyTypeAnswer {
  question: string;
  options: { text: string; ecto: number; meso: number; endo: number }[];
}

export const BODY_TYPE_QUESTIONS: BodyTypeAnswer[] = [
  {
    question: 'What is your natural body build?',
    options: [
      { text: 'Thin, narrow shoulders and hips', ecto: 3, meso: 0, endo: 0 },
      { text: 'Medium build, broad shoulders', ecto: 0, meso: 3, endo: 0 },
      { text: 'Wider build, stores fat easily', ecto: 0, meso: 0, endo: 3 },
    ],
  },
  {
    question: 'How easily do you gain weight?',
    options: [
      { text: 'Very hard to gain weight', ecto: 3, meso: 0, endo: 0 },
      { text: 'Can gain/lose relatively easily', ecto: 0, meso: 3, endo: 0 },
      { text: 'Gain weight easily, hard to lose', ecto: 0, meso: 0, endo: 3 },
    ],
  },
  {
    question: 'What is your wrist circumference?',
    options: [
      { text: 'Small (under 16 cm)', ecto: 3, meso: 0, endo: 0 },
      { text: 'Medium (16–18 cm)', ecto: 0, meso: 3, endo: 0 },
      { text: 'Large (over 18 cm)', ecto: 0, meso: 0, endo: 3 },
    ],
  },
  {
    question: 'How would you describe your shoulders?',
    options: [
      { text: 'Narrower than my hips', ecto: 3, meso: 0, endo: 0 },
      { text: 'Same width or wider than hips', ecto: 0, meso: 3, endo: 0 },
      { text: 'Wide but rounded', ecto: 0, meso: 0, endo: 3 },
    ],
  },
  {
    question: 'What happens when you skip workouts for a week?',
    options: [
      { text: 'I lose muscle and weight quickly', ecto: 3, meso: 0, endo: 0 },
      { text: 'Not much changes', ecto: 0, meso: 3, endo: 0 },
      { text: 'I tend to gain fat', ecto: 0, meso: 0, endo: 3 },
    ],
  },
  {
    question: 'How is your metabolism?',
    options: [
      { text: 'Very fast — I can eat a lot without gaining', ecto: 3, meso: 0, endo: 0 },
      { text: 'Moderate — predictable', ecto: 0, meso: 3, endo: 0 },
      { text: 'Slow — everything seems to stick', ecto: 0, meso: 0, endo: 3 },
    ],
  },
];

export function calcBodyType(answers: number[]): { type: 'ectomorph' | 'mesomorph' | 'endomorph'; description: string } {
  let ecto = 0, meso = 0, endo = 0;
  answers.forEach((ansIdx, qIdx) => {
    if (BODY_TYPE_QUESTIONS[qIdx] && BODY_TYPE_QUESTIONS[qIdx].options[ansIdx]) {
      const opt = BODY_TYPE_QUESTIONS[qIdx].options[ansIdx];
      ecto += opt.ecto;
      meso += opt.meso;
      endo += opt.endo;
    }
  });
  if (ecto >= meso && ecto >= endo) return {
    type: 'ectomorph',
    description: 'You have an ectomorphic body type — naturally lean with a fast metabolism. You may find it harder to gain muscle mass. Focus on calorie-surplus diets, compound lifts, and progressive overload. Programs emphasizing hypertrophy (8-12 rep range) with adequate rest are ideal.',
  };
  if (meso >= ecto && meso >= endo) return {
    type: 'mesomorph',
    description: 'You have a mesomorphic body type — naturally muscular and athletic. You respond well to both strength and endurance training. You can gain muscle and lose fat relatively easily. A balanced program mixing strength training with moderate cardio works best.',
  };
  return {
    type: 'endomorph',
    description: 'You have an endomorphic body type — naturally broader with a tendency to store fat. Focus on a combination of resistance training and regular cardio. Diet control is especially important. High-protein diets with moderate carbs work well for your body type.',
  };
}
