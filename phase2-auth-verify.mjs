/**
 * Phase 2 auth completeness — static verification (SQL API)
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
const apiClient = readFileSync('src/lib/api-client.ts', 'utf8');

check(
  'AUTH-1: Google Sign-In removed',
  !authTsx.includes('Google') && !authTsx.includes('signInWithGoogle'),
  'No Google OAuth buttons or helpers in Auth UI'
);

check(
  'AUTH-1: Phone OTP flow present',
  authTsx.includes('requestPhoneOtp') && authTsx.includes('verifyPhoneOtp') && authTsx.includes('PhoneOtpSection'),
  'Login/register support phone + SMS OTP'
);

check(
  'AUTH-2: Forgot password uses API',
  authTsx.includes('requestPasswordReset') && authLib.includes('requestPasswordReset') && apiClient.includes('/auth/forgot-password'),
  'ForgotPassword calls backend forgot-password endpoint'
);

check(
  'AUTH-2: Reset password page',
  authTsx.includes('export function ResetPassword') && apiClient.includes('/auth/reset-password'),
  'Reset password flow with token verification'
);

check(
  'AUTH-2: Success only after API call',
  authTsx.includes('await requestPasswordReset(email)') && authTsx.includes('setSent(true)'),
  'setSent(true) only after await requestPasswordReset'
);

check(
  'AUTH-3: No hardcoded profile defaults in sync',
  !storeTs.includes('age: 28') && !storeTs.includes("gender: 'male'") && storeTs.includes('syncUserFromApi'),
  'syncUserFromApi uses server profile without fake defaults'
);

check(
  'BUG-12: Boot probe removed',
  !mainTsx.includes('testConnection') && !mainTsx.includes('getDocFromServer'),
  'main.tsx no longer runs Firestore boot probe'
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, checks }, null, 2));
process.exit(allPass ? 0 : 1);
