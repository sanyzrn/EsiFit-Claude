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
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    <div className="mt-6 pt-6 border-t border-border space-y-4">
      <p className="text-sm text-fg-subtle text-center">
        {t({ en: 'Or sign in with phone (SMS)', fa: 'یا ورود با شماره موبایل (پیامک)' })}
      </p>
      {mode === 'register' && (
        <InputField
          label={t({ en: 'Full Name', fa: 'نام کامل' })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      )}
      <InputField
        label={t({ en: 'Phone', fa: 'شماره موبایل' })}
        type="tel"
        icon={<Phone />}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t({ en: '09123456789', fa: '۰۹۱۲۳۴۵۶۷۸۹' })}
        disabled={loading || otpSent}
      />
      {otpSent && (
        <InputField
          label={t({ en: 'Verification code', fa: 'کد تأیید' })}
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t({ en: '123456', fa: '۱۲۳۴۵۶' })}
          disabled={loading}
        />
      )}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={otpSent ? handleVerifyOtp : handleRequestOtp}
        disabled={loading}
      >
        {otpSent
          ? (loading ? t({ en: 'Verifying...', fa: 'در حال تأیید...' }) : t({ en: 'Verify & Sign In', fa: 'تأیید و ورود' }))
          : (loading ? t({ en: 'Sending code...', fa: 'در حال ارسال کد...' }) : t({ en: 'Send SMS Code', fa: 'ارسال کد پیامکی' }))}
      </Button>
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
          <div className="w-14 h-14 mx-auto rounded-[20px] bg-brand text-brand-fg flex items-center justify-center mb-4">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black">{t({ en: 'Welcome Back', fa: 'خوش آمدید' })}</h1>
          <p className="text-fg-subtle text-sm mt-1">{t({ en: 'Sign in to your EsiFit account', fa: 'به حساب اسی‌فیت خود وارد شوید' })}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-[12px] text-danger text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <InputField
              label={t({ en: 'Email', fa: 'ایمیل' })}
              type="email"
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t({ en: 'you@example.com', fa: 'nama@example.ir' })}
              disabled={loading}
            />
            <InputField
              label={t({ en: 'Password', fa: 'رمز عبور' })}
              type="password"
              icon={<Lock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? t({ en: 'Signing in...', fa: 'در حال ورود...' }) : t({ en: 'Sign In', fa: 'ورود' })}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-fg-subtle">
            <Link to="/forgot-password" className="text-brand hover:text-brand-dark">{t({ en: 'Forgot password?', fa: 'رمز عبور را فراموش کرده‌اید؟' })}</Link>
          </div>

          <PhoneOtpSection
            mode="login"
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={() => navigate('/dashboard')}
          />
        </Card>

        <p className="text-center text-sm text-fg-subtle mt-6">
          {t({ en: "Don't have an account?", fa: 'حساب کاربری ندارید؟' })}{' '}
          <Link to="/register" className="text-brand hover:text-brand-dark font-medium">{t({ en: 'Sign up', fa: 'ثبت‌نام' })}</Link>
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
          <div className="w-14 h-14 mx-auto rounded-[20px] bg-brand text-brand-fg flex items-center justify-center mb-4">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black">{t({ en: 'Create Your Account', fa: 'حساب خود را بسازید' })}</h1>
          <p className="text-fg-subtle text-sm mt-1">{t({ en: 'Start your fitness journey with EsiFit', fa: 'سفر تناسب اندام خود را با اسی‌فیت آغاز کنید' })}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-[12px] text-danger text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <InputField
              label={t({ en: 'Full Name', fa: 'نام کامل' })}
              type="text"
              icon={<User />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t({ en: 'Ali Rezaei', fa: 'علی رضایی' })}
              disabled={loading}
            />
            <InputField
              label={t({ en: 'Email', fa: 'ایمیل' })}
              type="email"
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t({ en: 'you@example.com', fa: 'nama@example.ir' })}
              disabled={loading}
            />
            <InputField
              label={t({ en: 'Password', fa: 'رمز عبور' })}
              type={showPassword ? 'text' : 'password'}
              icon={<Lock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t({ en: 'Min. 6 characters', fa: 'حداقل ۶ کاراکتر' })}
              disabled={loading}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="text-fg-subtle hover:text-fg-muted"
                  aria-label={showPassword ? t({ en: 'Hide password', fa: 'مخفی کردن رمز' }) : t({ en: 'Show password', fa: 'نمایش رمز' })}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
              hint={password.length > 0 ? (
                <span className={password.length < 6 ? 'text-danger' : password.length < 10 ? 'text-warning' : 'text-success'}>
                  {password.length < 6
                    ? t({ en: 'Too short (min. 6 characters)', fa: 'کوتاه است (حداقل ۶ کاراکتر)' })
                    : password.length < 10
                      ? t({ en: 'Fair strength', fa: 'قدرت متوسط' })
                      : t({ en: 'Strong password', fa: 'رمز قوی' })}
                </span>
              ) : undefined}
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? t({ en: 'Creating account...', fa: 'در حال ایجاد حساب...' }) : t({ en: 'Create Account', fa: 'ایجاد حساب' })}
            </Button>
          </form>

          <PhoneOtpSection
            mode="register"
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={() => navigate('/dashboard')}
          />
        </Card>

        <p className="text-center text-sm text-fg-subtle mt-6">
          {t({ en: 'Already have an account?', fa: 'قبلاً حساب دارید؟' })}{' '}
          <Link to="/login" className="text-brand hover:text-brand-dark font-medium">{t({ en: 'Sign in', fa: 'ورود' })}</Link>
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
          <p className="text-fg-subtle text-sm mt-1">{t({ en: 'Enter your email to receive a reset link', fa: 'ایمیل خود را برای دریافت لینک بازیابی وارد کنید' })}</p>
        </div>
        <Card>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-bold text-lg mb-2">{t({ en: 'Check your email', fa: 'ایمیل خود را بررسی کنید' })}</h3>
              <p className="text-fg-subtle text-sm">{t({ en: `We've sent a password reset link to ${email}`, fa: `لینک بازیابی رمز عبور به ${email} ارسال شد` })}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-[12px] text-danger text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <InputField
                label={t({ en: 'Email', fa: 'ایمیل' })}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t({ en: 'you@example.com', fa: 'nama@example.ir' })}
                disabled={loading}
              />
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? t({ en: 'Sending...', fa: 'در حال ارسال...' }) : t({ en: 'Send Reset Link', fa: 'ارسال لینک بازیابی' })}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-fg-subtle hover:text-fg">{t({ en: '← Back to sign in', fa: '← بازگشت به ورود' })}</Link>
          </div>
        </Card>
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
        <Card>
          {done ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-fg-muted">{t({ en: 'Your password has been updated.', fa: 'رمز عبور شما به‌روزرسانی شد.' })}</p>
              <Link to="/login">
                <Button>{t({ en: 'Sign In', fa: 'ورود' })}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-[12px] text-danger text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <InputField
                label={t({ en: 'New password', fa: 'رمز عبور جدید' })}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <InputField
                label={t({ en: 'Confirm password', fa: 'تأیید رمز عبور' })}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? t({ en: 'Updating...', fa: 'در حال به‌روزرسانی...' }) : t({ en: 'Update Password', fa: 'به‌روزرسانی رمز' })}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
