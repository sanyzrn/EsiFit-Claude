import { apiFetch } from './api-client';
import type {
  BodyLog,
  ExerciseLog,
  CalculatorResult,
  Ticket,
  User,
  Goal,
  ActivityLevel,
} from './types';

export interface UserActivityData {
  bodyLogs: BodyLog[];
  exerciseLogs: ExerciseLog[];
  calculatorResults: CalculatorResult[];
  tickets: Ticket[];
  savedExercises: string[];
}

export async function fetchUserActivityData(): Promise<UserActivityData> {
  return apiFetch<UserActivityData>('/activity');
}

type ProfileWrite = Pick<
  User,
  'name' | 'age' | 'gender' | 'heightCm' | 'weightKg' | 'goal' | 'activityLevel' | 'injuries'
>;

export async function persistUserProfile(updates: Partial<ProfileWrite>): Promise<void> {
  await apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function persistSavedExercises(savedExercises: string[]): Promise<void> {
  await apiFetch('/users/me/saved-exercises', {
    method: 'PUT',
    body: JSON.stringify({ savedExercises }),
  });
}

export async function persistBodyLog(log: BodyLog): Promise<void> {
  await apiFetch('/activity/body-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

export async function persistExerciseLog(log: ExerciseLog): Promise<void> {
  await apiFetch('/activity/exercise-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

export async function persistCalculatorResult(result: CalculatorResult): Promise<void> {
  await apiFetch('/activity/calculator-results', {
    method: 'POST',
    body: JSON.stringify(result),
  });
}

export async function persistTicket(ticket: Ticket): Promise<void> {
  await apiFetch('/activity/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  });
}

export type { Goal, ActivityLevel };
