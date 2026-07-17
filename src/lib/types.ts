/** Domain types aligned with DATA_MODEL.md — Phase 2 mock layer */

export type UserTier = "free" | "vip" | "vip-plus" | "coach" | "admin" | "super-admin";
export type UserRoleName = "Guest" | "Free" | "VIP" | "VIP+" | "Coach" | "Admin" | "Super Admin";

export type PrimaryGoal =
  | "lose_weight"
  | "build_muscle"
  | "improve_endurance"
  | "general_health"
  | "athletic_performance";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type EquipmentAccess = "full_gym" | "home_gym" | "bodyweight" | "specific";

export type NotificationPreference = "off" | "gentle" | "frequent";

export type Sex = "female" | "male" | "other" | "prefer_not";

export interface UserProfile {
  primaryGoal: PrimaryGoal;
  experienceLevel: ExperienceLevel;
  equipment: EquipmentAccess[];
  age?: number;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  notificationPreference: NotificationPreference;
  wearableConnected: boolean;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role_id: string;
  role: UserRoleName;
  tier: UserTier;
  created_at: string;
  emailVerified: boolean;
  profile: UserProfile;
}

export interface Goal {
  id: string;
  user_id: string;
  type: PrimaryGoal | string;
  target_value: number;
  current_value: number;
  target_date: string;
  status: "Active" | "Completed" | "Abandoned" | "Expired";
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  hours: number;
  quality: number;
  logged_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  ml: number;
  logged_at: string;
}

export interface NutritionDay {
  date: string;
  calories: number;
  calorieTarget: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export interface WorkoutPreview {
  id: string;
  name: string;
  durationMin: number;
  exerciseCount: number;
  nextExercise: string;
  progressPercent: number;
  targetMuscles: string[];
}

export interface ActivityEvent {
  id: string;
  type: "workout" | "nutrition" | "water" | "goal" | "badge" | "system";
  title: string;
  detail: string;
  at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  kind: "info" | "success" | "reminder";
}

export interface Milestone {
  id: string;
  title: string;
  progress: number;
  targetDate: string;
}

export interface DashboardData {
  progressScore: number;
  readinessScore: number;
  readinessLabel: string;
  readinessRecommendation: string;
  todayWorkout: WorkoutPreview | null;
  nutrition: NutritionDay;
  waterMl: number;
  waterTargetMl: number;
  sleepHours: number;
  sleepTrend: number[];
  weightKg: number;
  weightTrend: number[];
  bodyFatPercent: number;
  bodyFatTrend: number[];
  xp: number;
  level: number;
  xpToNext: number;
  streakDays: number;
  goals: Goal[];
  weeklyActivity: number[];
  timeline: ActivityEvent[];
  notifications: AppNotification[];
  milestones: Milestone[];
  coachMessagesUnlocked: boolean;
  analyticsTeaserUnlocked: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  primaryGoal: "general_health",
  experienceLevel: "beginner",
  equipment: ["bodyweight"],
  notificationPreference: "gentle",
  wearableConnected: false,
  onboardingCompleted: false,
  onboardingSkipped: false,
};

export const TIER_TO_ROLE: Record<UserTier, UserRoleName> = {
  free: "Free",
  vip: "VIP",
  "vip-plus": "VIP+",
  coach: "Coach",
  admin: "Admin",
  "super-admin": "Super Admin",
};
