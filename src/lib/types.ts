export type Role = 'USER' | 'COACH' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'ECONOMY' | 'VIP' | 'ELITE';
export type Goal = 'MUSCLE_GAIN' | 'FAT_LOSS' | 'GENERAL_FITNESS' | 'STRENGTH';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

export const TIER_ORDER: Record<SubscriptionTier, number> = {
  FREE: 0,
  ECONOMY: 1,
  VIP: 2,
  ELITE: 3,
};

export function hasTierAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[requiredTier];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  subscriptionTier: SubscriptionTier;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: Goal;
  activityLevel?: ActivityLevel;
  injuries?: string;
  assignedCoachId?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string;
  commonMistakes?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'strength' | 'cardio' | 'corrective' | 'mobility';
  muscleGroups: string[];
  equipment: string[];
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  goal: Goal;
  level: string;
  daysPerWeek: number;
  requiredTier: SubscriptionTier;
  days: ProgramDay[];
}

export interface ProgramDay {
  id: string;
  dayNumber: number;
  title: string;
  exercises: ProgramExercise[];
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  order: number;
}

export interface DietPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalCalories: number;
  requiredTier: SubscriptionTier;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  items: MealItem[];
}

export interface MealItem {
  id: string;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface BodyLog {
  id: string;
  userId: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  bodyFatPct?: number;
  photoUrl?: string;
}

export interface ExerciseLog {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  sets: number;
  reps: number;
  weightKg: number;
}

export interface CalculatorResult {
  id: string;
  userId?: string;
  type: string;
  inputJson: Record<string, unknown>;
  resultJson: Record<string, unknown>;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  category: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'closed';
  messages: Message[];
}

export interface Message {
  id: string;
  ticketId?: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  content: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  /** Monthly price in Tomans (integer). 0 = free. */
  priceMonthly: number;
  features: string[];
}
