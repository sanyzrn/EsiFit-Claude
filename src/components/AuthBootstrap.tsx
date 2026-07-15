import { useEffect } from 'react';
import { bootstrapSession, getState, logout as storeLogout } from '@/lib/store';
import { getAuthToken } from '@/lib/api-client';
import { clearEntitlements } from '@/lib/entitlements';

/** Bootstrap API session → store sync on app load. */
export function AuthBootstrap() {
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      const state = getState();
      if (state.currentUser) {
        void storeLogout();
      }
      clearEntitlements();
      return;
    }

    void bootstrapSession();
  }, []);

  return null;
}
