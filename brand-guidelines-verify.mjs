#!/usr/bin/env node
/**
 * Brand guidelines redesign checks
 */
import { readFileSync, existsSync } from 'fs';

const fails = [];
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => { console.log(`  ✗ ${msg}`); fails.push(msg); };

function read(path) {
  if (!existsSync(path)) { fail(`missing ${path}`); return ''; }
  return readFileSync(path, 'utf8');
}

console.log('\nBrand guidelines redesign\n');

const css = read('src/index.css');
const theme = read('src/lib/theme.tsx');
const html = read('index.html');
const button = read('src/components/ui/Button.tsx');
const card = read('src/components/ui/Card.tsx');
const tokens = read('src/lib/design-tokens.ts');

if (css.includes('#f6f1e8') || css.includes('#F6F1E8')) pass('Light cream background token');
else fail('Missing light cream #F6F1E8');

if (css.includes('#8c1d40') || css.includes('#8C1D40')) pass('Light pomegranate primary');
else fail('Missing pomegranate #8C1D40');

if (css.includes('#1f2328') || css.includes('#1F2328')) pass('Dark graphite background');
else fail('Missing graphite #1F2328');

if (css.includes('#14b8a6') || css.includes('#14B8A6')) pass('Dark turquoise primary');
else fail('Missing turquoise #14B8A6');

if (css.includes('--radius-btn: 12px') && css.includes('--radius-card: 20px') && css.includes('--radius-dialog: 24px')) {
  pass('Radius scale (btn 12 / card 20 / dialog 24)');
} else fail('Missing radius scale');

if (css.includes('.card-iranian') && css.includes('box-shadow: none') && css.includes('.card-premium')) {
  pass('Flat cards (no drop shadows)');
} else fail('Cards still use shadows or missing card-premium');

if (theme.includes('getSystemTheme') && theme.includes('prefers-color-scheme')) {
  pass('Theme defaults to OS preference');
} else fail('Theme does not follow system preference');

if (html.includes('prefers-color-scheme') && !html.includes('fonts.googleapis.com')) {
  pass('index.html FOUC script + no Google Fonts CDN');
} else fail('index.html theme bootstrap / fonts issue');

if (button.includes('rounded-[12px]') && button.includes('text-brand-fg') && !button.includes('shadow-')) {
  pass('Button: 12px radius, brand-fg, no shadow');
} else fail('Button not aligned to brand');

if (card.includes('card-premium') && !card.includes('PersianPattern')) {
  pass('Card uses flat premium surface');
} else fail('Card still decorative/patterned');

if (tokens.includes('pomegranate') && tokens.includes('turquoise') && tokens.includes("btn: '12px'")) {
  pass('design-tokens.ts mirrors brand palette');
} else fail('design-tokens incomplete');

// Sweep pages for forbidden leftovers
const { execSync } = await import('child_process');
let leftovers = '';
try {
  leftovers = execSync(
    "rg -n 'shadow-(sm|md|lg|xl)|orange-[0-9]{3}|animate-pulse-glow|fonts\\.googleapis|text-\\[#1a1410\\]' src index.html --glob '!**/PersianPattern.tsx' || true",
    { encoding: 'utf8' }
  ).trim();
} catch {
  leftovers = '';
}
if (!leftovers) pass('No orange/shadow/glow leftovers in src');
else fail(`Leftover styles:\n${leftovers}`);

console.log('');
if (fails.length) {
  console.error(`FAILED (${fails.length})`);
  fails.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log('All brand guideline checks passed.\n');
