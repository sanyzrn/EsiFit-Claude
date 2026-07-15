import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  BodyLog,
  ExerciseLog,
  CalculatorResult,
  Ticket,
  User,
  Goal,
  ActivityLevel,
} from './types';

const GOALS: Goal[] = ['MUSCLE_GAIN', 'FAT_LOSS', 'GENERAL_FITNESS', 'STRENGTH'];
const ACTIVITY_LEVELS: ActivityLevel[] = [
  'SEDENTARY',
  'LIGHT',
  'MODERATE',
  'ACTIVE',
  'VERY_ACTIVE',
];

export interface UserActivityData {
  bodyLogs: BodyLog[];
  exerciseLogs: ExerciseLog[];
  calculatorResults: CalculatorResult[];
  tickets: Ticket[];
  savedExercises: string[];
}

export async function fetchUserActivityData(userId: string): Promise<UserActivityData> {
  const [bodySnap, exerciseSnap, calcSnap, ticketSnap, userDoc] = await Promise.all([
    getDocs(query(collection(db, 'bodyLogs'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'exerciseLogs'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'calculatorResults'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'tickets'), where('userId', '==', userId))),
    getDoc(doc(db, 'users', userId)),
  ]);

  const userData = userDoc.exists() ? userDoc.data() : undefined;
  const savedExercises = Array.isArray(userData?.savedExercises)
    ? (userData.savedExercises as string[])
    : [];

  return {
    bodyLogs: bodySnap.docs.map((d) => ({ id: d.id, ...d.data() } as BodyLog)),
    exerciseLogs: exerciseSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ExerciseLog)),
    calculatorResults: calcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CalculatorResult)),
    tickets: ticketSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket)),
    savedExercises,
  };
}

type ProfileWrite = Pick<
  User,
  'name' | 'age' | 'gender' | 'heightCm' | 'weightKg' | 'goal' | 'activityLevel' | 'injuries'
>;

export async function persistUserProfile(userId: string, updates: Partial<ProfileWrite>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.age !== undefined) payload.age = updates.age;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.heightCm !== undefined) payload.heightCm = updates.heightCm;
  if (updates.weightKg !== undefined) payload.weightKg = updates.weightKg;
  if (updates.goal !== undefined && GOALS.includes(updates.goal)) payload.goal = updates.goal;
  if (updates.activityLevel !== undefined && ACTIVITY_LEVELS.includes(updates.activityLevel)) {
    payload.activityLevel = updates.activityLevel;
  }
  if (updates.injuries !== undefined) payload.injuries = updates.injuries;
  if (Object.keys(payload).length === 0) return;
  await updateDoc(doc(db, 'users', userId), payload);
}

export async function persistSavedExercises(userId: string, savedExercises: string[]): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { savedExercises });
}

export async function persistBodyLog(log: BodyLog): Promise<void> {
  await setDoc(doc(db, 'bodyLogs', log.id), log);
}

export async function persistExerciseLog(log: ExerciseLog): Promise<void> {
  await setDoc(doc(db, 'exerciseLogs', log.id), log);
}

export async function persistCalculatorResult(result: CalculatorResult): Promise<void> {
  await setDoc(doc(db, 'calculatorResults', result.id), result);
}

export async function persistTicket(ticket: Ticket): Promise<void> {
  await setDoc(doc(db, 'tickets', ticket.id), ticket);
}
