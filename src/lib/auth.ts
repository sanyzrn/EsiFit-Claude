import {
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { syncUserFromFirebase } from './store';

type LocalizedMessage = { en: string; fa: string };
type TranslateFn = (message: LocalizedMessage) => string;

export function getAuthErrorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return '';
}

export function mapAuthError(code: string, t: TranslateFn): string {
  const messages: Record<string, LocalizedMessage> = {
    'auth/invalid-credential': { en: 'Invalid email or password', fa: 'ایمیل یا رمز عبور نامعتبر است' },
    'auth/user-not-found': { en: 'No account found with this email', fa: 'حسابی با این ایمیل یافت نشد' },
    'auth/wrong-password': { en: 'Incorrect password', fa: 'رمز عبور اشتباه است' },
    'auth/email-already-in-use': { en: 'Email already registered', fa: 'این ایمیل قبلاً ثبت شده است' },
    'auth/weak-password': { en: 'Password is too weak', fa: 'رمز عبور ضعیف است' },
    'auth/invalid-email': { en: 'Invalid email address', fa: 'آدرس ایمیل نامعتبر است' },
    'auth/too-many-requests': { en: 'Too many attempts. Try again later', fa: 'تلاش‌های زیاد. بعداً دوباره امتحان کنید' },
    'auth/popup-closed-by-user': { en: 'Sign-in popup was closed', fa: 'پنجره ورود بسته شد' },
    'auth/network-request-failed': { en: 'Network error. Check your connection', fa: 'خطای شبکه. اتصال خود را بررسی کنید' },
  };

  return t(messages[code] ?? { en: 'Something went wrong. Please try again.', fa: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' });
}

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
