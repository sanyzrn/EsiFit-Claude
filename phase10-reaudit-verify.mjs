/**
 * Phase 10 — full re-audit orchestrator
 * Runs phases 1–9 verify scripts plus core tooling checks and build metrics.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PHASE_SCRIPTS = [
  'phase1-auth-verify.mjs',
  'phase2-auth-verify.mjs',
  'phase3-payments-verify.mjs',
  'phase4-firestore-verify.mjs',
  'phase5-calculator-verify.mjs',
  'phase6-tooling-verify.mjs',
  'phase7-bugs-verify.mjs',
  'phase8-ux-verify.mjs',
  'phase9-content-verify.mjs',
];

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

function runNode(script) {
  const result = spawnSync('node', [script], { encoding: 'utf8', shell: false });
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = null;
  }
  return { script, status: result.status, parsed, stdout: result.stdout, stderr: result.stderr };
}

for (const script of PHASE_SCRIPTS) {
  const run = runNode(script);
  const pass = run.status === 0 && (run.parsed?.allPass ?? true);
  const count = run.parsed?.passCount ?? run.parsed?.checks?.filter((c) => c.pass).length;
  const total = run.parsed?.total ?? run.parsed?.checks?.length;
  check(
    `Phase script: ${script}`,
    pass,
    pass
      ? total != null
        ? `${count ?? total}/${total} checks passed`
        : 'exit 0'
      : (run.stderr || run.stdout || 'failed').slice(0, 200)
  );
}

const lint = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('Core: npm run lint', lint.status === 0, lint.status === 0 ? 'exit 0' : 'failed');

const typecheck = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('Core: npm run typecheck', typecheck.status === 0, typecheck.status === 0 ? 'exit 0' : 'failed');

const test = spawnSync('npm', ['test'], { encoding: 'utf8', shell: true });
check('Core: npm test', test.status === 0, test.status === 0 ? 'exit 0' : 'failed');

const build = spawnSync('npm', ['run', 'build'], { encoding: 'utf8', shell: true });
check('Core: npm run build', build.status === 0, build.status === 0 ? 'exit 0' : 'failed');

let jsChunks = 0;
let largestChunk = { name: '', kb: 0, gzipKb: 0 };
try {
  const assetsDir = 'dist/assets';
  const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  jsChunks = jsFiles.length;
  for (const file of jsFiles) {
    const kb = statSync(`${assetsDir}/${file}`).size / 1024;
    if (file.startsWith('index-') && kb > largestChunk.kb) {
      largestChunk = { name: file, kb: Math.round(kb), gzipKb: 0 };
    }
  }
  const buildOut = build.stdout || '';
  const indexLine = buildOut.split('\n').find((line) => line.includes('dist/assets/index-') && line.includes('.js'));
  if (indexLine) {
    const gzipPart = indexLine.match(/gzip:\s+([\d.]+)\s+kB/);
    if (gzipPart) largestChunk.gzipKb = Number(gzipPart[1]);
  }
} catch {
  jsChunks = 0;
}

check(
  'PERF-1: Production bundle split (vite build)',
  jsChunks >= 30,
  `${jsChunks} JS chunks; largest tracked index chunk ~${largestChunk.kb} KB raw`
);

const mainTsx = readFileSync('src/main.tsx', 'utf8');
check(
  'BUG-12: Boot probe removed from main.tsx',
  !mainTsx.includes('testConnection') && !mainTsx.includes('getDocFromServer'),
  'No Firestore boot probe on app start'
);

const issues = readFileSync('ISSUES.md', 'utf8');
check(
  'Phase 10: Verified report exists',
  readFileSync('EsiFit_Fixes_Verified_2026-07-15.md', 'utf8').includes('Remediation Complete'),
  'EsiFit_Fixes_Verified_2026-07-15.md present'
);

check(
  'Phase 10: ISSUES index reconciled',
  issues.includes('BUG-12') && issues.includes('fixed') && issues.includes('CONTENT-1'),
  'ISSUES.md tracks remediation status'
);

const passCount = checks.filter((c) => c.pass).length;
const result = {
  allPass: passCount === checks.length,
  passCount,
  total: checks.length,
  buildMetrics: {
    jsChunks,
    indexChunkKb: largestChunk.kb,
    indexChunkGzipKb: largestChunk.gzipKb || null,
  },
  checks,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.allPass ? 0 : 1);
