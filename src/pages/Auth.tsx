import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { loginUser, registerUser, requestPasswordReset, resetPassword, requestPhoneOtp, verifyPhoneOtp } from '@/lib/api-client';
import { getState, subscribe, bootstrapSession } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { PAGE_CONTAINER_CLASS } from '@/components/ui/PageContainer';

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="card-premium p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary)' }}>
              <Dumbbell className="w-6 h-6" style={{ color: 'var(--theme-primary-fg)' }} />
            </div>
          </Link>
          <h1 className="text-2xl font-black mb-2 font-display">{title}</h1>
          {subtitle && <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, error, icon: Icon, ...props }: { label: string; error?: string; icon?: any; [key: string]: any }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: 'var(--theme-fg-muted)' }}>{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-fg-subtle)' }} />}
        <input
          className={`w-full py-2.5 text-sm outline-none transition-all duration-[180ms] ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
          style={{
            backgroundColor: 'var(--theme-elevated)',
            border: `1px solid ${error ? 'var(--theme-error)' : 'var(--theme-border)'}`,
            borderRadius: 'var(--radius-input)',
            color: 'var(--theme-fg)',
          }}
          {...props}
        />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--theme-error)' }}>{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-[180ms] disabled:opacity-60 flex items-center justify-center gap-2"
      style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--theme-border)' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--theme-fg-faint)' }}>or</span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--theme-border)' }} />
    </div>
  );
}

export function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t({ en: 'Please fill in all fields', fa: 'لطفاً همه فیلدها را پر کنید' })); return; }
    setLoading(true);
    try {
      const { user } = await loginUser({ email, password });
      await bootstrapSession();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || t({ en: 'Invalid credentials', fa: 'اطلاعات نامعتبر' }));
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title={t({ en: 'Welcome Back', fa: 'خوش آمدید' })}
      subtitle={t({ en: 'Sign in to your EsiFit account', fa: 'به حساب اسی‌فیت خود وارد شوید' })}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t({ en: 'Email', fa: 'ایمیل' })} type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} />
        <div className="relative">
          <Input label={t({ en: 'Password', fa: 'رمز عبور' })} type={showPwd ? 'text' : 'password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" icon={Lock} />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-[38px]"
            style={{ color: 'var(--theme-fg-subtle)' }}>
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-error)' }}>
          <AlertCircle className="w-4 h-4" />{error}</p>}
        <SubmitButton loading={loading}>{t({ en: 'Sign In', fa: 'ورود' })}</SubmitButton>
        <div className="flex justify-between text-sm mt-4">
          <Link to="/register" style={{ color: 'var(--theme-primary)' }}>
            {t({ en: 'Create account', fa: 'ساخت حساب' })}
          </Link>
          <Link to="/forgot-password" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'Forgot password?', fa: 'رمز عبور را فراموش کرده‌اید؟' })}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError(t({ en: 'Please fill in all fields', fa: 'لطفاً همه فیلدها را پر کنید' })); return; }
    if (password.length < 6) { setError(t({ en: 'Password must be at least 6 characters', fa: 'رمز عبور حداقل ۶ کاراکتر' })); return; }
    setLoading(true);
    try {
      const { user } = await registerUser({ name, email, password });
      await bootstrapSession();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || t({ en: 'Registration failed', fa: 'ثبت‌نام ناموفق' }));
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title={t({ en: 'Create Account', fa: 'ایجاد حساب' })}
      subtitle={t({ en: 'Start your fitness journey with EsiFit', fa: 'سفر تناسب اندام خود را با اسی‌فیت شروع کنید' })}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t({ en: 'Full Name', fa: 'نام کامل' })} type="text" value={name}
          onChange={e => setName(e.target.value)} placeholder={t({ en: 'Your name', fa: 'نام شما' })} icon={User} />
        <Input label={t({ en: 'Email', fa: 'ایمیل' })} type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} />
        <div className="relative">
          <Input label={t({ en: 'Password', fa: 'رمز عبور' })} type={showPwd ? 'text' : 'password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" icon={Lock} />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-[38px]" style={{ color: 'var(--theme-fg-subtle)' }}>
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-error)' }}>
          <AlertCircle className="w-4 h-4" />{error}</p>}
        <SubmitButton loading={loading}>{t({ en: 'Create Account', fa: 'ایجاد حساب' })}</SubmitButton>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: 'Already have an account?', fa: 'حساب دارید؟' })}{' '}
          <Link to="/login" style={{ color: 'var(--theme-primary)' }}>{t({ en: 'Sign In', fa: 'ورود' })}</Link>
        </p>
      </form>
    </AuthCard>
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
    if (!email) { setError(t({ en: 'Enter your email', fa: 'ایمیل خود را وارد کنید' })); return; }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || t({ en: 'Failed to send reset email', fa: 'ارسال ایمیل بازیابی ناموفق' }));
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title={t({ en: 'Reset Password', fa: 'بازیابی رمز عبور' })}
      subtitle={t({ en: 'We\'ll send you a reset link', fa: 'لینک بازیابی برای شما ارسال می‌شود' })}>
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--theme-fg-muted)' }}>
            {t({ en: 'Check your email for the reset link.', fa: 'ایمیل خود را برای لینک بازیابی بررسی کنید.' })}
          </p>
          <Link to="/login" className="inline-block text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>
            {t({ en: 'Back to Sign In', fa: 'بازگشت به ورود' })}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t({ en: 'Email', fa: 'ایمیل' })} type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} />
          {error && <p className="text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
          <SubmitButton loading={loading}>{t({ en: 'Send Reset Link', fa: 'ارسال لینک بازیابی' })}</SubmitButton>
          <Link to="/login" className="flex items-center gap-1 justify-center text-sm mt-4" style={{ color: 'var(--theme-fg-subtle)' }}>
            <ArrowLeft className="w-4 h-4" /> {t({ en: 'Back to Sign In', fa: 'بازگشت به ورود' })}
          </Link>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPassword() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) { setError(t({ en: 'Password must be at least 6 characters', fa: 'رمز عبور حداقل ۶ کاراکتر' })); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || t({ en: 'Reset failed', fa: 'بازیابی ناموفق' }));
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title={t({ en: 'New Password', fa: 'رمز عبور جدید' })}>
      {done ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--theme-fg-muted)' }}>
            {t({ en: 'Password reset successfully!', fa: 'رمز عبور با موفقیت بازیابی شد!' })}
          </p>
          <Link to="/login" className="inline-block text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>
            {t({ en: 'Sign In', fa: 'ورود' })}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input label={t({ en: 'New Password', fa: 'رمز عبور جدید' })} type={showPwd ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" icon={Lock} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-[38px]" style={{ color: 'var(--theme-fg-subtle)' }}>
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
          <SubmitButton loading={loading}>{t({ en: 'Reset Password', fa: 'بازیابی رمز عبور' })}</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}

export function PhoneOtpSection({ onVerified }: { onVerified: () => void }) {
  const { t } = useI18n();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone) { setError(t({ en: 'Enter phone number', fa: 'شماره تلفن را وارد کنید' })); return; }
    setLoading(true);
    try {
      await requestPhoneOtp(phone);
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || t({ en: 'Failed to send OTP', fa: 'ارسال کد ناموفق' }));
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp) { setError(t({ en: 'Enter verification code', fa: 'کد تأیید را وارد کنید' })); return; }
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, otp);
      onVerified();
    } catch (err: any) {
      setError(err?.message || t({ en: 'Invalid code', fa: 'کد نامعتبر' }));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input label={t({ en: 'Phone Number', fa: 'شماره تلفن' })} type="tel" value={phone}
            onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxxx" icon={Phone} />
          {error && <p className="text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
          <SubmitButton loading={loading}>{t({ en: 'Send Code', fa: 'ارسال کد' })}</SubmitButton>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input label={t({ en: 'Verification Code', fa: 'کد تأیید' })} type="text" value={otp}
            onChange={e => setOtp(e.target.value)} placeholder="••••••" icon={Shield} />
          {error && <p className="text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
          <SubmitButton loading={loading}>{t({ en: 'Verify', fa: 'تأیید' })}</SubmitButton>
          <button type="button" onClick={() => setStep('phone')}
            className="text-sm flex items-center gap-1 justify-center" style={{ color: 'var(--theme-fg-subtle)' }}>
            <ArrowLeft className="w-4 h-4" /> {t({ en: 'Change number', fa: 'تغییر شماره' })}
          </button>
        </form>
      )}
    </div>
  );
}
