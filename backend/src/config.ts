import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export type PaymentProvider = 'zarinpal' | 'idpay' | 'stripe' | 'none';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required('DATABASE_URL', 'postgresql://esifit:esifit@localhost:5432/esifit'),
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'noreply@esifit.local',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceEconomy: process.env.STRIPE_PRICE_ECONOMY,
    priceVip: process.env.STRIPE_PRICE_VIP,
    priceElite: process.env.STRIPE_PRICE_ELITE,
  },
  zarinpal: {
    merchantId: process.env.ZARINPAL_MERCHANT_ID,
    sandbox: process.env.ZARINPAL_SANDBOX !== 'false',
  },
  idpay: {
    apiKey: process.env.IDPAY_API_KEY,
    sandbox: process.env.IDPAY_SANDBOX !== 'false',
  },
  /** Preferred order: zarinpal → idpay → stripe */
  paymentsPreferred: (process.env.PAYMENTS_PROVIDER ?? 'auto') as PaymentProvider | 'auto',
  sms: {
    provider: (process.env.SMS_PROVIDER ?? 'console') as 'console' | 'kavenegar',
    apiKey: process.env.SMS_API_KEY ?? process.env.KAVENEGAR_API_KEY,
    /** Optional Kavenegar verify lookup template (sends token) */
    template: process.env.KAVENEGAR_TEMPLATE,
  },
  /** Plan prices in Tomans (integer) — source of truth for Iranian gateways */
  planPricesTomans: {
    ECONOMY: Number(process.env.PRICE_ECONOMY_TOMAN ?? 599_000),
    VIP: Number(process.env.PRICE_VIP_TOMAN ?? 999_000),
    ELITE: Number(process.env.PRICE_ELITE_TOMAN ?? 1_999_000),
  } as const,
};

export type Role = 'USER' | 'COACH' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'ECONOMY' | 'VIP' | 'ELITE';

export const TIERS: SubscriptionTier[] = ['FREE', 'ECONOMY', 'VIP', 'ELITE'];
export const ROLES: Role[] = ['USER', 'COACH', 'ADMIN'];

export function stripeConfigured(): boolean {
  const { secretKey, priceEconomy, priceVip, priceElite } = config.stripe;
  return Boolean(secretKey && priceEconomy && priceVip && priceElite);
}

export function zarinpalConfigured(): boolean {
  return Boolean(config.zarinpal.merchantId);
}

export function idpayConfigured(): boolean {
  return Boolean(config.idpay.apiKey);
}

/** Resolve active payment provider: zarinpal primary, idpay fallback, stripe optional. */
export function resolvePaymentProvider(): PaymentProvider {
  const preferred = config.paymentsPreferred;
  if (preferred === 'zarinpal' && zarinpalConfigured()) return 'zarinpal';
  if (preferred === 'idpay' && idpayConfigured()) return 'idpay';
  if (preferred === 'stripe' && stripeConfigured()) return 'stripe';
  if (preferred === 'none') return 'none';

  // auto
  if (zarinpalConfigured()) return 'zarinpal';
  if (idpayConfigured()) return 'idpay';
  if (stripeConfigured()) return 'stripe';
  return 'none';
}

export function paymentsConfigured(): boolean {
  return resolvePaymentProvider() !== 'none';
}
