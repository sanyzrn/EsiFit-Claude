import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getState, subscribe, syncUserFromFirebase } from '@/lib/store';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { signInWithGoogle, requestPasswordReset, getAuthErrorCode, mapAuthError } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export function Login() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [state, setState] = useState(getState());

  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  useEffect(() => { if (state.currentUser) navigate('/dashboard'); }, [state.currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError(t({ en: 'Email is required', fa: 'ایمیل الزامی است' })); return; }
    if (!password) { setError(t({ en: 'Password is required', fa: 'رمز عبور الزامی است' })); return; }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserFromFirebase(userCredential.user.uid);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(mapAuthError(getAuthErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(mapAuthError(getAuthErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black">{t({ en: 'Welcome Back', fa: 'خوش آمدید' })}</h1>
          <p className="text-gray-400 text-sm mt-1">{t({ en: 'Sign in to your EsiFit account', fa: 'به حساب اسی‌فیت خود وارد شوید' })}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Email', fa: 'ایمیل' })}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" disabled={loading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Password', fa: 'رمز عبور' })}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" disabled={loading} />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? t({ en: 'Signing in...', fa: 'در حال ورود...' }) : t({ en: 'Sign In', fa: 'ورود' })}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300">{t({ en: 'Forgot password?', fa: 'رمز عبور را فراموش کرده‌اید؟' })}</Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <button onClick={handleGoogleSignIn} disabled={loading} className="w-full py-2.5 bg-gray-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t({ en: 'Sign in with Google', fa: 'ورود با گوگل' })}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t({ en: "Don't have an account?", fa: 'حساب کاربری ندارید؟' })}{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">{t({ en: 'Sign up', fa: 'ثبت‌نام' })}</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [state, setState] = useState(getState());

  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  useEffect(() => { if (state.currentUser) navigate('/dashboard'); }, [state.currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name) { setError(t({ en: 'Name is required', fa: 'نام الزامی است' })); return; }
    if (!email) { setError(t({ en: 'Email is required', fa: 'ایمیل الزامی است' })); return; }
    if (password.length < 6) { setError(t({ en: 'Password must be at least 6 characters', fa: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })); return; }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        name: name,
        role: 'USER',
        subscriptionTier: 'FREE',
        createdAt: new Date().toISOString()
      });

      await syncUserFromFirebase(userCredential.user.uid);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(mapAuthError(getAuthErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(mapAuthError(getAuthErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black">{t({ en: 'Create Your Account', fa: 'حساب خود را بسازید' })}</h1>
          <p className="text-gray-400 text-sm mt-1">{t({ en: 'Start your fitness journey with EsiFit', fa: 'سفر تناسب اندام خود را با اسی‌فیت آغاز کنید' })}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Full Name', fa: 'نام کامل' })}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" disabled={loading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Email', fa: 'ایمیل' })}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" disabled={loading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Password', fa: 'رمز عبور' })}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t({ en: 'Min. 6 characters', fa: 'حداقل ۶ کاراکتر' })}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  aria-label={showPassword ? t({ en: 'Hide password', fa: 'مخفی کردن رمز' }) : t({ en: 'Show password', fa: 'نمایش رمز' })}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <p
                  className={`text-xs mt-1 ${password.length < 6 ? 'text-red-400' : password.length < 10 ? 'text-yellow-400' : 'text-green-400'}`}
                  aria-live="polite"
                >
                  {password.length < 6
                    ? t({ en: 'Too short (min. 6 characters)', fa: 'کوتاه است (حداقل ۶ کاراکتر)' })
                    : password.length < 10
                      ? t({ en: 'Fair strength', fa: 'قدرت متوسط' })
                      : t({ en: 'Strong password', fa: 'رمز قوی' })}
                </p>
              )}
            </div>
            <button type="submit" className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? t({ en: 'Creating account...', fa: 'در حال ایجاد حساب...' }) : t({ en: 'Create Account', fa: 'ایجاد حساب' })}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <button onClick={handleGoogleSignUp} disabled={loading} className="w-full py-2.5 bg-gray-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t({ en: 'Sign up with Google', fa: 'ثبت‌نام با گوگل' })}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t({ en: 'Already have an account?', fa: 'قبلاً حساب دارید؟' })}{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">{t({ en: 'Sign in', fa: 'ورود' })}</Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError(t({ en: 'Email is required', fa: 'ایمیل الزامی است' }));
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      setError(mapAuthError(getAuthErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black">{t({ en: 'Reset Password', fa: 'بازیابی رمز عبور' })}</h1>
          <p className="text-gray-400 text-sm mt-1">{t({ en: 'Enter your email to receive a reset link', fa: 'ایمیل خود را برای دریافت لینک بازیابی وارد کنید' })}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-bold text-lg mb-2">{t({ en: 'Check your email', fa: 'ایمیل خود را بررسی کنید' })}</h3>
              <p className="text-gray-400 text-sm">{t({ en: `We've sent a password reset link to ${email}`, fa: `لینک بازیابی رمز عبور به ${email} ارسال شد` })}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Email', fa: 'ایمیل' })}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none" disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                {loading ? t({ en: 'Sending...', fa: 'در حال ارسال...' }) : t({ en: 'Send Reset Link', fa: 'ارسال لینک بازیابی' })}
              </button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white">{t({ en: '← Back to sign in', fa: '← بازگشت به ورود' })}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
