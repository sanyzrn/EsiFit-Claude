import type {
  ActivityEvent,
  AppNotification,
  DashboardData,
  Goal,
  Milestone,
  NutritionDay,
  PrimaryGoal,
  SleepLog,
  User,
  WaterLog,
  WeightLog,
} from "@/lib/types";

/** Fixed seed PRNG for stable mock history */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function generateWeightHistory(userId: string, days = 30): WeightLog[] {
  let w = 78.4;
  return Array.from({ length: days }, (_, i) => {
    w += (rand() - 0.52) * 0.35;
    return {
      id: `wl_${i}`,
      user_id: userId,
      weight_kg: Math.round(w * 10) / 10,
      logged_at: daysAgo(days - 1 - i),
    };
  });
}

export function generateSleepHistory(userId: string, days = 30): SleepLog[] {
  return Array.from({ length: days }, (_, i) => ({
    id: `sl_${i}`,
    user_id: userId,
    hours: Math.round((6.2 + rand() * 2.4) * 10) / 10,
    quality: 2 + Math.floor(rand() * 4),
    logged_at: daysAgo(days - 1 - i),
  }));
}

export function generateWaterHistory(userId: string, days = 30): WaterLog[] {
  return Array.from({ length: days }, (_, i) => ({
    id: `wa_${i}`,
    user_id: userId,
    ml: 1200 + Math.floor(rand() * 1600),
    logged_at: daysAgo(days - 1 - i),
  }));
}

function goalFor(user: User): Goal[] {
  const map: Record<PrimaryGoal, { type: string; target: number; current: number }> = {
    lose_weight: { type: "lose_weight", target: 5, current: 1.8 },
    build_muscle: { type: "build_muscle", target: 12, current: 4 },
    improve_endurance: { type: "improve_endurance", target: 20, current: 9 },
    general_health: { type: "general_health", target: 20, current: 11 },
    athletic_performance: { type: "athletic_performance", target: 8, current: 3 },
  };
  const g = map[user.profile.primaryGoal];
  return [
    {
      id: "goal_primary",
      user_id: user.id,
      type: g.type,
      target_value: g.target,
      current_value: g.current,
      target_date: daysAgo(-45),
      status: "Active",
    },
    {
      id: "goal_streak",
      user_id: user.id,
      type: "weekly_workouts",
      target_value: 4,
      current_value: 3,
      target_date: daysAgo(-7),
      status: "Active",
    },
  ];
}

export function buildDashboardData(user: User): DashboardData {
  const weights = generateWeightHistory(user.id);
  const sleeps = generateSleepHistory(user.id);
  const waters = generateWaterHistory(user.id);
  const latestWeight = weights[weights.length - 1]?.weight_kg ?? user.profile.weightKg ?? 78;
  const latestSleep = sleeps[sleeps.length - 1]?.hours ?? 7.2;
  const todayWater = waters[waters.length - 1]?.ml ?? 1800;

  const sleepScore = Math.min(100, Math.round((latestSleep / 8) * 100));
  const streakDays = 12;
  const trainingLoad = 62;
  const readinessScore = Math.round(sleepScore * 0.45 + Math.min(100, streakDays * 6) * 0.2 + (100 - trainingLoad) * 0.35);
  const readinessRecommendation =
    readinessScore >= 80
      ? "Push hard today — your recovery markers look strong."
      : readinessScore >= 60
        ? "Moderate session — quality over max intensity."
        : "Prioritize recovery — keep today light and restorative.";

  const nutrition: NutritionDay = {
    date: daysAgo(0),
    calories: 1680,
    calorieTarget: 2200,
    protein_g: 118,
    carbs_g: 160,
    fat_g: 52,
    proteinTarget: 150,
    carbsTarget: 220,
    fatTarget: 70,
  };

  const timeline: ActivityEvent[] = [
    {
      id: "a1",
      type: "workout",
      title: "Completed Upper Push",
      detail: "48 min · 5 movements",
      at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "a2",
      type: "water",
      title: "Logged water",
      detail: "+250 ml",
      at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
    {
      id: "a3",
      type: "nutrition",
      title: "Logged lunch",
      detail: "Chicken bowl · 520 kcal",
      at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: "a4",
      type: "goal",
      title: "Goal progress",
      detail: "Weekly workouts 3/4",
      at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: "n1",
      title: "Readiness update",
      body: readinessRecommendation,
      read: false,
      created_at: new Date().toISOString(),
      kind: "info",
    },
    {
      id: "n2",
      title: "Streak protected",
      body: "You're on day 12 — keep the glow going.",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      kind: "success",
    },
    {
      id: "n3",
      title: "Gentle reminder",
      body: "Hydration is at 70% of today's target.",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      kind: "reminder",
    },
  ];

  const milestones: Milestone[] = [
    { id: "m1", title: "Complete 20 workouts", progress: 55, targetDate: daysAgo(-30) },
    { id: "m2", title: "Hit protein target 7 days", progress: 42, targetDate: daysAgo(-14) },
    { id: "m3", title: "Level 8", progress: 70, targetDate: daysAgo(-21) },
  ];

  const isVip = user.tier === "vip" || user.tier === "vip-plus" || user.tier === "coach";
  const isVipPlus = user.tier === "vip-plus" || user.tier === "coach";

  return {
    progressScore: 78,
    readinessScore,
    readinessLabel: readinessScore >= 80 ? "Ready" : readinessScore >= 60 ? "Steady" : "Recover",
    readinessRecommendation,
    todayWorkout: {
      id: "w_today",
      name: "Upper Push",
      durationMin: 48,
      exerciseCount: 5,
      nextExercise: "Incline DB Press",
      progressPercent: 35,
      targetMuscles: ["chest", "shoulders", "triceps"],
    },
    nutrition,
    waterMl: todayWater,
    waterTargetMl: 2800,
    sleepHours: latestSleep,
    sleepTrend: sleeps.slice(-7).map((s) => s.hours),
    weightKg: latestWeight,
    weightTrend: weights.slice(-14).map((w) => w.weight_kg),
    bodyFatPercent: 18.4,
    bodyFatTrend: [19.1, 18.9, 18.8, 18.7, 18.6, 18.5, 18.4],
    xp: 2450,
    level: 7,
    xpToNext: 3000,
    streakDays,
    goals: goalFor(user),
    weeklyActivity: [40, 65, 30, 80, 55, 90, 45],
    timeline,
    notifications,
    milestones,
    coachMessagesUnlocked: isVipPlus,
    analyticsTeaserUnlocked: isVip,
  };
}

export async function fetchDashboardData(user: User): Promise<DashboardData> {
  await new Promise((r) => setTimeout(r, 550 + Math.floor(Math.random() * 250)));
  if (Math.random() < 0.02) {
    throw new Error("Couldn't load dashboard data. Try again.");
  }
  return buildDashboardData(user);
}

export async function mockAuthRequest<T>(result: T, failRate = 0.05): Promise<T> {
  await new Promise((r) => setTimeout(r, 600 + Math.floor(Math.random() * 400)));
  if (Math.random() < failRate) {
    throw new Error("Something went wrong. Please try again.");
  }
  return result;
}
