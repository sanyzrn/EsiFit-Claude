import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, AlertCircle, Eye, EyeOff, Phone } from 'lucide-react';
import { getState, subscribe, syncUserFromApi } from '@/lib/store';
import {
  loginUser,
  registerUser,
  setAuthToken,
  ApiError,
} from '@/lib/api-client';
import {
  requestPasswordReset,
  resetPassword,
  requestPhoneOtp,
  verifyPhoneOtp,
  getAuthErrorCode,
  mapAuthError,
} from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

function authErrorCode(err: unknown): string {
  if (err instanceof ApiError) return err.code;
  return getAuthErrorCode(err);
}

function PhoneOtpSection({
  mode,
  loading,
  setLoading,
  setError,
  onSuccess,
}: {
  mode: 'login' | 'register';
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string) => void;
  onSuccess: () => void;
}) {
  const { t } = useI18n();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async () => {
    setError('');
    if (!phone) {
      setError(t({ en: 'Phone number is required', fa: 'شماره تلفن الزامی است' }));
      return;
    }
    setLoading(true);
    try {
      await requestPhoneOtp(phone);
      setOtpSent(true);
    } catch (err: unknown) {
      setError(mapAuthError(authErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!code) {
      setError(t({ en: 'Verification code is required', fa: 'کد تأیید الزامی است' }));
      return;
    }
    setLoading(true);
    try {
      const session = await verifyPhoneOtp(phone, code, mode === 'register' ? name : undefined);
      setAuthToken(session.token);
      await syncUserFromApi(session.user, session.token);
      onSuccess();
    } catch (err: unknown) {
      setError(mapAuthError(authErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
      <p className="text-sm text-gray-400 text-center">
        {t({ en: 'Or sign in with phone (SMS)', fa: 'یا ورود با شماره موبایل (پیامک)' })}
      </p>
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Full Name', fa: 'نام کامل' })}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            disabled={loading}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Phone', fa: 'شماره موبایل' })}</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t({ en: '09123456789', fa: '۰۹۱۲۳۴۵۶۷۸۹' })}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            disabled={loading || otpSent}
          />
        </div>
      </div>
      {otpSent && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Verification code', fa: 'کد تأیید' })}</label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t({ en: '123456', fa: '۱۲۳۴۵۶' })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            disabled={loading}
          />
        </div>
      )}
      <button
        type="button"
        onClick={otpSent ? handleVerifyOtp : handleRequestOtp}
        disabled={loading}
        className="w-full py-2.5 bg-gray-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {otpSent
          ? (loading ? t({ en: 'Verifying...', fa: 'در حال تأیید...' }) : t({ en: 'Verify & Sign In', fa: 'تأیید و ورود' }))
          : (loading ? t({ en: 'Sending code...', fa: 'در حال ارسال کد...' }) : t({ en: 'Send SMS Code', fa: 'ارسال کد پیامکی' }))}
      </button>
    </div>
  );
}

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
      const session = await loginUser(email, password);
      setAuthToken(session.token);
      await syncUserFromApi(session.user, session.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(mapAuthError(authErrorCode(err), t));
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
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t({ en: 'you@example.com', fa: 'nama@example.ir' })}
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

          <PhoneOtpSection
            mode="login"
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={() => navigate('/dashboard')}
          />
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
      const session = await registerUser(name, email, password);
      setAuthToken(session.token);
      await syncUserFromApi(session.user, session.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(mapAuthError(authErrorCode(err), t));
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
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t({ en: 'Ali Rezaei', fa: 'علی رضایی' })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" disabled={loading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Email', fa: 'ایمیل' })}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t({ en: 'you@example.com', fa: 'nama@example.ir' })}
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
            </div>
            <button type="submit" className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? t({ en: 'Creating account...', fa: 'در حال ایجاد حساب...' }) : t({ en: 'Create Account', fa: 'ایجاد حساب' })}
            </button>
          </form>

          <PhoneOtpSection
            mode="register"
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={() => navigate('/dashboard')}
          />
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
      setError(mapAuthError(authErrorCode(err), t));
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
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t({ en: 'you@example.com', fa: 'nama@example.ir' })}
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

export function ResetPassword() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError(t({ en: 'Invalid reset link', fa: 'لینک بازیابی نامعتبر است' }));
      return;
    }
    if (password.length < 6) {
      setError(t({ en: 'Password must be at least 6 characters', fa: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }));
      return;
    }
    if (password !== confirm) {
      setError(t({ en: 'Passwords do not match', fa: 'رمزهای عبور یکسان نیستند' }));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      setError(mapAuthError(authErrorCode(err), t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black">{t({ en: 'Set New Password', fa: 'رمز عبور جدید' })}</h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
          {done ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-gray-300">{t({ en: 'Your password has been updated.', fa: 'رمز عبور شما به‌روزرسانی شد.' })}</p>
              <Link to="/login" className="inline-block py-2 px-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
                {t({ en: 'Sign In', fa: 'ورود' })}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'New password', fa: 'رمز عبور جدید' })}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t({ en: 'Confirm password', fa: 'تأیید رمز عبور' })}</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none" disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                {loading ? t({ en: 'Updating...', fa: 'در حال به‌روزرسانی...' }) : t({ en: 'Update Password', fa: 'به‌روزرسانی رمز' })}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
