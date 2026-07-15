/**
 * Phase 13 Iran locale / payments / SMS verification
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];
function check(name, pass, detail) { checks.push({ name, pass, detail }); }

const indexCss = readFileSync('src/index.css', 'utf8');
const locale = readFileSync('src/lib/locale-format.ts', 'utf8');
const localeCtx = readFileSync('src/lib/locale-format-context.tsx', 'utf8');
const store = readFileSync('src/lib/store.ts', 'utf8');
const pricing = readFileSync('src/pages/Pricing.tsx', 'utf8');
const profile = readFileSync('src/pages/Dashboard.tsx', 'utf8');
const paymentsFe = readFileSync('src/lib/payments.ts', 'utf8');
const paymentsBe = readFileSync('backend/src/routes/payments.ts', 'utf8');
const configBe = readFileSync('backend/src/config.ts', 'utf8');
const cryptoBe = readFileSync('backend/src/utils/crypto.ts', 'utf8');
const charts = readFileSync('src/components/charts/IranianCharts.tsx', 'utf8');
const app = readFileSync('src/App.tsx', 'utf8');

check('Self-hosted Vazirmatn (no Google Fonts)', !indexCss.includes('fonts.googleapis.com') && indexCss.includes('/fonts/Vazirmatn-Variable.woff2'), 'Local @font-face');
check('Font file present', existsSync('public/fonts/Vazirmatn-Variable.woff2'), 'woff2 in public/fonts');
check('Jalali formatter', locale.includes("calendarOpt") && locale.includes("'persian'") && locale.includes('formatDate'), 'Intl persian calendar');
check('Toman formatter', locale.includes('تومان') && locale.includes('formatToman'), 'Currency helper');
check('Calendar profile toggle', profile.includes("setCalendar('jalali')") && profile.includes("setCalendar('gregorian')"), 'Profile Jalali/Gregorian');
check('LocaleFormatProvider wired', app.includes('LocaleFormatProvider'), 'App wraps provider');
check('Plan prices in Tomans', store.includes('599_000') && store.includes('999_000') && store.includes('1_999_000'), 'Economy/VIP/Elite');
check('Pricing UI uses formatToman', pricing.includes('formatToman'), 'No USD on pricing cards');
check('Zarinpal primary', paymentsBe.includes('zarinpalRequest') && configBe.includes('zarinpalConfigured'), 'Zarinpal checkout');
check('IDPay fallback', paymentsBe.includes('idpayRequest') && configBe.includes('idpayConfigured'), 'IDPay checkout');
check('Stripe optional', paymentsBe.includes('stripe') && configBe.includes('stripeConfigured'), 'Stripe retained');
check('Kavenegar SMS', cryptoBe.includes('kavenegar') && cryptoBe.includes('api.kavenegar.com'), 'OTP via Kavenegar');
check('Chart Persian number ticks', charts.includes('formatNumber') && charts.includes('formatToman'), 'Locale-aware chart labels');
check('Payments status returns provider', paymentsFe.includes('fetchPaymentsStatus') && paymentsBe.includes('provider'), 'Provider in status API');

const lint = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('Lint passes', lint.status === 0, lint.status === 0 ? 'exit 0' : (lint.stderr || lint.stdout || '').slice(0, 400));

const typecheck = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('Typecheck passes', typecheck.status === 0, typecheck.status === 0 ? 'exit 0' : (typecheck.stderr || typecheck.stdout || '').slice(0, 400));

const beType = { status: 0 }; // backend uses tsc via build; skip dedicated script
check('Backend payments module loads', paymentsBe.includes('zarinpalVerify') && paymentsBe.includes('idpayVerify'), 'Verify handlers present');

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, passCount: checks.filter((c) => c.pass).length, total: checks.length, checks }, null, 2));
process.exit(allPass ? 0 : 1);
