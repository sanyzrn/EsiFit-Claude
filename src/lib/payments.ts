import { apiFetch } from './api-client';
import type { SubscriptionTier } from './types';

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super('PAYMENTS_NOT_CONFIGURED');
    this.name = 'PaymentsNotConfiguredError';
  }
}

let cachedStatus: boolean | null = null;

/** Whether Stripe checkout is configured server-side. */
export async function fetchPaymentsEnabled(): Promise<boolean> {
  if (cachedStatus !== null) return cachedStatus;
  try {
    const result = await apiFetch<{ enabled: boolean }>('/payments/status');
    cachedStatus = Boolean(result.enabled);
    return cachedStatus;
  } catch {
    cachedStatus = false;
    return false;
  }
}

/** Redirect to Stripe Checkout for a paid tier. */
export async function startCheckout(tier: SubscriptionTier): Promise<void> {
  if (tier === 'FREE') {
    throw new Error('Cannot checkout FREE tier');
  }
  try {
    const result = await apiFetch<{ url: string }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
    if (!result.url) throw new Error('No checkout URL returned');
    window.location.assign(result.url);
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : '';
    if (code === 'PAYMENTS_NOT_CONFIGURED') {
      throw new PaymentsNotConfiguredError();
    }
    throw err;
  }
}
