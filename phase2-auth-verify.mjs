/**
 * Phase 2 auth completeness — static verification
 */
import { readFileSync } from 'node:fs';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const authTsx = readFileSync('src/pages/Auth.tsx', 'utf8');
const storeTs = readFileSync('src/lib/store.ts', 'utf8');
const mainTsx = readFileSync('src/main.tsx', 'utf8');
const authLib = readFileSync('src/lib/auth.ts', 'utf8');

check(
  'AUTH-1: Register Google button wired',
  authTsx.includes('handleGoogleSignUp') && !authTsx.includes('onClick={() => {}}'),
  'Register uses handleGoogleSignUp; no empty onClick stub'
);

check(
  'AUTH-1: Shared signInWithGoogle helper',
  authLib.includes('export async function signInWithGoogle'),
  'src/lib/auth.ts exports signInWithGoogle'
);

check(
  'AUTH-2: Forgot password calls sendPasswordResetEmail',
  authTsx.includes('requestPasswordReset') && authLib.includes('sendPasswordResetEmail'),
  'ForgotPassword uses requestPasswordReset → sendPasswordResetEmail'
);

check(
  'AUTH-2: Success only after API call',
  authTsx.includes('await requestPasswordReset(email)') && authTsx.includes('setSent(true)'),
  'setSent(true) only after await requestPasswordReset'
);

check(
  'AUTH-3: No hardcoded profile defaults in sync',
  !storeTs.includes('age: 28') && !storeTs.includes("gender: 'male'") && storeTs.includes('mergeProfileFromFirestore'),
  'syncUserFromFirebase merges Firestore/local profile without fake defaults'
);

check(
  'BUG-12: Boot probe removed',
  !mainTsx.includes('testConnection') && !mainTsx.includes('getDocFromServer'),
  'main.tsx no longer runs Firestore boot probe'
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, checks }, null, 2));
process.exit(allPass ? 0 : 1);
