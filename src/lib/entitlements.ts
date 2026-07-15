import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Role, SubscriptionTier } from './types';

export interface Entitlements {
  role: Role;
  subscriptionTier: SubscriptionTier;
}

const DEFAULT_ENTITLEMENTS: Entitlements = {
  role: 'USER',
  subscriptionTier: 'FREE',
};

type Listener = (entitlements: Entitlements | null) => void;
const listeners = new Set<Listener>();

let cachedEntitlements: Entitlements | null = null;
let fetchPromise: Promise<Entitlements | null> | null = null;

function notifyEntitlements() {
  listeners.forEach((fn) => fn(cachedEntitlements));
}

export function subscribeEntitlements(fn: Listener): () => void {
  listeners.add(fn);
  fn(cachedEntitlements);
  return () => { listeners.delete(fn); };
}

export function getCachedEntitlements(): Entitlements | null {
  return cachedEntitlements;
}

/** Read role/tier from custom claims, falling back to a live Firestore read. */
export async function fetchEntitlements(
  firebaseUser?: FirebaseUser | null,
  forceRefresh = false
): Promise<Entitlements | null> {
  const user = firebaseUser ?? auth.currentUser;
  if (!user) return null;

  try {
    const token = await user.getIdTokenResult(forceRefresh);
    const role = token.claims.role;
    const tier = token.claims.subscriptionTier;
    if (
      typeof role === 'string' && ['USER', 'COACH', 'ADMIN'].includes(role) &&
      typeof tier === 'string' && ['FREE', 'ECONOMY', 'VIP', 'ELITE'].includes(tier)
    ) {
      return { role: role as Role, subscriptionTier: tier as SubscriptionTier };
    }
  } catch (error) {
    console.error('Failed to read custom claims:', error);
  }

  try {
    const snap = await getDocFromServer(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      const role = data.role;
      const tier = data.subscriptionTier;
      return {
        role: (typeof role === 'string' && ['USER', 'COACH', 'ADMIN'].includes(role)
          ? role : 'USER') as Role,
        subscriptionTier: (typeof tier === 'string' && ['FREE', 'ECONOMY', 'VIP', 'ELITE'].includes(tier)
          ? tier : 'FREE') as SubscriptionTier,
      };
    }
  } catch (error) {
    console.error('Failed to read Firestore entitlements:', error);
  }

  return DEFAULT_ENTITLEMENTS;
}

export async function refreshEntitlements(forceRefresh = true): Promise<Entitlements | null> {
  if (!fetchPromise) {
    fetchPromise = fetchEntitlements(auth.currentUser, forceRefresh).finally(() => {
      fetchPromise = null;
    });
  }
  const result = await fetchPromise;
  cachedEntitlements = result;
  notifyEntitlements();
  return result;
}

export function clearEntitlements() {
  cachedEntitlements = null;
  notifyEntitlements();
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(getCachedEntitlements());
  const [loading, setLoading] = useState(auth.currentUser != null && entitlements == null);

  const refresh = useCallback(async () => {
    if (!auth.currentUser) {
      setEntitlements(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const next = await refreshEntitlements(true);
    setEntitlements(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubEntitlements = subscribeEntitlements(setEntitlements);
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearEntitlements();
        setEntitlements(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const next = await refreshEntitlements(true);
      setEntitlements(next);
      setLoading(false);
    });
    return () => {
      unsubEntitlements();
      unsubAuth();
    };
  }, []);

  return {
    entitlements,
    loading,
    role: entitlements?.role ?? 'USER',
    subscriptionTier: entitlements?.subscriptionTier ?? 'FREE',
    refresh,
  };
}
