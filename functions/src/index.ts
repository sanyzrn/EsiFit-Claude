import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  onDocumentWritten,
  FirestoreEvent,
  Change,
  DocumentSnapshot,
} from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "us-central1" });

initializeApp();

const ROLES = ["USER", "COACH", "ADMIN"] as const;
const TIERS = ["FREE", "ECONOMY", "VIP", "ELITE"] as const;

type Role = (typeof ROLES)[number];
type SubscriptionTier = (typeof TIERS)[number];

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function isTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
}

/** Sync Firestore role/tier to Firebase Auth custom claims on every user write. */
export const syncUserClaims = onDocumentWritten(
  "users/{userId}",
  async (event: FirestoreEvent<Change<DocumentSnapshot> | undefined>) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const data = after.data();
    const uid = event.params.userId;
    const role: Role = isRole(data?.role) ? data.role : "USER";
    const subscriptionTier: SubscriptionTier = isTier(data?.subscriptionTier)
      ? data.subscriptionTier
      : "FREE";

    await getAuth().setCustomUserClaims(uid, { role, subscriptionTier });
  }
);

/** Admin-only callable to set role/tier via Admin SDK (trusted write path). */
export const setUserEntitlements = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const callerRole = request.auth.token.role;
  if (callerRole !== "ADMIN") {
    throw new HttpsError("permission-denied", "Admin role required.");
  }

  const { userId, role, subscriptionTier } = request.data ?? {};
  if (typeof userId !== "string" || !userId) {
    throw new HttpsError("invalid-argument", "userId is required.");
  }
  if (!isRole(role)) {
    throw new HttpsError("invalid-argument", "Invalid role.");
  }
  if (!isTier(subscriptionTier)) {
    throw new HttpsError("invalid-argument", "Invalid subscriptionTier.");
  }

  const db = getFirestore();
  const ref = db.doc(`users/${userId}`);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "User document not found.");
  }

  await ref.update({ role, subscriptionTier, updatedAt: FieldValue.serverTimestamp() });

  return { ok: true, userId, role, subscriptionTier };
});

/**
 * Dev/manual webhook stub — use stripeWebhook in production.
 * Protected by X-Webhook-Secret header (set WEBHOOK_SECRET in Functions config).
 */
export const paymentWebhookStub = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const expectedSecret = process.env.WEBHOOK_SECRET;
  const providedSecret = req.headers["x-webhook-secret"];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { userId, subscriptionTier } = req.body ?? {};
  if (typeof userId !== "string" || !userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  if (!isTier(subscriptionTier)) {
    res.status(400).json({ error: "Invalid subscriptionTier" });
    return;
  }

  const db = getFirestore();
  const ref = db.doc(`users/${userId}`);
  const snap = await ref.get();
  if (!snap.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await ref.update({ subscriptionTier, updatedAt: FieldValue.serverTimestamp() });
  res.json({ ok: true, userId, subscriptionTier });
});

export {
  getPaymentsStatus,
  createCheckoutSession,
  stripeWebhook,
} from "./payments";
