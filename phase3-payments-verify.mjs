/**
 * Phase 3 payments verification — static checks (Express API)
 */
import { readFileSync } from 'node:fs';

const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const store = readFileSync('src/lib/store.ts', 'utf8');
const pricing = readFileSync('src/pages/Pricing.tsx', 'utf8');
const dashboard = readFileSync('src/pages/Dashboard.tsx', 'utf8');
const paymentsClient = readFileSync('src/lib/payments.ts', 'utf8');
const paymentsApi = readFileSync('backend/src/routes/payments.ts', 'utf8');

check(
  'SEC-3: upgradeTier removed from store',
  !store.includes('export function upgradeTier'),
  'No client-side tier flip helper'
);

check(
  'SEC-3: Pricing does not call upgradeTier',
  !pricing.includes('upgradeTier'),
  'Pricing uses startCheckout / coming-soon flow'
);

check(
  'SEC-3: Dashboard billing does not call upgradeTier',
  !dashboard.includes('upgradeTier'),
  'Billing page has no fake cancel upgrade'
);

check(
  'Stripe checkout API route exists',
  paymentsApi.includes('/checkout') && paymentsApi.includes('stripe.checkout.sessions.create'),
  'Express API creates Stripe Checkout session'
);

check(
  'Stripe webhook with signature verification',
  paymentsApi.includes('stripeWebhookRouter') && paymentsApi.includes('constructEvent'),
  'Webhook verifies Stripe signature before tier update'
);

check(
  'Honest coming-soon UX',
  pricing.includes('Coming Soon') && pricing.includes('PaymentsNotice'),
  'Pricing shows coming-soon when payments disabled'
);

check(
  'Client payments module',
  paymentsClient.includes('startCheckout') && paymentsClient.includes('PaymentsNotConfiguredError'),
  'Client routes to Stripe or surfaces not-configured state'
);

check(
  'No Firebase callable payments',
  !paymentsClient.includes('httpsCallable') && !paymentsClient.includes('firebase/functions'),
  'Payments use REST API instead of Firebase Functions'
);

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ allPass, checks }, null, 2));
process.exit(allPass ? 0 : 1);
