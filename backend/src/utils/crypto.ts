import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { config } from '../config.js';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Normalize Iranian phone to 989xxxxxxxxx for Kavenegar. */
export function normalizeIranPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length >= 12) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `98${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('9')) return `98${digits}`;
  return digits;
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${config.appUrl}/reset-password?token=${token}`;

  if (!config.smtp.host) {
    console.info(`[dev] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });

  await transport.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Reset your EsiFit password',
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
  });
}

/**
 * Send OTP via Kavenegar (or console in development).
 * https://kavenegar.com/rest.html#sms-send
 */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const normalized = normalizeIranPhone(phone);

  if (config.sms.provider === 'console' || !config.sms.apiKey) {
    console.info(`[dev] OTP for ${normalized}: ${code}`);
    return;
  }

  if (config.sms.provider === 'kavenegar') {
    const apiKey = config.sms.apiKey;
    // Prefer verify/lookup template when configured; otherwise plain send
    if (config.sms.template) {
      const url = new URL(`https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`);
      url.searchParams.set('receptor', normalized);
      url.searchParams.set('token', code);
      url.searchParams.set('template', config.sms.template);
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        console.error('Kavenegar verify error:', res.status, body);
        throw new Error('SMS_SEND_FAILED');
      }
      return;
    }

    const url = new URL(`https://api.kavenegar.com/v1/${apiKey}/sms/send.json`);
    url.searchParams.set('receptor', normalized);
    url.searchParams.set('message', `کد تأیید اسی‌فیت: ${code}`);
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      console.error('Kavenegar send error:', res.status, body);
      throw new Error('SMS_SEND_FAILED');
    }
    return;
  }

  console.info(`[sms:${config.sms.provider}] OTP for ${normalized}: ${code}`);
}
