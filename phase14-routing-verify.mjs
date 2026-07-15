#!/usr/bin/env node
/**
 * Phase 14 — page layout & routing structure checks
 */
import { readFileSync, existsSync } from 'fs';

const fails = [];
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => { console.log(`  ✗ ${msg}`); fails.push(msg); };

function read(path) {
  if (!existsSync(path)) { fail(`missing ${path}`); return ''; }
  return readFileSync(path, 'utf8');
}

console.log('\nPhase 14: routing & layout\n');

const app = read('src/App.tsx');
const protectedRoute = read('src/components/ProtectedRoute.tsx');
const authLayout = read('src/components/layout/AuthLayout.tsx');
const appShell = read('src/components/layout/AppShell.tsx');
const breadcrumbs = read('src/components/ui/Breadcrumbs.tsx');
const pageContainer = read('src/components/ui/PageContainer.tsx');
const admin = read('src/pages/Admin.tsx');
const dashboard = read('src/pages/Dashboard.tsx');
const coach = read('src/pages/Coach.tsx');
const exercises = read('src/pages/Exercises.tsx');
const programs = read('src/pages/Programs.tsx');
const diet = read('src/pages/Diet.tsx');
const blog = read('src/pages/Blog.tsx');

// Centralized route guards
if (protectedRoute.includes('export function ProtectedRoute') && protectedRoute.includes('export function RoleGate')) {
  pass('ProtectedRoute + RoleGate exist');
} else fail('ProtectedRoute / RoleGate missing');

if (protectedRoute.includes('JWT') || protectedRoute.includes('server-side') || protectedRoute.includes('UX')) {
  pass('Client gate documents UX-only / server JWT security');
} else fail('Missing security comment on ProtectedRoute');

if (app.includes('ProtectedRoute') && app.includes('RoleGate') && app.includes("roles={['ADMIN']}") && app.includes("roles={['COACH']}")) {
  pass('App.tsx wires ProtectedRoute / RoleGate on dashboard/admin/coach');
} else fail('App.tsx missing centralized route guards');

if (app.includes('AuthLayout') && app.includes('/login') && app.includes('/register')) {
  pass('Auth routes use AuthLayout');
} else fail('AuthLayout not used for auth routes');

if (app.includes('AppShell') && app.includes('<Outlet') === false) {
  // AppShell used as route element with its own Outlet
  if (appShell.includes('Outlet')) pass('AppShell supports Outlet for nested routes');
  else fail('AppShell missing Outlet');
} else if (appShell.includes('Outlet')) {
  pass('AppShell supports Outlet for nested routes');
} else fail('AppShell missing Outlet');

// No per-page navigate guards
if (!dashboard.includes("navigate('/login')")) pass('Dashboard has no local login redirect');
else fail('Dashboard still has local navigate(/login)');

if (!admin.includes("navigate('/')") && !admin.includes('demoUsers')) pass('Admin has no local role redirect / demoUsers');
else fail('Admin still has demoUsers or local navigate');

if (!coach.includes("navigate('/')") && !coach.includes('useEntitlements')) pass('Coach has no local role redirect');
else fail('Coach still has local role guard');

if (admin.includes("apiFetch") && admin.includes('/admin/users')) pass('Admin fetches /admin/users from SQL API');
else fail('Admin not fetching SQL users');

// Auth layout is logo-only
if (authLayout.includes('Outlet') && !authLayout.includes('TopNav') && !authLayout.includes('MobileBottomNav')) {
  pass('AuthLayout is logo-only (no full nav)');
} else fail('AuthLayout still has full nav chrome');

// Breadcrumbs on detail pages
for (const [name, src] of [['Exercises', exercises], ['Programs', programs], ['Diet', diet], ['Blog', blog]]) {
  if (src.includes('Breadcrumbs') && src.includes('href:')) pass(`${name} detail uses Breadcrumbs`);
  else fail(`${name} missing Breadcrumbs`);
}

// PageContainer canonical width
if (pageContainer.includes('max-w-7xl') && pageContainer.includes('px-4 sm:px-6 lg:px-8')) {
  pass('PageContainer defines canonical max-w-7xl + padding scale');
} else fail('PageContainer missing canonical classes');

const pagesUsingContainer = [
  ['Dashboard', dashboard],
  ['Admin', admin],
  ['Coach', coach],
  ['Exercises', exercises],
  ['Programs', programs],
  ['Diet', diet],
  ['Blog', blog],
];
for (const [name, src] of pagesUsingContainer) {
  if (src.includes('PageContainer')) pass(`${name} uses PageContainer`);
  else fail(`${name} missing PageContainer`);
}

console.log('');
if (fails.length) {
  console.error(`FAILED (${fails.length}):`);
  fails.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log('All Phase 14 checks passed.\n');
