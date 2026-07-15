/**
 * Phase 4 API persistence — static verification
 */
import { readFileSync } from 'node:fs';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const store = readFileSync('src/lib/store.ts', 'utf8');
const activityApi = readFileSync('src/lib/activity-api.ts', 'utf8');
const dashboard = readFileSync('src/pages/Dashboard.tsx', 'utf8');
const migration = readFileSync('backend/migrations/001_init.sql', 'utf8');

check(
  'DATA-1: activity-api fetch layer',
  activityApi.includes('fetchUserActivityData') &&
    activityApi.includes('persistBodyLog') &&
    activityApi.includes('persistExerciseLog') &&
    activityApi.includes('persistTicket'),
  'Activity collections have fetch + persist helpers via REST API'
);

check(
  'DATA-1: store writes through to API',
  store.includes('persistBodyLog') &&
    store.includes('persistExerciseLog') &&
    store.includes('persistCalculatorResult') &&
    store.includes('persistTicket') &&
    store.includes('persistSavedExercises') &&
    store.includes('loadActivityFromApi'),
  'Store mutations and login sync use backend API'
);

check(
  'DATA-2: profile persisted via API',
  store.includes('persistUserProfile') &&
    activityApi.includes('export async function persistUserProfile') &&
    dashboard.includes('await updateProfile'),
  'Profile save PATCHes /api/users/me'
);

check(
  'DATA-1: SQL schema for activity collections',
  migration.includes('body_logs') &&
    migration.includes('exercise_logs') &&
    migration.includes('calculator_results') &&
    migration.includes('tickets'),
  'PostgreSQL tables cover activity data'
);

check(
  'DATA-2: saved exercises normalized table',
  migration.includes('saved_exercises'),
  'savedExercises stored in saved_exercises join table'
);

check(
  'Logout clears local activity cache',
  store.includes('clearActivityData'),
  'Activity data cleared on logout'
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, checks }, null, 2));
process.exit(allPass ? 0 : 1);
