import type { User, BodyLog, ExerciseLog, CalculatorResult, Ticket, Plan, Goal, ActivityLevel } from './types';
import { fetchEntitlements } from './entitlements';
import { EXERCISES, PROGRAMS, DIET_PLANS, ARTICLES } from './seed';
import type { Language } from './i18n';
import { localizedExercise } from './content-i18n';
import {
  fetchUserActivityData,
  persistUserProfile,
  persistSavedExercises,
  persistBodyLog,
  persistExerciseLog,
  persistCalculatorResult,
  persistTicket,
} from './firestore-data';

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

function stripAuthFieldsFromUser(user: User | null): User | null {
  if (!user) return null;
  return { ...user, role: 'USER', subscriptionTier: 'FREE' };
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      // Never restore role/tier from localStorage — authorization uses server entitlements.
      parsed.currentUser = stripAuthFieldsFromUser(parsed.currentUser);
      return parsed;
    }
  } catch { /* ignore */ }
  return { currentUser: null, bodyLogs: [], exerciseLogs: [], calculatorResults: [], tickets: [], savedExercises: [] };
}

const state = loadState();

function saveState() {
  const toPersist = {
    ...state,
    currentUser: state.currentUser
      ? stripAuthFieldsFromUser(state.currentUser)
      : null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  notify();
}

import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase';

function clearActivityData() {
  state.bodyLogs = [];
  state.exerciseLogs = [];
  state.calculatorResults = [];
  state.tickets = [];
  state.savedExercises = [];
}

async function loadActivityFromFirestore(userId: string) {
  try {
    const activity = await fetchUserActivityData(userId);
    state.bodyLogs = activity.bodyLogs;
    state.exerciseLogs = activity.exerciseLogs;
    state.calculatorResults = activity.calculatorResults;
    state.tickets = activity.tickets;
    state.savedExercises = activity.savedExercises;
    saveState();
  } catch (error) {
    console.error('Error loading activity data from Firestore:', error);
  }
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readOptionalGoal(value: unknown): Goal | undefined {
  const goals: Goal[] = ['MUSCLE_GAIN', 'FAT_LOSS', 'GENERAL_FITNESS', 'STRENGTH'];
  return typeof value === 'string' && goals.includes(value as Goal) ? (value as Goal) : undefined;
}

function readOptionalActivityLevel(value: unknown): ActivityLevel | undefined {
  const levels: ActivityLevel[] = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'];
  return typeof value === 'string' && levels.includes(value as ActivityLevel)
    ? (value as ActivityLevel)
    : undefined;
}

function mergeProfileFromFirestore(
  data: Record<string, unknown>,
  existing: User | null
): Pick<User, 'age' | 'gender' | 'heightCm' | 'weightKg' | 'goal' | 'activityLevel' | 'injuries'> {
  return {
    age: readOptionalNumber(data.age) ?? existing?.age,
    gender: readOptionalString(data.gender) ?? existing?.gender,
    heightCm: readOptionalNumber(data.heightCm) ?? existing?.heightCm,
    weightKg: readOptionalNumber(data.weightKg) ?? existing?.weightKg,
    goal: readOptionalGoal(data.goal) ?? existing?.goal,
    activityLevel: readOptionalActivityLevel(data.activityLevel) ?? existing?.activityLevel,
    injuries: readOptionalString(data.injuries) ?? existing?.injuries,
  };
}

export async function syncUserFromFirebase(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const entitlements = await fetchEntitlements();
      const existing = state.currentUser?.id === uid ? state.currentUser : null;
      const profile = mergeProfileFromFirestore(data, existing);
      state.currentUser = {
        id: uid,
        email: data.email,
        name: data.name,
        role: entitlements?.role ?? 'USER',
        subscriptionTier: entitlements?.subscriptionTier ?? 'FREE',
        createdAt: data.createdAt,
        ...profile,
      };
      saveState();
      await loadActivityFromFirestore(uid);
    }
  } catch (error) {
    console.error("Error syncing user:", error);
  }
}

export function getState() { return state; }

export async function logout() {
  await signOut(auth);
  state.currentUser = null;
  clearActivityData();
  saveState();
}

export async function updateProfile(updates: Partial<User>) {
  if (!state.currentUser) return;
  state.currentUser = { ...state.currentUser, ...updates };
  saveState();
  try {
    await persistUserProfile(state.currentUser.id, updates);
  } catch (error) {
    console.error('Error persisting profile to Firestore:', error);
  }
}

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().split('-')[0]}`;
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${suffix}`;
  }
  return `${prefix}_${Date.now().toString(36)}`;
}

export function addBodyLog(log: Omit<BodyLog, 'id' | 'userId'>) {
  const entry: BodyLog = {
    ...log,
    id: generateId('bl'),
    userId: state.currentUser?.id || '',
  };
  state.bodyLogs.push(entry);
  saveState();
  if (entry.userId) {
    void persistBodyLog(entry).catch((error) => {
      console.error('Error persisting body log:', error);
    });
  }
}

export function addExerciseLog(log: Omit<ExerciseLog, 'id' | 'userId'>) {
  const entry: ExerciseLog = {
    ...log,
    id: generateId('el'),
    userId: state.currentUser?.id || '',
  };
  state.exerciseLogs.push(entry);
  saveState();
  if (entry.userId) {
    void persistExerciseLog(entry).catch((error) => {
      console.error('Error persisting exercise log:', error);
    });
  }
}

export function addCalculatorResult(result: Omit<CalculatorResult, 'id' | 'createdAt' | 'userId'>) {
  const entry: CalculatorResult = {
    ...result,
    id: generateId('cr'),
    userId: state.currentUser?.id || '',
    createdAt: new Date().toISOString(),
  };
  state.calculatorResults.push(entry);
  saveState();
  if (entry.userId) {
    void persistCalculatorResult(entry).catch((error) => {
      console.error('Error persisting calculator result:', error);
    });
  }
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
  if (ticket.userId) {
    void persistTicket(ticket).catch((error) => {
      console.error('Error persisting ticket:', error);
    });
  }
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
    if (ticket.userId) {
      void persistTicket(ticket).catch((error) => {
        console.error('Error persisting ticket message:', error);
      });
    }
  }
}

export function toggleSavedExercise(exerciseId: string) {
  const idx = state.savedExercises.indexOf(exerciseId);
  if (idx >= 0) state.savedExercises.splice(idx, 1);
  else state.savedExercises.push(exerciseId);
  saveState();
  const userId = state.currentUser?.id;
  if (userId) {
    void persistSavedExercises(userId, [...state.savedExercises]).catch((error) => {
      console.error('Error persisting saved exercises:', error);
    });
  }
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
  const currentDate = new Date(today);
  
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

export { EXERCISES, PROGRAMS, DIET_PLANS, ARTICLES };

// Seed data
export const PLANS: Plan[] = [
  { id: 'plan_free', tier: 'FREE', name: 'Free', priceMonthly: 0, features: ['All calculators', 'Exercise library', '1 generic program', 'Community access'] },
  { id: 'plan_eco', tier: 'ECONOMY', name: 'Economy', priceMonthly: 999, features: ['Everything in Free', 'Goal-matched programs', 'Sample diet plans', 'Ticket support', 'Progress tracking'] },
  { id: 'plan_vip', tier: 'VIP', name: 'VIP', priceMonthly: 2999, features: ['Everything in Economy', 'Coach-reviewed programs', 'Custom diet plans', 'Direct coach chat', 'Full progress analytics'] },
  { id: 'plan_elite', tier: 'ELITE', name: 'Elite', priceMonthly: 7999, features: ['Everything in VIP', 'Dedicated 1-on-1 coach', 'Weekly program adjustments', 'Priority support', 'Exclusive content'] },
];

// All unique muscle groups and equipment for filtering
export const ALL_MUSCLE_GROUPS = [...new Set(EXERCISES.flatMap(e => e.muscleGroups))].sort();
export const ALL_EQUIPMENT = [...new Set(EXERCISES.flatMap(e => e.equipment))].sort();

export function getExerciseSlugById(exerciseId: string): string | undefined {
  return EXERCISES.find((exercise) => exercise.id === exerciseId)?.slug;
}

export function getExerciseNameById(exerciseId: string, lang: Language = 'en'): string {
  const exercise = EXERCISES.find((item) => item.id === exerciseId);
  if (!exercise) return '';
  return localizedExercise(exercise, lang).name;
}
