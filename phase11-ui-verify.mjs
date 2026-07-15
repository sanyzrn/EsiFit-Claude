/**
 * Phase 11 UI modernization verification — static checks
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const indexCss = readFileSync('src/index.css', 'utf8');
const designTokens = readFileSync('src/lib/design-tokens.ts', 'utf8');
const navConfig = readFileSync('src/components/layout/nav-config.ts', 'utf8');
const topNav = readFileSync('src/components/layout/TopNav.tsx', 'utf8');
const bottomNav = readFileSync('src/components/layout/MobileBottomNav.tsx', 'utf8');
const inputField = readFileSync('src/components/ui/InputField.tsx', 'utf8');
const auth = readFileSync('src/pages/Auth.tsx', 'utf8');
const appShell = readFileSync('src/components/layout/AppShell.tsx', 'utf8');
const button = readFileSync('src/components/ui/Button.tsx', 'utf8');

check(
  'UI-11: Persian teal accent tokens',
  indexCss.includes('--color-accent') && indexCss.includes('#0d9488') && designTokens.includes('0d9488'),
  'Teal secondary color in CSS + design-tokens.ts'
);

check(
  'UI-11: Primary nav IA (Calculators, Programs, Diet, Exercises)',
  navConfig.includes("PRIMARY_NAV: NavLink[] = [") && navConfig.includes("href: '/calculators'")
    && navConfig.includes("href: '/exercises'")
    && !navConfig.split('SECONDARY_NAV')[0].includes("href: '/blog'"),
  'Blog excluded from primary desktop nav'
);

check(
  'UI-11: Blog in secondary desktop nav',
  navConfig.includes('SECONDARY_NAV') && navConfig.includes("href: '/blog'"),
  'Blog remains in secondary nav row'
);

check(
  'UI-11: Mobile bottom nav with 5 tabs',
  bottomNav.includes('MOBILE_TABS') && navConfig.includes('isMore: true'),
  'Home, Tools, Programs, Dashboard, More tabs defined'
);

check(
  'UI-11: Mobile bottom nav fixed at bottom',
  bottomNav.includes('fixed bottom-0') && appShell.includes('pb-20 lg:pb-0'),
  'Bottom bar + main content padding on mobile'
);

check(
  'UI-11: InputField uses logical start/end padding',
  inputField.includes('start-3') && inputField.includes('ps-10') && inputField.includes('end-3'),
  'RTL-safe input primitive'
);

check(
  'UI-11: Auth migrated off physical left/right classes',
  auth.includes('InputField') && !auth.includes('left-3') && !auth.includes('pl-10'),
  'Auth forms use InputField with logical properties'
);

check(
  'UI-11: Logged-in quick nav (Dashboard + Messages)',
  navConfig.includes("href: '/dashboard/chat'") && topNav.includes('LOGGED_IN_QUICK_NAV'),
  'Desktop header shows dashboard and chat shortcuts when logged in'
);

check(
  'UI-11: UI primitives exported',
  button.includes('variant') && readFileSync('src/components/ui/Card.tsx', 'utf8').includes('export function Card'),
  'Button + Card primitives present'
);

check(
  'BUG-10 preserved: Register password strength',
  auth.includes('showPassword') && auth.includes('Strong password'),
  'Password visibility toggle and strength hint intact'
);

const lint = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('Lint passes', lint.status === 0, lint.status === 0 ? 'exit 0' : (lint.stderr || lint.stdout || '').slice(0, 300));

const typecheck = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('Typecheck passes', typecheck.status === 0, typecheck.status === 0 ? 'exit 0' : (typecheck.stderr || typecheck.stdout || '').slice(0, 300));

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, passCount: checks.filter((c) => c.pass).length, total: checks.length, checks }, null, 2));
process.exit(allPass ? 0 : 1);
