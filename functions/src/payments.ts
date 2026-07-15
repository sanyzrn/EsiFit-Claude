import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import Stripe from "stripe";

const TIERS = ["FREE", "ECONOMY", "VIP", "ELITE"] as const;
type SubscriptionTier = (typeof TIERS)[number];

function isTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
}

function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

function paymentsConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_ECONOMY &&
      process.env.STRIPE_PRICE_VIP &&
      process.env.STRIPE_PRICE_ELITE
  );
}

function priceIdForTier(tier: SubscriptionTier): string | undefined {
  const map: Record<SubscriptionTier, string | undefined> = {
    FREE: undefined,
    ECONOMY: process.env.STRIPE_PRICE_ECONOMY,
    VIP: process.env.STRIPE_PRICE_VIP,
    ELITE: process.env.STRIPE_PRICE_ELITE,
  };
  return map[tier];
}

export const getPaymentsStatus = onCall(async () => {
  return { enabled: paymentsConfigured() };
});

/** Create a Stripe Checkout session for a paid tier (server-trusted path). */
export const createCheckoutSession = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  if (!paymentsConfigured()) {
    throw new HttpsError("failed-precondition", "PAYMENTS_NOT_CONFIGURED");
  }

  const { tier } = request.data ?? {};
  if (!isTier(tier) || tier === "FREE") {
    throw new HttpsError("invalid-argument", "Invalid subscription tier.");
  }

  const priceId = priceIdForTier(tier);
  if (!priceId) {
    throw new HttpsError("failed-precondition", "PAYMENTS_NOT_CONFIGURED");
  }

  const stripe = stripeClient();
  if (!stripe) {
    throw new HttpsError("failed-precondition", "PAYMENTS_NOT_CONFIGURED");
  }

  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const uid = request.auth.uid;
  const email = request.auth.token.email ?? undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    client_reference_id: uid,
    metadata: { userId: uid, subscriptionTier: tier },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
  });

  if (!session.url) {
    throw new HttpsError("internal", "Failed to create checkout session.");
  }

  return { url: session.url };
});

/** Stripe webhook — verifies signature and updates user tier server-side. */
export const stripeWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const stripe = stripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    res.status(400).send("Missing stripe-signature header");
    return;
  }

  let event: Stripe.Event;
  try {
    const rawBody = (req as { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      res.status(400).send("Missing raw body");
      return;
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  const db = getFirestore();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const tier = session.metadata?.subscriptionTier;
        if (typeof userId === "string" && isTier(tier)) {
          const updates: Record<string, unknown> = {
            subscriptionTier: tier,
            updatedAt: FieldValue.serverTimestamp(),
          };
          if (session.customer && typeof session.customer === "string") {
            updates.stripeCustomerId = session.customer;
          }
          await db.doc(`users/${userId}`).update(updates);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        if (customerId) {
          const users = await db
            .collection("users")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get();
          if (!users.empty) {
            await users.docs[0].ref.update({
              subscriptionTier: "FREE",
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("stripeWebhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});
