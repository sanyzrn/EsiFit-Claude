/**
 * Phase 6 tooling verification — static checks + build metrics
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const viteConfig = readFileSync('vite.config.ts', 'utf8');
const app = readFileSync('src/App.tsx', 'utf8');
const calculators = readFileSync('src/pages/Calculators.tsx', 'utf8');
const lazyLoaders = readFileSync('src/components/calculators/lazy.tsx', 'utf8');
const store = readFileSync('src/lib/store.ts', 'utf8');

check(
  'TOOL-1: ESLint installed and lint script configured',
  Boolean(pkg.devDependencies?.eslint) && pkg.scripts?.lint?.includes('eslint'),
  'eslint in devDependencies; npm run lint uses eslint'
);

const eslintRun = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('TOOL-1 runtime: npm run lint passes', eslintRun.status === 0, eslintRun.status === 0 ? 'exit 0' : (eslintRun.stderr || eslintRun.stdout || '').slice(0, 300));

const typecheckRun = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('TOOL-2 runtime: npm run typecheck passes', typecheckRun.status === 0, typecheckRun.status === 0 ? 'exit 0' : (typecheckRun.stderr || typecheckRun.stdout || '').slice(0, 300));

check(
  'TOOL-3: Calculators page uses shared lazy loaders',
  calculators.includes('@/components/calculators/lazy') && !calculators.includes('BodyCompositionCalculators'),
  'No static calculator imports in Calculators.tsx'
);

check(
  'TOOL-3: Home and /calculators share lazy registry',
  lazyLoaders.includes('CALC_COMPONENTS') && lazyLoaders.includes('BodyCompositionTab'),
  'lazy.tsx centralizes dynamic imports'
);

check(
  'TOOL-4: Dead dependencies removed from package.json',
  !pkg.dependencies?.['@base-ui/react'] &&
    !pkg.dependencies?.['@date-fns/tz'] &&
    !pkg.devDependencies?.['vite-plugin-singlefile'],
  'Removed @base-ui/react, @date-fns/tz, vite-plugin-singlefile'
);

check(
  'TOOL-5: Route-level code splitting in App.tsx',
  app.includes('lazy(() => import') && app.includes('Suspense'),
  'Pages loaded via React.lazy'
);

check(
  'TOOL-5: Vite manualChunks configured',
  viteConfig.includes('manualChunks'),
  'Vendor libraries split in vite.config.ts'
);

check(
  'TOOL-6: Debug scripts removed',
  !['check.mjs', 'check.cjs'].some((file) => {
    try {
      statSync(file);
      return true;
    } catch {
      return false;
    }
  }),
  'check.mjs and check.cjs deleted'
);

check(
  'TOOL-7: generateId avoids Math.random fallback',
  store.includes('crypto.randomUUID') && store.includes('crypto.getRandomValues') && !store.includes('Math.random'),
  'IDs use crypto APIs only'
);

const buildRun = spawnSync('npm', ['run', 'build'], { encoding: 'utf8', shell: true });
check('Build succeeds', buildRun.status === 0, buildRun.status === 0 ? 'vite build exit 0' : (buildRun.stderr || buildRun.stdout || '').slice(0, 300));

let largestJsKb = 0;
let jsChunkCount = 0;
if (buildRun.status === 0) {
  const assetsDir = 'dist/assets';
  for (const file of readdirSync(assetsDir)) {
    if (!file.endsWith('.js')) continue;
    jsChunkCount += 1;
    const sizeKb = statSync(`${assetsDir}/${file}`).size / 1024;
    largestJsKb = Math.max(largestJsKb, sizeKb);
  }
}

check(
  'TOOL-5 runtime: largest JS chunk under 600 KB',
  largestJsKb > 0 && largestJsKb < 600,
  largestJsKb > 0 ? `largest chunk ${largestJsKb.toFixed(1)} KB across ${jsChunkCount} JS files` : 'no JS chunks found'
);

check(
  'TOOL-5 runtime: multiple JS chunks emitted',
  jsChunkCount >= 10,
  `${jsChunkCount} JS chunks in dist/assets`
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, passCount: checks.filter((c) => c.pass).length, total: checks.length, largestJsKb: Math.round(largestJsKb), jsChunkCount, checks }, null, 2));
process.exit(allPass ? 0 : 1);
