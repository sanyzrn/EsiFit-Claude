import type { CalculatorId, CalcInputs, CalcResult } from "@/lib/calculators/formulas";
import { CALCULATOR_FNS } from "@/lib/calculators/formulas";

export type FieldType = "slider" | "toggle";

export interface CalculatorField {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  /** For sex: 0 female, 1 male */
  marks?: { value: number; label: string }[];
}

export interface CalculatorConfig {
  id: CalculatorId;
  slug: string;
  name: string;
  description: string;
  category: "body" | "nutrition" | "performance";
  fields: CalculatorField[];
  compute: (inputs: CalcInputs) => CalcResult;
  gaugeMax: number;
  showSeries?: boolean;
}

export const CALCULATOR_CONFIGS: CalculatorConfig[] = [
  {
    id: "bmi",
    slug: "bmi",
    name: "BMI",
    description: "Body mass index from height and weight.",
    category: "body",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
    ],
    compute: CALCULATOR_FNS.bmi,
    gaugeMax: 40,
  },
  {
    id: "bmr",
    slug: "bmr",
    name: "BMR",
    description: "Basal metabolic rate (Mifflin-St Jeor).",
    category: "body",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    compute: CALCULATOR_FNS.bmr,
    gaugeMax: 2500,
  },
  {
    id: "tdee",
    slug: "tdee",
    name: "TDEE",
    description: "Total daily energy expenditure from BMR × activity.",
    category: "nutrition",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
      { key: "activity", label: "Activity multiplier", min: 1.2, max: 1.9, step: 0.05, defaultValue: 1.55 },
    ],
    compute: CALCULATOR_FNS.tdee,
    gaugeMax: 4000,
  },
  {
    id: "body-fat",
    slug: "body-fat",
    name: "Body Fat %",
    description: "Estimated body-fat percentage.",
    category: "body",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    compute: CALCULATOR_FNS["body-fat"],
    gaugeMax: 45,
  },
  {
    id: "lean-mass",
    slug: "lean-mass",
    name: "Lean Mass",
    description: "Estimated fat-free mass.",
    category: "body",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    compute: CALCULATOR_FNS["lean-mass"],
    gaugeMax: 100,
  },
  {
    id: "ffmi",
    slug: "ffmi",
    name: "FFMI",
    description: "Fat-free mass index.",
    category: "body",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    compute: CALCULATOR_FNS.ffmi,
    gaugeMax: 30,
  },
  {
    id: "macros",
    slug: "macros",
    name: "Macro Calculator",
    description: "Calories and macros for cut / maintain / build.",
    category: "nutrition",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
      { key: "activity", label: "Activity", min: 1.2, max: 1.9, step: 0.05, defaultValue: 1.55 },
      { key: "goal", label: "Goal (−cut / +build)", min: -0.25, max: 0.2, step: 0.05, defaultValue: 0 },
    ],
    compute: CALCULATOR_FNS.macros,
    gaugeMax: 4000,
  },
  {
    id: "water",
    slug: "water",
    name: "Water Calculator",
    description: "Daily hydration target.",
    category: "nutrition",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "activityBonus", label: "Activity bonus", min: 0, max: 1000, step: 50, defaultValue: 300, unit: "ml" },
    ],
    compute: CALCULATOR_FNS.water,
    gaugeMax: 5000,
  },
  {
    id: "protein",
    slug: "protein",
    name: "Protein Calculator",
    description: "Daily protein target by training load.",
    category: "nutrition",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "training", label: "Training demand", min: 0, max: 2, step: 0.1, defaultValue: 1 },
    ],
    compute: CALCULATOR_FNS.protein,
    gaugeMax: 250,
  },
  {
    id: "deficit",
    slug: "deficit",
    name: "Calorie Deficit Simulator",
    description: "Project weight change from a daily deficit.",
    category: "nutrition",
    fields: [
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
      { key: "activity", label: "Activity", min: 1.2, max: 1.9, step: 0.05, defaultValue: 1.55 },
      { key: "deficit", label: "Daily deficit", min: 200, max: 1000, step: 50, defaultValue: 500, unit: "kcal" },
      { key: "weeks", label: "Weeks", min: 2, max: 24, step: 1, defaultValue: 8 },
    ],
    compute: CALCULATOR_FNS.deficit,
    gaugeMax: 3000,
    showSeries: true,
  },
  {
    id: "weight-goal",
    slug: "weight-goal",
    name: "Weight Goal Simulator",
    description: "Estimate weeks to a target weight.",
    category: "body",
    fields: [
      { key: "weightKg", label: "Current weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "targetKg", label: "Target weight", min: 40, max: 160, step: 0.5, defaultValue: 65, unit: "kg" },
      { key: "weeklyRate", label: "Weekly rate", min: 0.2, max: 1, step: 0.05, defaultValue: 0.5, unit: "kg" },
    ],
    compute: CALCULATOR_FNS["weight-goal"],
    gaugeMax: 52,
    showSeries: true,
  },
  {
    id: "one-rep-max",
    slug: "one-rep-max",
    name: "One Rep Max",
    description: "Estimate 1RM from a submaximal set.",
    category: "performance",
    fields: [
      { key: "weight", label: "Weight lifted", min: 20, max: 250, step: 2.5, defaultValue: 60, unit: "kg" },
      { key: "reps", label: "Reps", min: 1, max: 12, step: 1, defaultValue: 5 },
    ],
    compute: CALCULATOR_FNS["one-rep-max"],
    gaugeMax: 300,
  },
  {
    id: "hr-zones",
    slug: "hr-zones",
    name: "Heart Rate Zones",
    description: "Karvonen training zones.",
    category: "performance",
    fields: [
      { key: "age", label: "Age", min: 16, max: 80, step: 1, defaultValue: 30, unit: "yrs" },
      { key: "resting", label: "Resting HR", min: 40, max: 100, step: 1, defaultValue: 60, unit: "bpm" },
    ],
    compute: CALCULATOR_FNS["hr-zones"],
    gaugeMax: 220,
  },
  {
    id: "ideal-weight",
    slug: "ideal-weight",
    name: "Ideal Weight",
    description: "Devine formula estimate.",
    category: "body",
    fields: [
      { key: "heightCm", label: "Height", min: 140, max: 210, step: 1, defaultValue: 170, unit: "cm" },
      { key: "sex", label: "Sex (0♀ 1♂)", min: 0, max: 1, step: 1, defaultValue: 1 },
    ],
    compute: CALCULATOR_FNS["ideal-weight"],
    gaugeMax: 120,
  },
  {
    id: "pace",
    slug: "pace",
    name: "Pace Calculator",
    description: "Average pace from distance and time.",
    category: "performance",
    fields: [
      { key: "distanceKm", label: "Distance", min: 1, max: 42, step: 0.1, defaultValue: 5, unit: "km" },
      { key: "minutes", label: "Time", min: 5, max: 360, step: 1, defaultValue: 28, unit: "min" },
    ],
    compute: CALCULATOR_FNS.pace,
    gaugeMax: 12,
  },
  {
    id: "energy-expenditure",
    slug: "energy-expenditure",
    name: "Energy Expenditure",
    description: "Session calories from MET × duration.",
    category: "performance",
    fields: [
      { key: "met", label: "MET", min: 2, max: 12, step: 0.5, defaultValue: 6 },
      { key: "weightKg", label: "Weight", min: 40, max: 160, step: 0.5, defaultValue: 70, unit: "kg" },
      { key: "minutes", label: "Duration", min: 10, max: 180, step: 5, defaultValue: 45, unit: "min" },
    ],
    compute: CALCULATOR_FNS["energy-expenditure"],
    gaugeMax: 1200,
  },
];

export function getCalculator(slug: string) {
  return CALCULATOR_CONFIGS.find((c) => c.slug === slug);
}
