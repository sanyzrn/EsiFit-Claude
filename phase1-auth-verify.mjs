/**
 * Phase 1 authorization verification
 * Tests that localStorage tampering cannot bypass tier/role gating.
 */
import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = {
    localStorageAdminBypass: { pass: false, detail: '' },
    localStorageEliteBypass: { pass: false, detail: '' },
    adminRouteWithoutAuth: { pass: false, detail: '' },
    vipProgramLockedForFree: { pass: false, detail: '' },
  };

  // Test 1: localStorage ADMIN bypass on /admin
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const store = {
      currentUser: {
        id: 'fake-user',
        email: 'hacker@test.com',
        name: 'Hacker',
        role: 'ADMIN',
        subscriptionTier: 'ELITE',
        createdAt: new Date().toISOString(),
      },
      bodyLogs: [],
      exerciseLogs: [],
      calculatorResults: [],
      tickets: [],
      savedExercises: [],
    };
    localStorage.setItem('esifit_store', JSON.stringify(store));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const adminContent = await page.locator('text=User Management').count();
  const adminRedirected = page.url() === `${BASE}/` || page.url() === `${BASE}`;
  results.localStorageAdminBypass = {
    pass: adminContent === 0 || adminRedirected,
    detail: adminContent === 0
      ? 'Admin panel did not render (bypass blocked)'
      : `Admin panel rendered — bypass NOT blocked (url=${page.url()})`,
  };

  // Test 2: localStorage ELITE bypass on VIP program
  await page.goto(`${BASE}/programs/strength-powerlifting`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const raw = localStorage.getItem('esifit_store');
    const store = raw ? JSON.parse(raw) : {};
    store.currentUser = {
      id: 'fake-user',
      email: 'hacker@test.com',
      name: 'Hacker',
      role: 'USER',
      subscriptionTier: 'ELITE',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('esifit_store', JSON.stringify(store));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const upgradeCTA = await page.locator('text=Upgrade to VIP').count();
  const lockedOverlay = await page.locator('text=VIP Content').count();
  const programUnlocked = upgradeCTA === 0 && lockedOverlay === 0;
  results.localStorageEliteBypass = {
    pass: !programUnlocked,
    detail: programUnlocked
      ? 'VIP program unlocked via localStorage — bypass NOT blocked'
      : 'VIP program remains locked (bypass blocked)',
  };

  // Test 3: /admin without any user redirects away
  await page.evaluate(() => localStorage.removeItem('esifit_store'));
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  results.adminRouteWithoutAuth = {
    pass: !page.url().includes('/admin') || (await page.locator('text=User Management').count()) === 0,
    detail: `url=${page.url()}`,
  };

  // Test 4: Unauthenticated user sees lock on VIP program
  await page.goto(`${BASE}/programs/strength-powerlifting`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const hasLock = (await page.locator('text=Upgrade to VIP').count()) > 0
    || (await page.locator('text=VIP Content').count()) > 0;
  results.vipProgramLockedForFree = {
    pass: hasLock,
    detail: hasLock ? 'VIP content gated for anonymous user' : 'VIP content NOT gated',
  };

  await browser.close();

  const allPass = Object.values(results).every((r) => r.pass);
  console.log(JSON.stringify({ allPass, results }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
