/**
 * Phase 9 content depth + Farsi seed verification
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

const exercisesSeed = readFileSync('src/lib/seed/exercises.ts', 'utf8');
const programsSeed = readFileSync('src/lib/seed/programs.ts', 'utf8');
const dietsSeed = readFileSync('src/lib/seed/diet-plans.ts', 'utf8');
const articlesSeed = readFileSync('src/lib/seed/articles.ts', 'utf8');
const exerciseFa = readFileSync('src/lib/seed/content-fa-exercises.ts', 'utf8');
const programFa = readFileSync('src/lib/seed/content-fa-programs.ts', 'utf8');
const dietFa = readFileSync('src/lib/seed/content-fa-diets.ts', 'utf8');
const articleFa = readFileSync('src/lib/seed/content-fa-articles.ts', 'utf8');
const exercisesPage = readFileSync('src/pages/Exercises.tsx', 'utf8');
const programsPage = readFileSync('src/pages/Programs.tsx', 'utf8');
const dietPage = readFileSync('src/pages/Diet.tsx', 'utf8');
const blogPage = readFileSync('src/pages/Blog.tsx', 'utf8');
const contentI18n = readFileSync('src/lib/content-i18n.ts', 'utf8');

const exerciseCount = countMatches(exercisesSeed, /\bid: 'ex\d+'/g);
const programCount = countMatches(programsSeed, /\bid: 'prog\d+'/g);
const dietCount = countMatches(dietsSeed, /\bid: 'dp\d+'/g);
const articleCount = countMatches(articlesSeed, /\bid: 'art\d+'/g);

const minExercises = 20;
const minPrograms = 5;
const minDiets = 4;
const minArticles = 6;

check(
  'CONTENT-2: Exercise catalog expanded',
  exerciseCount >= minExercises,
  `${exerciseCount} exercises (min ${minExercises})`
);
check(
  'CONTENT-2: Program catalog expanded',
  programCount >= minPrograms,
  `${programCount} programs (min ${minPrograms})`
);
check(
  'CONTENT-2: Diet catalog expanded',
  dietCount >= minDiets,
  `${dietCount} diet plans (min ${minDiets})`
);
check(
  'CONTENT-2: Article catalog expanded',
  articleCount >= minArticles,
  `${articleCount} articles (min ${minArticles})`
);

check(
  'CONTENT-1: All exercises have Farsi translations',
  countMatches(exerciseFa, /^\s+ex\d+:/gm) >= exerciseCount,
  `${countMatches(exerciseFa, /^\s+ex\d+:/gm)}/${exerciseCount} exercise locale entries`
);
check(
  'CONTENT-1: All programs have Farsi translations',
  countMatches(programFa, /^\s+prog\d+:/gm) >= programCount,
  `${countMatches(programFa, /^\s+prog\d+:/gm)}/${programCount} program locale entries`
);
check(
  'CONTENT-1: All diet plans have Farsi translations',
  countMatches(dietFa, /^\s+dp\d+:/gm) >= dietCount,
  `${countMatches(dietFa, /^\s+dp\d+:/gm)}/${dietCount} diet locale entries`
);
check(
  'CONTENT-1: All articles have Farsi translations',
  countMatches(articleFa, /^\s+art\d+:/gm) >= articleCount,
  `${countMatches(articleFa, /^\s+art\d+:/gm)}/${articleCount} article locale entries`
);

check(
  'CONTENT-1: Exercises page uses localized content helpers',
  exercisesPage.includes('localizedExercise') && exercisesPage.includes('lang'),
  'Exercise list/detail render via content-i18n'
);
check(
  'CONTENT-1: Programs page uses localized content helpers',
  programsPage.includes('localizedProgram') && programsPage.includes('getExerciseNameById'),
  'Program copy and exercise names localized'
);
check(
  'CONTENT-1: Diet page uses localized content helpers',
  dietPage.includes('localizedDietPlan'),
  'Diet list/detail render via content-i18n'
);
check(
  'CONTENT-1: Blog page uses localized content helpers',
  blogPage.includes('localizedArticle'),
  'Article list/detail render via content-i18n'
);

check(
  'CONTENT-1: Shared content locale module exists',
  contentI18n.includes('localizedExercise') && contentI18n.includes('localizedArticle'),
  'content-i18n.ts exports locale pickers'
);

const lint = spawnSync('npm', ['run', 'lint'], { encoding: 'utf8', shell: true });
check('Lint passes', lint.status === 0, lint.status === 0 ? 'exit 0' : (lint.stderr || lint.stdout || '').slice(0, 300));

const typecheck = spawnSync('npm', ['run', 'typecheck'], { encoding: 'utf8', shell: true });
check('Typecheck passes', typecheck.status === 0, typecheck.status === 0 ? 'exit 0' : (typecheck.stderr || typecheck.stdout || '').slice(0, 300));

const test = spawnSync('npm', ['test'], { encoding: 'utf8', shell: true });
check('Tests pass', test.status === 0, test.status === 0 ? 'exit 0' : (test.stderr || test.stdout || '').slice(0, 300));

const passCount = checks.filter((c) => c.pass).length;
const result = {
  allPass: passCount === checks.length,
  passCount,
  total: checks.length,
  checks,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.allPass ? 0 : 1);
