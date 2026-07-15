import {
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { syncUserFromFirebase } from './store';

/** Sign in or register via Google; creates Firestore user doc on first sign-in. */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const uid = userCredential.user.uid;

  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', uid), {
      email: userCredential.user.email,
      name:
        userCredential.user.displayName ||
        userCredential.user.email?.split('@')[0] ||
        'User',
      role: 'USER',
      subscriptionTier: 'FREE',
      createdAt: new Date().toISOString(),
    });
  }

  await syncUserFromFirebase(uid);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
