/**
 * Phase 4 Firestore persistence — static verification
 */
import { readFileSync } from 'node:fs';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const store = readFileSync('src/lib/store.ts', 'utf8');
const firestoreData = readFileSync('src/lib/firestore-data.ts', 'utf8');
const rules = readFileSync('firestore.rules', 'utf8');
const dashboard = readFileSync('src/pages/Dashboard.tsx', 'utf8');

check(
  'DATA-1: firestore-data fetch layer',
  firestoreData.includes('fetchUserActivityData') &&
    firestoreData.includes('persistBodyLog') &&
    firestoreData.includes('persistExerciseLog') &&
    firestoreData.includes('persistTicket'),
  'Activity collections have fetch + persist helpers'
);

check(
  'DATA-1: store writes through to Firestore',
  store.includes('persistBodyLog') &&
    store.includes('persistExerciseLog') &&
    store.includes('persistCalculatorResult') &&
    store.includes('persistTicket') &&
    store.includes('persistSavedExercises') &&
    store.includes('loadActivityFromFirestore'),
  'Store mutations and login sync use Firestore'
);

check(
  'DATA-2: profile persisted to Firestore',
  store.includes('persistUserProfile') &&
    firestoreData.includes('export async function persistUserProfile') &&
    dashboard.includes('await updateProfile'),
  'Profile save writes to users/{uid}'
);

check(
  'DATA-1: Firestore rules for activity collections',
  rules.includes('match /exerciseLogs/') &&
    rules.includes('match /calculatorResults/') &&
    rules.includes('match /tickets/'),
  'Rules cover exerciseLogs, calculatorResults, tickets'
);

check(
  'DATA-2: Firestore rules allow profile field updates',
  rules.includes('savedExercises') &&
    rules.includes('activityLevel') &&
    rules.includes('isValidProfileUpdate'),
  'Users can update profile fields server-side'
);

check(
  'Logout clears local activity cache',
  store.includes('clearActivityData'),
  'Activity data cleared on logout'
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, checks }, null, 2));
process.exit(allPass ? 0 : 1);
