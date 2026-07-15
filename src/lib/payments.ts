/**
 * Iranian payment providers + optional Stripe.
 * Plans store priceMonthly as integer Tomans.
 */
import { apiFetch } from './api-client';
import type { SubscriptionTier } from './types';

export type PaymentProvider = 'zarinpal' | 'idpay' | 'stripe' | 'none';

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super('PAYMENTS_NOT_CONFIGURED');
    this.name = 'PaymentsNotConfiguredError';
  }
}

let cachedStatus: { enabled: boolean; provider: PaymentProvider } | null = null;

export async function fetchPaymentsStatus(): Promise<{ enabled: boolean; provider: PaymentProvider }> {
  if (cachedStatus) return cachedStatus;
  try {
    const result = await apiFetch<{ enabled: boolean; provider?: PaymentProvider }>('/payments/status');
    cachedStatus = {
      enabled: Boolean(result.enabled),
      provider: result.provider ?? 'none',
    };
    return cachedStatus;
  } catch {
    cachedStatus = { enabled: false, provider: 'none' };
    return cachedStatus;
  }
}

/** @deprecated Prefer fetchPaymentsStatus */
export async function fetchPaymentsEnabled(): Promise<boolean> {
  const s = await fetchPaymentsStatus();
  return s.enabled;
}

/** Start checkout — redirects to Zarinpal / IDPay / Stripe as configured server-side. */
export async function startCheckout(tier: SubscriptionTier): Promise<void> {
  if (tier === 'FREE') {
    throw new Error('Cannot checkout FREE tier');
  }
  try {
    const result = await apiFetch<{ url: string; provider?: PaymentProvider }>('/payments/checkout', {
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

export function clearPaymentsCache(): void {
  cachedStatus = null;
}
