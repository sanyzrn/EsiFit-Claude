import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import type { SubscriptionTier } from './types';

const functions = getFunctions(app);

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super('PAYMENTS_NOT_CONFIGURED');
    this.name = 'PaymentsNotConfiguredError';
  }
}

let cachedStatus: boolean | null = null;

/** Whether Stripe checkout is configured server-side (price IDs + secret key). */
export async function fetchPaymentsEnabled(): Promise<boolean> {
  if (cachedStatus !== null) return cachedStatus;
  try {
    const getStatus = httpsCallable<void, { enabled: boolean }>(functions, 'getPaymentsStatus');
    const result = await getStatus();
    cachedStatus = Boolean(result.data.enabled);
    return cachedStatus;
  } catch {
    cachedStatus = false;
    return false;
  }
}

/** Redirect to Stripe Checkout for a paid tier. Throws PaymentsNotConfiguredError when Stripe is not set up. */
export async function startCheckout(tier: SubscriptionTier): Promise<void> {
  if (tier === 'FREE') {
    throw new Error('Cannot checkout FREE tier');
  }
  try {
    const createSession = httpsCallable<{ tier: SubscriptionTier }, { url: string }>(
      functions,
      'createCheckoutSession'
    );
    const result = await createSession({ tier });
    const url = result.data.url;
    if (!url) throw new Error('No checkout URL returned');
    window.location.assign(url);
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : '';
    const message = err instanceof Error ? err.message : '';
    if (code === 'functions/failed-precondition' || message.includes('PAYMENTS_NOT_CONFIGURED')) {
      throw new PaymentsNotConfiguredError();
    }
    throw err;
  }
}
