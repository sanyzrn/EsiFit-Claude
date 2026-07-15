import { useEffect, useState, useCallback } from 'react';
import { fetchMe, getAuthToken, type ApiUser } from './api-client';
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
  queueMicrotask(() => fn(cachedEntitlements));
  return () => { listeners.delete(fn); };
}

export function getCachedEntitlements(): Entitlements | null {
  return cachedEntitlements;
}

function entitlementsFromUser(user: ApiUser): Entitlements {
  return {
    role: user.role,
    subscriptionTier: user.subscriptionTier,
  };
}

/** Read role/tier from the API (server-trusted). */
export async function fetchEntitlements(): Promise<Entitlements | null> {
  if (!getAuthToken()) return null;

  try {
    const { entitlements } = await fetchMe();
    return entitlements;
  } catch (error) {
    console.error('Failed to fetch entitlements:', error);
    return DEFAULT_ENTITLEMENTS;
  }
}

export async function refreshEntitlements(): Promise<Entitlements | null> {
  if (!fetchPromise) {
    fetchPromise = fetchEntitlements().finally(() => {
      fetchPromise = null;
    });
  }
  const result = await fetchPromise;
  cachedEntitlements = result;
  notifyEntitlements();
  return result;
}

export function setEntitlementsFromUser(user: ApiUser): void {
  cachedEntitlements = entitlementsFromUser(user);
  notifyEntitlements();
}

export function clearEntitlements() {
  cachedEntitlements = null;
  notifyEntitlements();
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(getCachedEntitlements());
  const [loading, setLoading] = useState(
    () => getAuthToken() != null && getCachedEntitlements() == null
  );

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      clearEntitlements();
      return;
    }
    setLoading(true);
    await refreshEntitlements();
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsub = subscribeEntitlements(setEntitlements);

    if (!getAuthToken()) {
      clearEntitlements();
      return unsub;
    }

    if (getCachedEntitlements() == null) {
      void refreshEntitlements().finally(() => setLoading(false));
    }

    return unsub;
  }, [refresh]);

  return {
    entitlements,
    loading,
    role: entitlements?.role ?? 'USER',
    subscriptionTier: entitlements?.subscriptionTier ?? 'FREE',
    refresh,
  };
}
