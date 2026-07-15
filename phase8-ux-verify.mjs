/**
 * Phase 8 UX/a11y verification — static checks
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const tierGate = readFileSync('src/components/TierGate.tsx', 'utf8');
const layout = readFileSync('src/components/Layout.tsx', 'utf8');
const home = readFileSync('src/pages/Home.tsx', 'utf8');
const sharedUi = readFileSync('src/components/calculators/SharedCalculatorUI.tsx', 'utf8');
const pricing = readFileSync('src/pages/Pricing.tsx', 'utf8');
const auth = readFileSync('src/pages/Auth.tsx', 'utf8');
const authLib = readFileSync('src/lib/auth.ts', 'utf8');
const exercises = readFileSync('src/pages/Exercises.tsx', 'utf8');
const indexCss = readFileSync('src/index.css', 'utf8');
const themeLib = readFileSync('src/lib/theme.tsx', 'utf8');
const indexHtml = readFileSync('index.html', 'utf8');

check(
  'BUG-5: TierGate does not mount gated children when locked',
  tierGate.includes('aria-labelledby="tier-gate-title"') && !tierGate.includes('content-locked'),
  'Locked state shows placeholder + upgrade card only'
);

check(
  'BUG-6: Layout defers desktop nav to lg breakpoint',
  layout.includes('overflow-x-hidden') && layout.includes('hidden lg:flex'),
  'Tablet uses mobile nav; root clips horizontal overflow'
);

check(
  'BUG-6: Scroll containers constrained on Pricing and Exercises',
  pricing.includes('max-w-full min-w-0') && exercises.includes('max-w-full overflow-hidden'),
  'Table and anatomy model wrappers prevent page overflow'
);

check(
  'BUG-7: Hero background marked decorative',
  home.includes('hero-bg.jpg') && home.includes('aria-hidden="true"'),
  'Decorative hero image hidden from assistive tech'
);

check(
  'BUG-8: Calculator sliders and gauges expose ARIA',
  sharedUi.includes('aria-valuenow') && sharedUi.includes('aria-live="polite"'),
  'SliderInput and CircularGauge announce values'
);

check(
  'BUG-9: Pricing shows checkout confirmation notice',
  pricing.includes('Redirecting to secure checkout') && pricing.includes('aria-live="polite"'),
  'Users see feedback before Stripe redirect'
);

check(
  'BUG-10: Register password show/hide and strength hint',
  auth.includes('showPassword') && auth.includes('Strong password'),
  'Register form has visibility toggle and strength feedback'
);

check(
  'BUG-11: Auth errors mapped to user-friendly messages',
  authLib.includes('mapAuthError') && auth.includes('mapAuthError'),
  'Auth UI uses mapAuthError for API error codes'
);

check(
  'UI-1: Orange/gray palette documented as canonical',
  indexCss.includes('UI-1') && indexCss.includes('--color-brand'),
  'index.css records brand token decision'
);

check(
  'Theme: CSS variables swap on data-theme',
  indexCss.includes('data-theme="light"') && indexCss.includes('--theme-app'),
  'Light/dark semantic tokens defined in index.css'
);

check(
  'Theme: toggle + localStorage persistence',
  themeLib.includes('esifit_theme') && layout.includes('toggleTheme') && layout.includes('Sun'),
  'Header theme toggle persists user preference'
);

check(
  'Theme: no flash on load',
  indexHtml.includes('esifit_theme') && indexHtml.includes('data-theme'),
  'Inline script applies theme before paint'
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
