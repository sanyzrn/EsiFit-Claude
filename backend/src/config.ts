import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

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
  sms: {
    provider: process.env.SMS_PROVIDER ?? 'console',
    apiKey: process.env.SMS_API_KEY,
  },
};

export type Role = 'USER' | 'COACH' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'ECONOMY' | 'VIP' | 'ELITE';

export const TIERS: SubscriptionTier[] = ['FREE', 'ECONOMY', 'VIP', 'ELITE'];
export const ROLES: Role[] = ['USER', 'COACH', 'ADMIN'];

export function paymentsConfigured(): boolean {
  const { secretKey, priceEconomy, priceVip, priceElite } = config.stripe;
  return Boolean(secretKey && priceEconomy && priceVip && priceElite);
}
