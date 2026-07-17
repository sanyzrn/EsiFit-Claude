/** Pure calculator formulas — unit-tested */

export type CalcInputs = Record<string, number>;
export type CalcResult = {
  value: number;
  unit: string;
  band: string;
  interpretation: string;
  secondary?: Record<string, number>;
  series?: { x: number; y: number }[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function calcBMI(inputs: CalcInputs): CalcResult {
  const { weightKg = 70, heightCm = 170 } = inputs;
  const m = heightCm / 100;
  const value = weightKg / (m * m);
  let band = "Healthy";
  let interpretation = "Within the commonly used healthy BMI range.";
  if (value < 18.5) {
    band = "Underweight";
    interpretation = "Below the common healthy range — fueling and strength work may help.";
  } else if (value < 25) {
    band = "Healthy";
  } else if (value < 30) {
    band = "Overweight";
    interpretation = "Above the common healthy range — sustainable habits beat extremes.";
  } else {
    band = "Obese";
    interpretation = "Consider gradual changes with professional guidance if needed.";
  }
  return { value: round(value, 1), unit: "BMI", band, interpretation };
}

export function calcBMR(inputs: CalcInputs): CalcResult {
  const { weightKg = 70, heightCm = 170, age = 30, sex = 1 } = inputs; // sex: 1 male, 0 female
  // Mifflin-St Jeor
  const value = sex >= 0.5 ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5 : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return {
    value: Math.round(value),
    unit: "kcal/day",
    band: "Basal",
    interpretation: "Estimated calories to maintain basic bodily functions at rest.",
  };
}

export function calcTDEE(inputs: CalcInputs): CalcResult {
  const bmr = calcBMR(inputs).value;
  const { activity = 1.55 } = inputs;
  const value = Math.round(bmr * activity);
  let band = "Moderately active";
  if (activity < 1.3) band = "Sedentary";
  else if (activity < 1.5) band = "Lightly active";
  else if (activity < 1.7) band = "Moderately active";
  else if (activity < 1.9) band = "Very active";
  else band = "Extra active";
  return {
    value,
    unit: "kcal/day",
    band,
    interpretation: `Estimated maintenance calories for a ${band.toLowerCase()} lifestyle.`,
    secondary: { bmr },
  };
}

export function calcBodyFat(inputs: CalcInputs): CalcResult {
  // US Navy-ish simplified using BMI + sex + age as a mock estimate when circumferences aren't available
  const bmi = calcBMI(inputs).value;
  const { age = 30, sex = 1 } = inputs;
  const value = sex >= 0.5 ? 1.2 * bmi + 0.23 * age - 16.2 : 1.2 * bmi + 0.23 * age - 5.4;
  const v = clamp(value, 3, 50);
  let band = "Fitness";
  if (sex >= 0.5) {
    if (v < 6) band = "Essential";
    else if (v < 14) band = "Athletic";
    else if (v < 18) band = "Fitness";
    else if (v < 25) band = "Average";
    else band = "Higher";
  } else if (v < 14) band = "Essential";
  else if (v < 21) band = "Athletic";
  else if (v < 25) band = "Fitness";
  else if (v < 32) band = "Average";
  else band = "Higher";
  return {
    value: round(v, 1),
    unit: "%",
    band,
    interpretation: `Estimated body-fat category: ${band}. Circumference methods are more precise when available.`,
  };
}

export function calcLeanMass(inputs: CalcInputs): CalcResult {
  const { weightKg = 70 } = inputs;
  const bf = calcBodyFat(inputs).value;
  const value = weightKg * (1 - bf / 100);
  return {
    value: round(value, 1),
    unit: "kg",
    band: "Lean mass",
    interpretation: "Estimated fat-free mass based on body-fat estimate.",
    secondary: { fatMassKg: round(weightKg - value, 1) },
  };
}

export function calcFFMI(inputs: CalcInputs): CalcResult {
  const lean = calcLeanMass(inputs).value;
  const { heightCm = 170 } = inputs;
  const m = heightCm / 100;
  const value = lean / (m * m);
  let band = "Average";
  if (value < 18) band = "Below average";
  else if (value < 20) band = "Average";
  else if (value < 22) band = "Athletic";
  else if (value < 25) band = "Excellent";
  else band = "Exceptional";
  return {
    value: round(value, 1),
    unit: "FFMI",
    band,
    interpretation: `Fat-free mass index suggests a ${band.toLowerCase()} muscularity level for height.`,
  };
}

export function calcMacros(inputs: CalcInputs): CalcResult {
  const tdee = calcTDEE(inputs).value;
  const { goal = 0 } = inputs; // -0.2 cut, 0 maintain, 0.15 bulk
  const calories = Math.round(tdee * (1 + goal));
  const { weightKg = 70 } = inputs;
  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return {
    value: calories,
    unit: "kcal/day",
    band: goal < 0 ? "Cut" : goal > 0 ? "Build" : "Maintain",
    interpretation: "Macros prioritize protein, then fill remaining calories with carbs and fats.",
    secondary: { protein_g: protein, carbs_g: carbs, fat_g: fat },
  };
}

export function calcWater(inputs: CalcInputs): CalcResult {
  const { weightKg = 70, activityBonus = 0 } = inputs;
  const value = Math.round(weightKg * 35 + activityBonus);
  return {
    value,
    unit: "ml/day",
    band: "Hydration target",
    interpretation: "A practical starting target — increase in heat or long sessions.",
  };
}

export function calcProtein(inputs: CalcInputs): CalcResult {
  const { weightKg = 70, training = 1 } = inputs; // 0 sedentary … 2 intense
  const gPerKg = training < 0.5 ? 1.2 : training < 1.5 ? 1.6 : 2.0;
  const value = Math.round(weightKg * gPerKg);
  return {
    value,
    unit: "g/day",
    band: `${gPerKg} g/kg`,
    interpretation: "Protein target scaled to bodyweight and training demand.",
  };
}

export function calcDeficit(inputs: CalcInputs): CalcResult {
  const tdee = calcTDEE(inputs).value;
  const { deficit = 500, weeks = 8 } = inputs;
  const daily = Math.max(1200, tdee - deficit);
  const kgPerWeek = (deficit * 7) / 7700;
  const series = Array.from({ length: Math.round(weeks) + 1 }, (_, w) => ({
    x: w,
    y: round((inputs.weightKg ?? 70) - kgPerWeek * w, 2),
  }));
  return {
    value: daily,
    unit: "kcal/day",
    band: `${round(kgPerWeek, 2)} kg/week`,
    interpretation: "Projected weight change assumes consistent adherence; real progress varies.",
    secondary: { weeklyLossKg: round(kgPerWeek, 2), tdee },
    series,
  };
}

export function calcWeightGoal(inputs: CalcInputs): CalcResult {
  const { weightKg = 70, targetKg = 65, weeklyRate = 0.5 } = inputs;
  const delta = weightKg - targetKg;
  const weeks = Math.abs(delta) / Math.max(0.1, weeklyRate);
  const series = Array.from({ length: Math.min(52, Math.ceil(weeks) + 1) }, (_, w) => ({
    x: w,
    y: round(weightKg - Math.sign(delta) * weeklyRate * w, 2),
  }));
  return {
    value: round(weeks, 1),
    unit: "weeks",
    band: delta > 0 ? "Fat loss path" : "Gain path",
    interpretation: `At ~${weeklyRate} kg/week, the target is about ${round(weeks, 1)} weeks away.`,
    series,
  };
}

export function calcOneRepMax(inputs: CalcInputs): CalcResult {
  const { weight = 60, reps = 5 } = inputs;
  // Epley
  const value = weight * (1 + reps / 30);
  return {
    value: round(value, 1),
    unit: "kg",
    band: "Estimated 1RM",
    interpretation: "Epley estimate — treat as a guide, not a prescription for a max attempt.",
    secondary: {
      "90%": round(value * 0.9, 1),
      "80%": round(value * 0.8, 1),
      "70%": round(value * 0.7, 1),
    },
  };
}

export function calcHeartRateZones(inputs: CalcInputs): CalcResult {
  const { age = 30, resting = 60 } = inputs;
  const max = 220 - age;
  const reserve = max - resting;
  const zones = {
    z1: Math.round(resting + reserve * 0.5),
    z2: Math.round(resting + reserve * 0.6),
    z3: Math.round(resting + reserve * 0.7),
    z4: Math.round(resting + reserve * 0.8),
    z5: Math.round(resting + reserve * 0.9),
  };
  return {
    value: max,
    unit: "bpm max",
    band: "Karvonen zones",
    interpretation: "Zones use heart-rate reserve for more personalized intensity bands.",
    secondary: zones,
  };
}

export function calcIdealWeight(inputs: CalcInputs): CalcResult {
  const { heightCm = 170, sex = 1 } = inputs;
  // Devine formula
  const inches = heightCm / 2.54;
  const value = sex >= 0.5 ? 50 + 2.3 * (inches - 60) : 45.5 + 2.3 * (inches - 60);
  return {
    value: round(value, 1),
    unit: "kg",
    band: "Formula estimate",
    interpretation: "Population formulas are rough guides — health markers matter more than a single number.",
  };
}

export function calcPace(inputs: CalcInputs): CalcResult {
  const { distanceKm = 5, minutes = 28 } = inputs;
  const paceMin = minutes / distanceKm;
  const min = Math.floor(paceMin);
  const sec = Math.round((paceMin - min) * 60);
  const value = paceMin;
  return {
    value: round(value, 2),
    unit: "min/km",
    band: `${min}:${sec.toString().padStart(2, "0")} /km`,
    interpretation: `Average pace for ${distanceKm} km in ${minutes} minutes.`,
    secondary: { speedKmh: round(60 / paceMin, 2) },
  };
}

export function calcEnergyExpenditure(inputs: CalcInputs): CalcResult {
  const { met = 6, weightKg = 70, minutes = 45 } = inputs;
  const value = Math.round(((met * 3.5 * weightKg) / 200) * minutes);
  return {
    value,
    unit: "kcal",
    band: `MET ${met}`,
    interpretation: "Estimated session expenditure from MET × bodyweight × duration.",
  };
}

function round(n: number, d: number) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export const CALCULATOR_FNS = {
  bmi: calcBMI,
  bmr: calcBMR,
  tdee: calcTDEE,
  "body-fat": calcBodyFat,
  "lean-mass": calcLeanMass,
  ffmi: calcFFMI,
  macros: calcMacros,
  water: calcWater,
  protein: calcProtein,
  deficit: calcDeficit,
  "weight-goal": calcWeightGoal,
  "one-rep-max": calcOneRepMax,
  "hr-zones": calcHeartRateZones,
  "ideal-weight": calcIdealWeight,
  pace: calcPace,
  "energy-expenditure": calcEnergyExpenditure,
} as const;

export type CalculatorId = keyof typeof CALCULATOR_FNS;
