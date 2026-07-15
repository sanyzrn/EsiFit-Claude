/**
 * Phase 12 Iranian visual identity verification
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];
function check(name, pass, detail) { checks.push({ name, pass, detail }); }

const indexCss = readFileSync('src/index.css', 'utf8');
const tokens = readFileSync('src/lib/design-tokens.ts', 'utf8');
const media = readFileSync('src/lib/media.ts', 'utf8');
const home = readFileSync('src/pages/Home.tsx', 'utf8');
const programs = readFileSync('src/pages/Programs.tsx', 'utf8');
const diet = readFileSync('src/pages/Diet.tsx', 'utf8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf8');
const dashboard = readFileSync('src/pages/Dashboard.tsx', 'utf8');
const charts = readFileSync('src/components/charts/IranianCharts.tsx', 'utf8');
const sharedUi = readFileSync('src/components/calculators/SharedCalculatorUI.tsx', 'utf8');
const tierGate = readFileSync('src/components/TierGate.tsx', 'utf8');

check('UI-12: Saffron/firuze/terracotta palette in CSS', indexCss.includes('--theme-primary') && indexCss.includes('--theme-secondary') && indexCss.includes('--theme-accent'), 'Full semantic palette for light+dark');
check('UI-12: Semantic success/warning/error tokens', indexCss.includes('--theme-success') && indexCss.includes('--theme-warning') && indexCss.includes('--theme-error'), 'Semantic colors defined');
check('UI-12: Persian geometric pattern utility', indexCss.includes('.persian-pattern') && readFileSync('src/components/ui/PersianPattern.tsx', 'utf8').includes('PersianPattern'), 'Girih-inspired pattern component');
check('UI-12: IconBadge primitive', readFileSync('src/components/ui/IconBadge.tsx', 'utf8').includes('strokeWidth={2.25}'), 'Custom icon treatment');
check('UI-12: Program card photography', programs.includes('programImage') && media.includes('beginner-full-body'), 'Programs use curated images');
check('UI-12: Diet card photography', diet.includes('dietImage') && media.includes('clean-bulk-3000'), 'Diet plans use curated images');
check('UI-12: Hero imagery with alt', home.includes('IMAGES.hero') && home.includes('alt={t(IMAGES.hero.alt)}'), 'Hero photo with localized alt');
check('UI-12: Admin revenue + growth charts', admin.includes('AdminCharts') && charts.includes('BarChart') && charts.includes('AreaChart'), 'Admin dashboard charts');
check('UI-12: Dashboard progress charts', dashboard.includes('ProgressCharts') && charts.includes('measurementData'), 'Weight, measurements, volume charts');
check('UI-12: Calculator gauges use theme colors', sharedUi.includes('gaugeColorForStatus') && sharedUi.includes('PersianPattern'), 'RTL-safe gauges + pattern');
check('UI-12: TierGate uses IconBadge', tierGate.includes('IconBadge') && tierGate.includes('PersianPattern'), 'Tier cards Iranized');
check('UI-12: design-tokens palette export', tokens.includes('saffron') && tokens.includes('firuze') && tokens.includes('terracotta'), 'TS token mirror');

const lint = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('Lint passes', lint.status === 0, lint.status === 0 ? 'exit 0' : (lint.stderr || lint.stdout || '').slice(0, 300));

const typecheck = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('Typecheck passes', typecheck.status === 0, typecheck.status === 0 ? 'exit 0' : (typecheck.stderr || typecheck.stdout || '').slice(0, 300));

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, passCount: checks.filter((c) => c.pass).length, total: checks.length, checks }, null, 2));
process.exit(allPass ? 0 : 1);
