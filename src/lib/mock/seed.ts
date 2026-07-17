import { EXERCISES, FOODS } from "@/lib/mock/catalog";
import { dateOnly, daysAgoISO, mulberry32, SEED } from "@/lib/mock/seed-utils";
import type { MuscleGroup } from "@/components/anatomy/anatomy-body-map";

export interface SeedDataset {
  generatedAt: string;
  seed: number;
  days: number;
  weight: { date: string; kg: number }[];
  sleep: { date: string; hours: number; quality: number }[];
  water: { date: string; ml: number }[];
  bodyFat: { date: string; percent: number }[];
  workouts: {
    id: string;
    date: string;
    name: string;
    durationMin: number;
    volumeKg: number;
    exerciseIds: string[];
    sets: { exerciseId: string; weight: number; reps: number; isPr: boolean }[];
  }[];
  nutritionDays: {
    date: string;
    meals: {
      slot: "breakfast" | "lunch" | "dinner" | "snack";
      foodId: string;
      servings: number;
    }[];
  }[];
  xpLogs: { date: string; amount: number; source: string }[];
  muscleVolume: Partial<Record<MuscleGroup, number>>;
  weeklyActivity: number[];
}

export function generateSeedDataset(days = 45): SeedDataset {
  const rand = mulberry32(SEED);
  let weight = 78.4;
  let bf = 19.2;
  const weightSeries: SeedDataset["weight"] = [];
  const sleepSeries: SeedDataset["sleep"] = [];
  const waterSeries: SeedDataset["water"] = [];
  const bfSeries: SeedDataset["bodyFat"] = [];
  const workouts: SeedDataset["workouts"] = [];
  const nutritionDays: SeedDataset["nutritionDays"] = [];
  const xpLogs: SeedDataset["xpLogs"] = [];
  const muscleVolume: Partial<Record<MuscleGroup, number>> = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = dateOnly(i);
    weight += (rand() - 0.52) * 0.28;
    bf += (rand() - 0.51) * 0.08;
    weightSeries.push({ date, kg: Math.round(weight * 10) / 10 });
    bfSeries.push({ date, percent: Math.round(bf * 10) / 10 });
    sleepSeries.push({
      date,
      hours: Math.round((6.1 + rand() * 2.6) * 10) / 10,
      quality: 2 + Math.floor(rand() * 4),
    });
    waterSeries.push({ date, ml: 1400 + Math.floor(rand() * 1600) });

    // ~4 workouts / week
    if (rand() > 0.42) {
      const pick = EXERCISES[Math.floor(rand() * EXERCISES.length)]!;
      const pick2 = EXERCISES[Math.floor(rand() * EXERCISES.length)]!;
      const sets = Array.from({ length: 3 + Math.floor(rand() * 2) }, (_, s) => {
        const w = Math.round(40 + rand() * 80);
        const reps = 5 + Math.floor(rand() * 7);
        return {
          exerciseId: s % 2 === 0 ? pick.id : pick2.id,
          weight: w,
          reps,
          isPr: rand() > 0.92,
        };
      });
      const volume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
      workouts.push({
        id: `w_${date}_${workouts.length}`,
        date,
        name: rand() > 0.5 ? "Upper Focus" : "Lower Focus",
        durationMin: 35 + Math.floor(rand() * 40),
        volumeKg: volume,
        exerciseIds: [...new Set(sets.map((s) => s.exerciseId))],
        sets,
      });
      xpLogs.push({ date, amount: 40 + Math.floor(rand() * 60), source: "workout" });

      for (const exId of [...new Set(sets.map((s) => s.exerciseId))]) {
        const ex = EXERCISES.find((e) => e.id === exId);
        if (!ex) continue;
        for (const m of ex.muscles) {
          muscleVolume[m] = (muscleVolume[m] ?? 0) + volume / ex.muscles.length;
        }
      }
    }

    const meals: SeedDataset["nutritionDays"][number]["meals"] = [
      { slot: "breakfast", foodId: "f_oats", servings: 0.6 + rand() * 0.3 },
      { slot: "breakfast", foodId: "f_yogurt", servings: 1.5 },
      { slot: "lunch", foodId: "f_chicken", servings: 1.5 + rand() },
      { slot: "lunch", foodId: "f_rice", servings: 1.5 },
      { slot: "dinner", foodId: "f_salmon", servings: 1 + rand() * 0.5 },
      { slot: "dinner", foodId: "f_broccoli", servings: 2 },
      { slot: "snack", foodId: rand() > 0.5 ? "f_whey" : "f_almonds", servings: 1 },
    ];
    nutritionDays.push({ date, meals });
  }

  // Normalize muscle volume 0–1
  const maxVol = Math.max(...Object.values(muscleVolume), 1);
  for (const k of Object.keys(muscleVolume) as MuscleGroup[]) {
    muscleVolume[k] = Math.round(((muscleVolume[k] ?? 0) / maxVol) * 100) / 100;
  }

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const day = dateOnly(6 - i);
    const w = workouts.filter((x) => x.date === day);
    return Math.min(100, w.reduce((a, b) => a + b.durationMin, 0));
  });

  return {
    generatedAt: new Date().toISOString(),
    seed: SEED,
    days,
    weight: weightSeries,
    sleep: sleepSeries,
    water: waterSeries,
    bodyFat: bfSeries,
    workouts,
    nutritionDays,
    xpLogs,
    muscleVolume,
    weeklyActivity,
  };
}

/** Cached singleton for client/runtime use */
let cached: SeedDataset | null = null;
export function getSeedDataset() {
  if (!cached) cached = generateSeedDataset(45);
  return cached;
}

export function foodMacros(foodId: string, servings: number) {
  const f = FOODS.find((x) => x.id === foodId);
  if (!f) return { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 };
  return {
    protein_g: Math.round(f.protein_g * servings * 10) / 10,
    carbs_g: Math.round(f.carbs_g * servings * 10) / 10,
    fat_g: Math.round(f.fat_g * servings * 10) / 10,
    calories: Math.round(f.calories * servings),
  };
}

export { EXERCISES, FOODS, daysAgoISO };
