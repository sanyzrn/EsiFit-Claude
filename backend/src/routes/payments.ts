import { Router, raw } from 'express';
import Stripe from 'stripe';
import { config, paymentsConfigured, type SubscriptionTier, TIERS } from '../config.js';
import { query } from '../db.js';
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

export const paymentsRouter = Router();

paymentsRouter.get('/status', (_req, res) => {
  res.json({ enabled: paymentsConfigured() });
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

    const priceId = priceIdForTier(tier as SubscriptionTier);
    const stripe = stripeClient();
    if (!priceId || !stripe) {
      res.status(412).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.auth!.email,
      client_reference_id: req.auth!.sub,
      metadata: { userId: req.auth!.sub, subscriptionTier: tier },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.appUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${config.appUrl}/pricing?checkout=cancelled`,
    });

    if (!session.url) {
      res.status(500).json({ error: 'CHECKOUT_FAILED' });
      return;
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error('checkout error:', err);
    res.status(500).json({ error: 'INTERNAL' });
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
