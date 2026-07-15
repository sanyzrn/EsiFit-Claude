/**
 * Phase 5 calculator guards verification — static + runtime checks
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const calculators = readFileSync('src/lib/calculators.ts', 'utf8');
const bodyCalc = readFileSync('src/components/calculators/BodyCompositionCalculators.tsx', 'utf8');
const strengthCalc = readFileSync('src/components/calculators/StrengthTrainingCalculators.tsx', 'utf8');
const home = readFileSync('src/pages/Home.tsx', 'utf8');
const calculatorsPage = readFileSync('src/pages/Calculators.tsx', 'utf8');
const lazyCalc = readFileSync('src/components/calculators/lazy.tsx', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const testFile = readFileSync('src/lib/calculators.test.ts', 'utf8');

check(
  'CALC-2: BMI guards zero/negative height',
  calculators.includes('heightCm <= 0') && calculators.includes('weightKg <= 0'),
  'calcBMI validates height and weight before division'
);

check(
  'CALC-3: WHR guards zero hip/waist',
  calculators.includes('hipCm <= 0') && calculators.includes('waistCm <= 0'),
  'calcWHR validates circumferences before division'
);

check(
  'CALC-4: Brzycki rejects reps >= 37',
  calculators.includes('reps >= 37'),
  'calcOneRepMax blocks Brzycki denominator edge case'
);

check(
  'CALC-2/3/4 runtime: Vitest edge-case tests',
  testFile.includes('height <= 0') &&
    testFile.includes('hip <= 0') &&
    testFile.includes('reps >= 37'),
  'calculators.test.ts covers BMI, WHR, and Brzycki guards'
);

const vitest = spawnSync('npm', ['test'], { encoding: 'utf8', shell: true });
check(
  'CALC-2/3/4 runtime: npm test passes',
  vitest.status === 0,
  vitest.status === 0 ? 'vitest run exit 0' : (vitest.stderr || vitest.stdout || 'vitest failed').slice(0, 500)
);

check(
  'UI: BMI calculator handles Result.ok',
  bodyCalc.includes('result.ok') && bodyCalc.includes('result.error'),
  'BmiCalculator shows error state'
);

check(
  'UI: WHR calculator handles Result.ok',
  bodyCalc.includes('result.value.whr'),
  'WhrCalculator reads guarded result'
);

check(
  'UI: 1RM calculator handles Result.ok',
  strengthCalc.includes('oneRMResult.ok') && strengthCalc.includes('oneRMResult.error'),
  'OneRepMaxCalculator shows error state'
);

check(
  'CALC-1: Home copy documents 13 tools vs 14 pages',
  home.includes('13') && (home.includes('/calculators') || home.includes('14')),
  'Home marketing clarifies widget vs slug count'
);

check(
  'CALC-1: rep-max-table slug documented on /calculators',
  calculatorsPage.includes('rep-max-table') &&
    lazyCalc.includes("'rep-max-table': OneRepMaxCalculator"),
  'rep-max-table maps to shared 1RM component via lazy registry'
);

check(
  'Vitest wired in package.json',
  pkg.scripts?.test?.includes('vitest') && Boolean(pkg.devDependencies?.vitest),
  'npm test runs vitest'
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, passCount: checks.filter((c) => c.pass).length, total: checks.length, checks }, null, 2));
process.exit(allPass ? 0 : 1);
