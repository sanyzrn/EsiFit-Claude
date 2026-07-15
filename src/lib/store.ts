import type { User, Exercise, Program, DietPlan, Article, BodyLog, ExerciseLog, CalculatorResult, Ticket, Plan, SubscriptionTier } from './types';

// Simple reactive store with localStorage persistence
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribe(fn: Listener): () => void { listeners.add(fn); return () => { listeners.delete(fn); }; }
function notify() { listeners.forEach(fn => fn()); }

const STORAGE_KEY = 'esifit_store';

interface StoreState {
  currentUser: User | null;
  bodyLogs: BodyLog[];
  exerciseLogs: ExerciseLog[];
  calculatorResults: CalculatorResult[];
  tickets: Ticket[];
  savedExercises: string[];
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { currentUser: null, bodyLogs: [], exerciseLogs: [], calculatorResults: [], tickets: [], savedExercises: [] };
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notify();
}

import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase';

export async function syncUserFromFirebase(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      state.currentUser = {
        id: uid,
        email: data.email,
        name: data.name,
        role: data.role as 'ADMIN' | 'COACH' | 'USER',
        subscriptionTier: data.subscriptionTier as 'FREE' | 'ECONOMY' | 'VIP' | 'ELITE',
        createdAt: data.createdAt,
        age: 28,
        gender: 'male',
        heightCm: 178,
        weightKg: 80,
        goal: 'MUSCLE_GAIN',
        activityLevel: 'MODERATE'
      };
      saveState();
    }
  } catch (error) {
    console.error("Error syncing user:", error);
  }
}

export function getState() { return state; }

export async function logout() {
  await signOut(auth);
  state.currentUser = null;
  saveState();
}

export function updateProfile(updates: Partial<User>) {
  if (state.currentUser) {
    state.currentUser = { ...state.currentUser, ...updates };
    saveState();
  }
}

export function upgradeTier(tier: SubscriptionTier) {
  if (state.currentUser) {
    state.currentUser.subscriptionTier = tier;
    saveState();
  }
}

function generateId(prefix: string) {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  return prefix + '_' + uuid.split('-')[0];
}

export function addBodyLog(log: Omit<BodyLog, 'id' | 'userId'>) {
  const entry: BodyLog = {
    ...log,
    id: generateId('bl'),
    userId: state.currentUser?.id || '',
  };
  state.bodyLogs.push(entry);
  saveState();
}

export function addExerciseLog(log: Omit<ExerciseLog, 'id' | 'userId'>) {
  const entry: ExerciseLog = {
    ...log,
    id: generateId('el'),
    userId: state.currentUser?.id || '',
  };
  state.exerciseLogs.push(entry);
  saveState();
}

export function addCalculatorResult(result: Omit<CalculatorResult, 'id' | 'createdAt'>) {
  const entry: CalculatorResult = {
    ...result,
    id: generateId('cr'),
    createdAt: new Date().toISOString(),
  };
  state.calculatorResults.push(entry);
  saveState();
}

export function addTicket(subject: string, message: string) {
  const id = generateId('tk');
  const ticket: Ticket = {
    id,
    userId: state.currentUser?.id || '',
    subject,
    status: 'open',
    messages: [{
      id: generateId('msg'),
      ticketId: id,
      senderId: state.currentUser?.id || '',
      senderName: state.currentUser?.name || 'User',
      content: message,
      createdAt: new Date().toISOString(),
    }],
  };
  state.tickets.push(ticket);
  saveState();
}

export function addMessageToTicket(ticketId: string, content: string, asSender?: string) {
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (ticket) {
    let senderName = state.currentUser?.name || 'User';
    if (asSender === 'coach') senderName = 'Coach Smith';
    else if (asSender === 'support') senderName = 'EsiFit Support';
    
    ticket.messages.push({
      id: generateId('msg'),
      ticketId,
      senderId: asSender || state.currentUser?.id || '',
      senderName,
      content,
      createdAt: new Date().toISOString(),
    });
    saveState();
  }
}

export function toggleSavedExercise(exerciseId: string) {
  const idx = state.savedExercises.indexOf(exerciseId);
  if (idx >= 0) state.savedExercises.splice(idx, 1);
  else state.savedExercises.push(exerciseId);
  saveState();
}

export function getStreak(): number {
  if (!state.currentUser) return 0;
  
  // Create a Set of date strings in 'YYYY-MM-DD' format using local time to match today's date
  const loggedDates = new Set(
    state.exerciseLogs.map(l => {
      const d = new Date(l.date);
      // Adjust for local timezone offset to get the correct YYYY-MM-DD string
      const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return localDate.toISOString().split('T')[0];
    })
  );
  
  const today = new Date();
  const todayLocal = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  const todayStr = todayLocal.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayLocal = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000);
  const yesterdayStr = yesterdayLocal.toISOString().split('T')[0];

  let streak = 0;
  let currentDate = new Date(today);
  
  if (!loggedDates.has(todayStr) && !loggedDates.has(yesterdayStr)) {
    return 0; // No streak active
  }

  // If today is not logged, start checking from yesterday
  if (!loggedDates.has(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Loop backwards day by day to count the streak
  while (true) {
    const dLocal = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
    const ds = dLocal.toISOString().split('T')[0];
    if (loggedDates.has(ds)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Seed data
export const PLANS: Plan[] = [
  { id: 'plan_free', tier: 'FREE', name: 'Free', priceMonthly: 0, features: ['All calculators', 'Exercise library', '1 generic program', 'Community access'] },
  { id: 'plan_eco', tier: 'ECONOMY', name: 'Economy', priceMonthly: 999, features: ['Everything in Free', 'Goal-matched programs', 'Sample diet plans', 'Ticket support', 'Progress tracking'] },
  { id: 'plan_vip', tier: 'VIP', name: 'VIP', priceMonthly: 2999, features: ['Everything in Economy', 'Coach-reviewed programs', 'Custom diet plans', 'Direct coach chat', 'Full progress analytics'] },
  { id: 'plan_elite', tier: 'ELITE', name: 'Elite', priceMonthly: 7999, features: ['Everything in VIP', 'Dedicated 1-on-1 coach', 'Weekly program adjustments', 'Priority support', 'Exclusive content'] },
];

export const EXERCISES: Exercise[] = [
  { id: 'ex1', slug: 'barbell-bench-press', name: 'Barbell Bench Press', instructions: 'Lie on a flat bench, grip the barbell slightly wider than shoulder width. Lower the bar to your mid-chest, keeping elbows at about 45 degrees. Press back up to full arm extension. Keep your feet flat on the floor and maintain a slight arch in your lower back.', commonMistakes: 'Bouncing the bar off your chest. Flaring elbows too wide. Lifting hips off the bench. Not using a full range of motion.', difficulty: 'intermediate', type: 'strength', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], equipment: ['Barbell', 'Bench'] },
  { id: 'ex2', slug: 'barbell-squat', name: 'Barbell Back Squat', instructions: 'Place the barbell on your upper traps. Stand with feet shoulder-width apart, toes slightly out. Descend by pushing hips back and bending knees simultaneously. Go as low as mobility allows (at least parallel). Drive back up through your heels.', commonMistakes: 'Knees caving inward. Rounding lower back. Not hitting proper depth. Shifting weight to toes.', difficulty: 'intermediate', type: 'strength', muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'], equipment: ['Barbell', 'Squat Rack'] },
  { id: 'ex3', slug: 'deadlift', name: 'Conventional Deadlift', instructions: 'Stand with feet hip-width apart, bar over mid-foot. Hinge at hips to grip the bar just outside your knees. Brace your core, keep chest up, and drive through the floor. Lock out at the top with hips and knees extended. Lower in a controlled manner.', commonMistakes: 'Rounding the back. Starting with hips too high or too low. Not bracing core. Hyperextending at lockout.', difficulty: 'advanced', type: 'strength', muscleGroups: ['Back', 'Glutes', 'Hamstrings'], equipment: ['Barbell'] },
  { id: 'ex4', slug: 'overhead-press', name: 'Overhead Press', instructions: 'Stand with feet shoulder-width apart. Hold barbell at shoulder height, palms forward. Press the bar directly overhead. Lock out arms at the top. Lower back to shoulders with control.', commonMistakes: 'Excessive back lean. Not fully locking out. Using legs to assist (unless doing push press).', difficulty: 'intermediate', type: 'strength', muscleGroups: ['Shoulders', 'Triceps'], equipment: ['Barbell'] },
  { id: 'ex5', slug: 'pull-up', name: 'Pull-Up', instructions: 'Hang from a bar with palms facing away, slightly wider than shoulder width. Pull yourself up until your chin is over the bar. Lower with control to full arm extension. Keep your core engaged throughout.', commonMistakes: 'Kipping or swinging. Not going to full extension at bottom. Not getting chin over bar.', difficulty: 'intermediate', type: 'strength', muscleGroups: ['Back', 'Biceps'], equipment: ['Pull-Up Bar'] },
  { id: 'ex6', slug: 'barbell-row', name: 'Barbell Bent-Over Row', instructions: 'Hinge at hips with slight knee bend, back at ~45 degrees. Grip barbell with hands shoulder-width apart. Pull the bar to your lower chest/upper abdomen. Squeeze shoulder blades at the top. Lower with control.', commonMistakes: 'Using momentum. Not maintaining hip hinge. Pulling to the wrong position.', difficulty: 'intermediate', type: 'strength', muscleGroups: ['Back', 'Biceps', 'Rear Delts'], equipment: ['Barbell'] },
  { id: 'ex7', slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', instructions: 'Stand with dumbbells at your sides. Raise arms out to the sides until parallel with the floor. Keep a slight bend in elbows. Lower with control. Lead with elbows, not hands.', commonMistakes: 'Using too heavy a weight. Swinging the weights. Shrugging shoulders up.', difficulty: 'beginner', type: 'strength', muscleGroups: ['Shoulders'], equipment: ['Dumbbells'] },
  { id: 'ex8', slug: 'leg-press', name: 'Leg Press', instructions: 'Sit in the leg press machine with feet shoulder-width apart on the platform. Lower the weight by bending knees to about 90 degrees. Push back to start without locking knees completely.', commonMistakes: 'Locking knees at the top. Placing feet too high or low. Letting knees cave in. Rounding lower back.', difficulty: 'beginner', type: 'strength', muscleGroups: ['Quadriceps', 'Glutes'], equipment: ['Leg Press Machine'] },
  { id: 'ex9', slug: 'plank', name: 'Plank', instructions: 'Support your body on forearms and toes, forming a straight line from head to heels. Engage your core and hold. Keep hips level — don\'t let them sag or pike up. Breathe steadily.', commonMistakes: 'Sagging hips. Piking hips too high. Holding breath. Looking up instead of down.', difficulty: 'beginner', type: 'strength', muscleGroups: ['Core', 'Shoulders'], equipment: ['None'] },
  { id: 'ex10', slug: 'running-treadmill', name: 'Treadmill Running', instructions: 'Start at a comfortable pace. Maintain upright posture with slight forward lean. Land on midfoot, not heels. Keep arms at 90 degrees. Gradually increase speed as desired.', commonMistakes: 'Overstriding. Holding onto handrails. Looking down at feet. Starting too fast.', difficulty: 'beginner', type: 'cardio', muscleGroups: ['Legs', 'Core'], equipment: ['Treadmill'] },
];

export const PROGRAMS: Program[] = [
  {
    id: 'prog1', slug: 'beginner-full-body', title: 'Beginner Full Body', description: 'A perfect starting point for gym newcomers. This 3-day per week program covers all major muscle groups with fundamental compound movements. Each session takes about 45-60 minutes.', goal: 'GENERAL_FITNESS', level: 'Beginner', daysPerWeek: 3, requiredTier: 'FREE',
    days: [
      { id: 'pd1', dayNumber: 1, title: 'Full Body A', exercises: [
        { id: 'pe1', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '8-10', restSeconds: 120, order: 1 },
        { id: 'pe2', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 3, reps: '8-10', restSeconds: 90, order: 2 },
        { id: 'pe3', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '8-10', restSeconds: 90, order: 3 },
        { id: 'pe4', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90, order: 4 },
        { id: 'pe5', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '30-45s', restSeconds: 60, order: 5 },
      ]},
      { id: 'pd2', dayNumber: 2, title: 'Full Body B', exercises: [
        { id: 'pe6', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 3, reps: '6-8', restSeconds: 150, order: 1 },
        { id: 'pe7', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe8', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '6-10', restSeconds: 90, order: 3 },
        { id: 'pe9', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, order: 4 },
        { id: 'pe10', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '30-45s', restSeconds: 60, order: 5 },
      ]},
      { id: 'pd3', dayNumber: 3, title: 'Full Body C', exercises: [
        { id: 'pe11', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '10-12', restSeconds: 120, order: 1 },
        { id: 'pe12', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe13', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe14', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '10-12', restSeconds: 90, order: 4 },
        { id: 'pe15', exerciseId: 'ex10', exerciseName: 'Treadmill Running', sets: 1, reps: '15 min', restSeconds: 0, order: 5 },
      ]},
    ],
  },
  {
    id: 'prog2', slug: 'hypertrophy-upper-lower', title: 'Hypertrophy Upper/Lower Split', description: 'A 4-day upper/lower split designed for intermediate lifters chasing muscle growth. Emphasizes progressive overload in the 8-12 rep range with strategic volume distribution.', goal: 'MUSCLE_GAIN', level: 'Intermediate', daysPerWeek: 4, requiredTier: 'ECONOMY',
    days: [
      { id: 'pd4', dayNumber: 1, title: 'Upper Body A', exercises: [
        { id: 'pe16', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 120, order: 1 },
        { id: 'pe17', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6-8', restSeconds: 120, order: 2 },
        { id: 'pe18', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90, order: 3 },
        { id: 'pe19', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '8-12', restSeconds: 90, order: 4 },
        { id: 'pe20', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, order: 5 },
      ]},
      { id: 'pd5', dayNumber: 2, title: 'Lower Body A', exercises: [
        { id: 'pe21', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, order: 1 },
        { id: 'pe22', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe23', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 3, reps: '6-8', restSeconds: 150, order: 3 },
        { id: 'pe24', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '45-60s', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd6', dayNumber: 3, title: 'Upper Body B', exercises: [
        { id: 'pe25', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 3, reps: '10-12', restSeconds: 90, order: 1 },
        { id: 'pe26', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 4, reps: '6-10', restSeconds: 90, order: 2 },
        { id: 'pe27', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe28', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '10-12', restSeconds: 90, order: 4 },
      ]},
      { id: 'pd7', dayNumber: 4, title: 'Lower Body B', exercises: [
        { id: 'pe29', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 4, reps: '5-6', restSeconds: 180, order: 1 },
        { id: 'pe30', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '10-12', restSeconds: 120, order: 2 },
        { id: 'pe31', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '15-20', restSeconds: 90, order: 3 },
      ]},
    ],
  },
  {
    id: 'prog3', slug: 'strength-powerlifting', title: 'Strength Powerlifting Program', description: 'An advanced 5-day powerlifting-focused program designed for maximum strength gains on the big three lifts. Includes periodized intensity and volume with specific accessory work.', goal: 'STRENGTH', level: 'Advanced', daysPerWeek: 5, requiredTier: 'VIP',
    days: [
      { id: 'pd8', dayNumber: 1, title: 'Heavy Squat Day', exercises: [
        { id: 'pe32', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 5, reps: '3-5', restSeconds: 240, order: 1 },
        { id: 'pe33', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 4, reps: '8-10', restSeconds: 120, order: 2 },
        { id: 'pe34', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '60s', restSeconds: 60, order: 3 },
      ]},
      { id: 'pd9', dayNumber: 2, title: 'Heavy Bench Day', exercises: [
        { id: 'pe35', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 5, reps: '3-5', restSeconds: 240, order: 1 },
        { id: 'pe36', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '6-8', restSeconds: 120, order: 2 },
        { id: 'pe37', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, order: 3 },
      ]},
      { id: 'pd10', dayNumber: 3, title: 'Heavy Deadlift Day', exercises: [
        { id: 'pe38', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 5, reps: '2-4', restSeconds: 300, order: 1 },
        { id: 'pe39', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6-8', restSeconds: 120, order: 2 },
        { id: 'pe40', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '8-12', restSeconds: 90, order: 3 },
      ]},
      { id: 'pd11', dayNumber: 4, title: 'Volume Squat/Bench', exercises: [
        { id: 'pe41', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 4, reps: '8-10', restSeconds: 120, order: 1 },
        { id: 'pe42', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 4, reps: '8-10', restSeconds: 120, order: 2 },
      ]},
      { id: 'pd12', dayNumber: 5, title: 'Accessory Day', exercises: [
        { id: 'pe43', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 4, reps: '10-15', restSeconds: 90, order: 1 },
        { id: 'pe44', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '15-20', restSeconds: 60, order: 2 },
        { id: 'pe45', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '60-90s', restSeconds: 60, order: 3 },
      ]},
    ],
  },
];

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
];

export const ARTICLES: Article[] = [
  {
    id: 'art1', slug: 'progressive-overload-guide', title: 'The Complete Guide to Progressive Overload',
    excerpt: 'Learn the #1 principle behind consistent muscle and strength gains. Without progressive overload, your body has no reason to adapt.',
    content: `## What Is Progressive Overload?\n\nProgressive overload is the gradual increase of stress placed upon the body during exercise training. It's the foundational principle behind all strength and hypertrophy programs.\n\n## Why It Matters\n\nYour body adapts to the demands you place on it. If you always lift the same weight for the same reps, your body has no reason to grow stronger or build more muscle. You must progressively increase the challenge.\n\n## How to Apply It\n\n### 1. Add More Weight\nThe most straightforward method. Add 2.5-5 lbs to the bar when you can complete all prescribed reps with good form.\n\n### 2. Add More Reps\nIf you can't add weight yet, aim for more reps within your target range (e.g., go from 3×8 to 3×10 before adding weight).\n\n### 3. Add More Sets\nIncrease total training volume by adding an extra set to key exercises.\n\n### 4. Decrease Rest Time\nPerforming the same work in less time is also a form of progressive overload.\n\n### 5. Improve Form\nBetter technique with the same weight means more muscle activation and effective load.\n\n## Sample Progression Scheme\n\n| Week | Weight | Sets × Reps |\n|------|--------|-------------|\n| 1 | 135 lbs | 3 × 8 |\n| 2 | 135 lbs | 3 × 9 |\n| 3 | 135 lbs | 3 × 10 |\n| 4 | 140 lbs | 3 × 8 |\n\n## Common Mistakes\n\n- **Too much too fast** — Increasing weight before form is solid\n- **Ignoring recovery** — Progression requires adequate sleep, nutrition, and rest days\n- **Program hopping** — Switching programs every week prevents you from tracking progress\n\nStay consistent, track your lifts, and trust the process.`,
    coverImage: 'https://images.pexels.com/photos/3888405/pexels-photo-3888405.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', publishedAt: '2024-11-15', category: 'Training',
  },
  {
    id: 'art2', slug: 'protein-intake-guide', title: 'How Much Protein Do You Really Need?',
    excerpt: 'Cut through the noise: evidence-based protein recommendations for muscle building, fat loss, and general health.',
    content: `## The Science of Protein Intake\n\nProtein is the most important macronutrient for body composition. Here's what the research actually says.\n\n## General Recommendations\n\n- **Sedentary adults**: 0.8g per kg of body weight\n- **Active individuals**: 1.2-1.6g per kg\n- **Muscle building**: 1.6-2.2g per kg\n- **Fat loss (while preserving muscle)**: 2.0-2.4g per kg\n\n## Timing Matters (A Little)\n\nThe "anabolic window" isn't as narrow as once thought, but distributing protein across 3-5 meals per day does optimize muscle protein synthesis.\n\n### Optimal Per-Meal Protein\n\nAim for 25-40g of protein per meal to maximally stimulate muscle protein synthesis.\n\n## Best Protein Sources\n\n### Animal Sources\n- Chicken breast (31g per 100g)\n- Eggs (13g per 100g)\n- Greek yogurt (10g per 100g)\n- Salmon (25g per 100g)\n- Lean beef (26g per 100g)\n\n### Plant Sources\n- Lentils (9g per 100g cooked)\n- Tofu (8g per 100g)\n- Chickpeas (9g per 100g)\n- Quinoa (4g per 100g cooked)\n\n## Protein Supplements\n\nWhey protein is convenient but not necessary if you can hit your targets through whole foods. Casein before bed may provide a slight advantage for overnight muscle recovery.\n\n## Key Takeaway\n\nFor most gym-goers, aim for **1.6-2.2g of protein per kg of body weight per day**, spread across multiple meals.`,
    coverImage: 'https://images.pexels.com/photos/6388452/pexels-photo-6388452.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', publishedAt: '2024-11-20', category: 'Nutrition',
  },
  {
    id: 'art3', slug: 'sleep-and-muscle-growth', title: '5 Ways Sleep Affects Your Muscle Growth',
    excerpt: 'You can\'t out-train bad sleep. Here\'s exactly how sleep quality impacts your gains and recovery.',
    content: `## Sleep: The Most Underrated Anabolic\n\nYou can have the perfect training program and diet, but without adequate sleep, you're leaving significant gains on the table.\n\n## 1. Growth Hormone Release\n\nUp to 75% of human growth hormone (HGH) is released during deep sleep. HGH is critical for muscle repair, fat metabolism, and recovery.\n\n## 2. Protein Synthesis\n\nMuscle protein synthesis — the process of building new muscle tissue — peaks during sleep. Poor sleep reduces protein synthesis by up to 18%.\n\n## 3. Testosterone Production\n\nStudies show that sleeping only 5 hours per night (vs. 8) can reduce testosterone levels by 10-15%. Testosterone is essential for muscle growth in both men and women.\n\n## 4. Cortisol Regulation\n\nSleep deprivation increases cortisol, a catabolic hormone that breaks down muscle tissue and promotes fat storage, especially around the midsection.\n\n## 5. Training Performance\n\nPoor sleep reduces:\n- Strength output by 5-10%\n- Endurance capacity by up to 30%\n- Motivation and perceived effort\n- Reaction time and coordination\n\n## How to Optimize Sleep for Gains\n\n1. **Aim for 7-9 hours** per night\n2. **Consistent schedule** — same bed/wake time daily\n3. **Cool, dark room** — 65-68°F (18-20°C)\n4. **No screens** 30-60 minutes before bed\n5. **Avoid caffeine** after 2 PM\n6. **Magnesium supplement** (200-400mg) before bed may improve sleep quality\n\n## The Bottom Line\n\nSleep is when your body actually builds muscle. Prioritize it like you prioritize your training.`,
    coverImage: 'https://images.pexels.com/photos/3838705/pexels-photo-3838705.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', publishedAt: '2024-12-01', category: 'Recovery',
  },
];

// All unique muscle groups and equipment for filtering
export const ALL_MUSCLE_GROUPS = [...new Set(EXERCISES.flatMap(e => e.muscleGroups))].sort();
export const ALL_EQUIPMENT = [...new Set(EXERCISES.flatMap(e => e.equipment))].sort();
