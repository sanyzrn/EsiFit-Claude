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
    INVALID_CREDENTIALS: { en: 'Invalid email or password', fa: 'ایمیل یا رمز عبور نامعتبر است' },
    EMAIL_ALREADY_IN_USE: { en: 'Email already registered', fa: 'این ایمیل قبلاً ثبت شده است' },
    WEAK_PASSWORD: { en: 'Password is too weak', fa: 'رمز عبور ضعیف است' },
    INVALID_EMAIL: { en: 'Invalid email address', fa: 'آدرس ایمیل نامعتبر است' },
    INVALID_PHONE: { en: 'Invalid phone number', fa: 'شماره تلفن نامعتبر است' },
    INVALID_OR_EXPIRED_OTP: { en: 'Invalid or expired verification code', fa: 'کد تأیید نامعتبر یا منقضی شده است' },
    INVALID_OR_EXPIRED_TOKEN: { en: 'Reset link is invalid or expired', fa: 'لینک بازیابی نامعتبر یا منقضی شده است' },
    UNAUTHORIZED: { en: 'Please sign in again', fa: 'لطفاً دوباره وارد شوید' },
    REQUEST_FAILED: { en: 'Network error. Check your connection', fa: 'خطای شبکه. اتصال خود را بررسی کنید' },
  };

  return t(messages[code] ?? { en: 'Something went wrong. Please try again.', fa: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' });
}

export { requestPasswordReset, resetPassword, requestPhoneOtp, verifyPhoneOtp } from './api-client';
