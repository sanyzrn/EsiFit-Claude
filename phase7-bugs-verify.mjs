/**
 * Phase 7 bug fixes verification — static checks
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const programs = readFileSync('src/pages/Programs.tsx', 'utf8');
const exercises = readFileSync('src/pages/Exercises.tsx', 'utf8');
const tierGate = readFileSync('src/components/TierGate.tsx', 'utf8');
const auth = readFileSync('src/pages/Auth.tsx', 'utf8');
const store = readFileSync('src/lib/store.ts', 'utf8');

check(
  'BUG-1: Program links resolve exercise slug by ID',
  programs.includes('getExerciseSlugById(pe.exerciseId)') &&
    !programs.includes('exerciseName.toLowerCase().replace'),
  'Uses getExerciseSlugById instead of name slugification'
);

check(
  'BUG-1: getExerciseSlugById helper exists',
  store.includes('export function getExerciseSlugById'),
  'store.ts exports slug lookup by exerciseId'
);

check(
  'BUG-2: Neck anatomy maps to Back (has exercises)',
  exercises.includes("'neck': 'Back'") && !exercises.includes("'neck': 'Neck'"),
  'Neck hotspot filters to Back muscle group'
);

check(
  'BUG-3: TierGate uses i18n',
  tierGate.includes('useI18n') && tierGate.includes('t({'),
  'TierGate gate copy wrapped with t()'
);

check(
  'BUG-4: Auth pages use i18n',
  auth.includes('useI18n') &&
    auth.includes("t({ en: 'Welcome Back'") &&
    auth.includes("t({ en: 'Create Your Account'") &&
    auth.includes("t({ en: 'Reset Password'"),
  'Login, Register, and ForgotPassword copy wrapped with t()'
);

const lint = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('Lint passes', lint.status === 0, lint.status === 0 ? 'exit 0' : (lint.stderr || lint.stdout || '').slice(0, 300));

const typecheck = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('Typecheck passes', typecheck.status === 0, typecheck.status === 0 ? 'exit 0' : (typecheck.stderr || typecheck.stdout || '').slice(0, 300));

const tests = spawnSync('npm', ['test'], { encoding: 'utf8', shell: true });
check('Tests pass', tests.status === 0, tests.status === 0 ? 'exit 0' : (tests.stderr || tests.stdout || '').slice(0, 300));

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, passCount: checks.filter((c) => c.pass).length, total: checks.length, checks }, null, 2));
process.exit(allPass ? 0 : 1);
