import { Router, raw } from 'express';
import Stripe from 'stripe';
import {
  config,
  paymentsConfigured,
  resolvePaymentProvider,
  stripeConfigured,
  type PaymentProvider,
  type SubscriptionTier,
  TIERS,
} from '../config.js';
import { query, generateId } from '../db.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

function stripeClient(): Stripe | null {
  if (!config.stripe.secretKey) return null;
  return new Stripe(config.stripe.secretKey);
}

function priceIdForTier(tier: SubscriptionTier): string | undefined {
  const map: Record<SubscriptionTier, string | undefined> = {
    FREE: undefined,
    ECONOMY: config.stripe.priceEconomy,
    VIP: config.stripe.priceVip,
    ELITE: config.stripe.priceElite,
  };
  return map[tier];
}

function tomanForTier(tier: SubscriptionTier): number {
  if (tier === 'FREE') return 0;
  return config.planPricesTomans[tier];
}

async function setUserTier(userId: string, tier: SubscriptionTier, extra?: { authority?: string; provider?: string }) {
  await query(
    `UPDATE users SET subscription_tier = $2 WHERE id = $1`,
    [userId, tier]
  );
  if (extra?.authority) {
    console.info(`[payments] tier ${tier} for ${userId} via ${extra.provider} authority=${extra.authority}`);
  }
}

// ─── Zarinpal ───────────────────────────────────────────────

const zarinpalBase = () =>
  config.zarinpal.sandbox
    ? 'https://sandbox.zarinpal.com/pg/v4/payment'
    : 'https://api.zarinpal.com/pg/v4/payment';

const zarinpalStartPay = (authority: string) =>
  config.zarinpal.sandbox
    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
    : `https://www.zarinpal.com/pg/StartPay/${authority}`;

async function zarinpalRequest(params: {
  amountTomans: number;
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}): Promise<{ authority: string; url: string }> {
  // Zarinpal API expects Rials (1 Toman = 10 Rials)
  const amountRials = params.amountTomans * 10;
  const res = await fetch(`${zarinpalBase()}/request.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: config.zarinpal.merchantId,
      amount: amountRials,
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: {
        email: params.email,
        mobile: params.mobile,
      },
    }),
  });
  const data = await res.json() as {
    data?: { authority?: string; code?: number };
    errors?: unknown;
  };
  const authority = data.data?.authority;
  if (!authority || data.data?.code !== 100) {
    console.error('Zarinpal request failed:', data);
    throw new Error('ZARINPAL_REQUEST_FAILED');
  }
  return { authority, url: zarinpalStartPay(authority) };
}

async function zarinpalVerify(authority: string, amountTomans: number): Promise<boolean> {
  const res = await fetch(`${zarinpalBase()}/verify.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: config.zarinpal.merchantId,
      amount: amountTomans * 10,
      authority,
    }),
  });
  const data = await res.json() as { data?: { code?: number } };
  const code = data.data?.code;
  return code === 100 || code === 101;
}

// ─── IDPay ──────────────────────────────────────────────────

async function idpayRequest(params: {
  orderId: string;
  amountTomans: number;
  callbackUrl: string;
  name?: string;
  phone?: string;
}): Promise<{ id: string; url: string }> {
  // IDPay expects Rials
  const res = await fetch('https://api.idpay.ir/v1.1/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': config.idpay.apiKey!,
      'X-SANDBOX': config.idpay.sandbox ? '1' : '0',
    },
    body: JSON.stringify({
      order_id: params.orderId,
      amount: params.amountTomans * 10,
      callback: params.callbackUrl,
      name: params.name,
      phone: params.phone,
    }),
  });
  const data = await res.json() as { id?: string; link?: string; error_code?: number };
  if (!data.id || !data.link) {
    console.error('IDPay request failed:', data);
    throw new Error('IDPAY_REQUEST_FAILED');
  }
  return { id: data.id, url: data.link };
}

async function idpayVerify(id: string, orderId: string): Promise<boolean> {
  const res = await fetch('https://api.idpay.ir/v1.1/payment/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': config.idpay.apiKey!,
      'X-SANDBOX': config.idpay.sandbox ? '1' : '0',
    },
    body: JSON.stringify({ id, order_id: orderId }),
  });
  const data = await res.json() as { status?: number; error_code?: number };
  // status 100 = paid & verified
  return data.status === 100;
}

// Pending payment memory (demo; production should use DB table)
const pendingPayments = new Map<string, {
  userId: string;
  tier: SubscriptionTier;
  amountTomans: number;
  provider: PaymentProvider;
  orderId?: string;
}>();

export const paymentsRouter = Router();

paymentsRouter.get('/status', (_req, res) => {
  const provider = resolvePaymentProvider();
  res.json({ enabled: provider !== 'none', provider });
});

paymentsRouter.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!paymentsConfigured()) {
      res.status(412).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
      return;
    }

    const { tier } = req.body ?? {};
    if (!tier || !TIERS.includes(tier) || tier === 'FREE') {
      res.status(400).json({ error: 'INVALID_TIER' });
      return;
    }

    const provider = resolvePaymentProvider();
    const userId = req.auth!.sub;
    const amountTomans = tomanForTier(tier as SubscriptionTier);

    if (provider === 'zarinpal') {
      try {
        const apiCallback = process.env.API_PUBLIC_URL
          ? `${process.env.API_PUBLIC_URL}/api/payments/zarinpal/callback`
          : `http://localhost:${config.port}/api/payments/zarinpal/callback`;

        const { authority, url } = await zarinpalRequest({
          amountTomans,
          description: `EsiFit ${tier} subscription`,
          callbackUrl: apiCallback,
          email: req.auth!.email,
        });
        pendingPayments.set(authority, { userId, tier: tier as SubscriptionTier, amountTomans, provider: 'zarinpal' });
        res.json({ url, provider: 'zarinpal' });
        return;
      } catch (err) {
        console.error('Zarinpal checkout failed, trying IDPay:', err);
        if (!config.idpay.apiKey) throw err;
      }
    }

    if (provider === 'idpay' || (provider === 'zarinpal' && config.idpay.apiKey)) {
      const orderId = generateId('ord');
      const apiCallback = process.env.API_PUBLIC_URL
        ? `${process.env.API_PUBLIC_URL}/api/payments/idpay/callback`
        : `http://localhost:${config.port}/api/payments/idpay/callback`;
      const { id, url } = await idpayRequest({
        orderId,
        amountTomans,
        callbackUrl: apiCallback,
        name: req.auth!.email,
      });
      pendingPayments.set(id, {
        userId,
        tier: tier as SubscriptionTier,
        amountTomans,
        provider: 'idpay',
        orderId,
      });
      res.json({ url, provider: 'idpay' });
      return;
    }

    if (provider === 'stripe' || stripeConfigured()) {
      const priceId = priceIdForTier(tier as SubscriptionTier);
      const stripe = stripeClient();
      if (!priceId || !stripe) {
        res.status(412).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
        return;
      }
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: req.auth!.email,
        client_reference_id: userId,
        metadata: { userId, subscriptionTier: tier },
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${config.appUrl}/dashboard/billing?checkout=success`,
        cancel_url: `${config.appUrl}/pricing?checkout=cancelled`,
      });
      if (!session.url) {
        res.status(500).json({ error: 'CHECKOUT_FAILED' });
        return;
      }
      res.json({ url: session.url, provider: 'stripe' });
      return;
    }

    res.status(412).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
  } catch (err) {
    console.error('checkout error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

paymentsRouter.get('/zarinpal/callback', async (req, res) => {
  try {
    const authority = String(req.query.Authority ?? '');
    const status = String(req.query.Status ?? '');
    const pending = pendingPayments.get(authority);

    if (status === 'OK' && pending) {
      const ok = await zarinpalVerify(authority, pending.amountTomans);
      if (ok) {
        await setUserTier(pending.userId, pending.tier, { authority, provider: 'zarinpal' });
        pendingPayments.delete(authority);
        res.redirect(`${config.appUrl}/dashboard/billing?checkout=success`);
        return;
      }
    }
    pendingPayments.delete(authority);
    res.redirect(`${config.appUrl}/pricing?checkout=failed`);
  } catch (err) {
    console.error('zarinpal callback error:', err);
    res.redirect(`${config.appUrl}/pricing?checkout=failed`);
  }
});

paymentsRouter.post('/idpay/callback', async (req, res) => {
  try {
    const id = String(req.body?.id ?? req.query.id ?? '');
    const orderId = String(req.body?.order_id ?? req.query.order_id ?? '');
    const status = Number(req.body?.status ?? req.query.status ?? 0);
    const pending = pendingPayments.get(id);

    if (status === 10 && pending && pending.orderId === orderId) {
      const ok = await idpayVerify(id, orderId);
      if (ok) {
        await setUserTier(pending.userId, pending.tier, { authority: id, provider: 'idpay' });
        pendingPayments.delete(id);
        res.redirect(`${config.appUrl}/dashboard/billing?checkout=success`);
        return;
      }
    }
    pendingPayments.delete(id);
    res.redirect(`${config.appUrl}/pricing?checkout=failed`);
  } catch (err) {
    console.error('idpay callback error:', err);
    res.redirect(`${config.appUrl}/pricing?checkout=failed`);
  }
});

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  '/',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const stripe = stripeClient();
    const webhookSecret = config.stripe.webhookSecret;
    if (!stripe || !webhookSecret) {
      res.status(503).json({ error: 'Stripe not configured' });
      return;
    }

    const sig = req.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).send(`Webhook Error: ${message}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId || session.client_reference_id;
          const tier = session.metadata?.subscriptionTier;
          if (typeof userId === 'string' && typeof tier === 'string' && TIERS.includes(tier as SubscriptionTier)) {
            const updates: string[] = ['subscription_tier = $2'];
            const params: unknown[] = [userId, tier];
            if (session.customer && typeof session.customer === 'string') {
              updates.push('stripe_customer_id = $3');
              params.push(session.customer);
            }
            await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $1`, params);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId =
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer?.id;
          if (customerId) {
            await query(
              `UPDATE users SET subscription_tier = 'FREE' WHERE stripe_customer_id = $1`,
              [customerId]
            );
          }
          break;
        }
        default:
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error('stripeWebhook handler error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);
