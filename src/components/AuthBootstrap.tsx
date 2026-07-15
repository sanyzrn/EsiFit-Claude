import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncUserFromFirebase, getState, logout as storeLogout } from '@/lib/store';
import { refreshEntitlements, clearEntitlements } from '@/lib/entitlements';

/** Bootstrap Firebase auth → store sync on app load and auth changes. */
export function AuthBootstrap() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await syncUserFromFirebase(user.uid);
        await refreshEntitlements(true);
      } else {
        const state = getState();
        if (state.currentUser) {
          await storeLogout();
        }
        clearEntitlements();
      }
    });
    return unsub;
  }, []);

  return null;
}
