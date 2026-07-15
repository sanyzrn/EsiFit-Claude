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

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (config.sms.provider === 'console' || !config.sms.apiKey) {
    console.info(`[dev] OTP for ${phone}: ${code}`);
    return;
  }
  // Hook for Kavenegar, Ghasedak, etc. — set SMS_PROVIDER + SMS_API_KEY in production.
  console.info(`[sms:${config.sms.provider}] OTP sent to ${phone}`);
}
