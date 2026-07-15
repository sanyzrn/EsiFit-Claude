import { Router } from 'express';
import { generateId, query } from '../db.js';
import {
  generateOtpCode,
  generateResetToken,
  hashPassword,
  hashToken,
  sendOtpSms,
  sendPasswordResetEmail,
  verifyPassword,
  normalizeIranPhone,
} from '../utils/crypto.js';
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
  type AuthenticatedRequest,
} from '../middleware/auth.js';
import type { Role, SubscriptionTier } from '../config.js';

interface UserRow {
  id: string;
  name: string;
  email: string | null;
  password_hash: string | null;
  phone: string | null;
  phone_verified: boolean;
  role: Role;
  subscription_tier: SubscriptionTier;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  activity_level: string | null;
  injuries: string | null;
  assigned_coach_id: string | null;
  created_at: Date;
}

function toApiUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name,
    phone: row.phone ?? undefined,
    phoneVerified: row.phone_verified,
    role: row.role,
    subscriptionTier: row.subscription_tier,
    age: row.age ?? undefined,
    gender: row.gender ?? undefined,
    heightCm: row.height_cm ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    goal: row.goal ?? undefined,
    activityLevel: row.activity_level ?? undefined,
    injuries: row.injuries ?? undefined,
    assignedCoachId: row.assigned_coach_id ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

function issueSession(res: import('express').Response, user: UserRow) {
  const token = signToken({
    sub: user.id,
    email: user.email ?? undefined,
    role: user.role,
    subscriptionTier: user.subscription_tier,
  });
  setAuthCookie(res, token);
  return { token, user: toApiUser(user) };
}

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || typeof name !== 'string' || name.length > 128) {
      res.status(400).json({ error: 'INVALID_NAME' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'INVALID_EMAIL' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'WEAK_PASSWORD' });
      return;
    }

    const existing = await query<UserRow>('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'EMAIL_ALREADY_IN_USE' });
      return;
    }

    const id = generateId('usr');
    const passwordHash = await hashPassword(password);
    const { rows } = await query<UserRow>(
      `INSERT INTO users (id, name, email, password_hash, role, subscription_tier)
       VALUES ($1, $2, $3, $4, 'USER', 'FREE')
       RETURNING *`,
      [id, name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const session = issueSession(res, rows[0]);
    res.status(201).json(session);
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [String(email).toLowerCase().trim()]
    );
    const user = rows[0];
    if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    res.json(issueSession(res, user));
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { rows } = await query<UserRow>('SELECT * FROM users WHERE id = $1', [req.auth!.sub]);
    const user = rows[0];
    if (!user) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json({
      user: toApiUser(user),
      entitlements: {
        role: user.role,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      res.status(400).json({ error: 'INVALID_EMAIL' });
      return;
    }

    const { rows } = await query<UserRow>(
      'SELECT id, email FROM users WHERE email = $1',
      [String(email).toLowerCase().trim()]
    );

    // Always return success to avoid email enumeration
    if (rows[0]?.email) {
      const token = generateResetToken();
      const id = generateId('prt');
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await query(
        `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [id, rows[0].id, hashToken(token), expires.toISOString()]
      );
      await sendPasswordResetEmail(rows[0].email, token);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body ?? {};
    if (!token || !password || String(password).length < 6) {
      res.status(400).json({ error: 'INVALID_REQUEST' });
      return;
    }

    const tokenHash = hashToken(String(token));
    const { rows } = await query<{
      id: string;
      user_id: string;
      expires_at: Date;
      used_at: Date | null;
    }>(
      `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens
       WHERE token_hash = $1 ORDER BY expires_at DESC LIMIT 1`,
      [tokenHash]
    );

    const row = rows[0];
    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });
      return;
    }

    const passwordHash = await hashPassword(String(password));
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, row.user_id]);
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [row.id]);

    res.json({ ok: true });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

authRouter.post('/phone/request-otp', async (req, res) => {
  try {
    const { phone } = req.body ?? {};
    if (!phone || typeof phone !== 'string') {
      res.status(400).json({ error: 'INVALID_PHONE' });
      return;
    }

    const normalized = normalizeIranPhone(phone);
    if (normalized.length < 12) {
      res.status(400).json({ error: 'INVALID_PHONE' });
      return;
    }
    const code = generateOtpCode();
    const id = generateId('otp');
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await query(
      `INSERT INTO phone_otp_codes (id, phone, code_hash, expires_at) VALUES ($1, $2, $3, $4)`,
      [id, normalized, hashToken(code), expires.toISOString()]
    );
    await sendOtpSms(normalized, code);

    res.json({ ok: true });
  } catch (err) {
    console.error('request-otp error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

authRouter.post('/phone/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body ?? {};
    if (!phone || !code) {
      res.status(400).json({ error: 'INVALID_REQUEST' });
      return;
    }

    const normalized = normalizeIranPhone(String(phone));
    const codeHash = hashToken(String(code));

    const { rows } = await query<{
      id: string;
      expires_at: Date;
      attempts: number;
    }>(
      `SELECT id, expires_at, attempts FROM phone_otp_codes
       WHERE phone = $1 AND code_hash = $2
       ORDER BY created_at DESC LIMIT 1`,
      [normalized, codeHash]
    );

    const otp = rows[0];
    if (!otp || new Date(otp.expires_at) < new Date() || otp.attempts >= 5) {
      res.status(400).json({ error: 'INVALID_OR_EXPIRED_OTP' });
      return;
    }

    let { rows: users } = await query<UserRow>(
      'SELECT * FROM users WHERE phone = $1',
      [normalized]
    );

    if (!users[0]) {
      const id = generateId('usr');
      const displayName = typeof name === 'string' && name.trim() ? name.trim() : `User ${normalized.slice(-4)}`;
      const result = await query<UserRow>(
        `INSERT INTO users (id, name, phone, phone_verified, role, subscription_tier)
         VALUES ($1, $2, $3, TRUE, 'USER', 'FREE') RETURNING *`,
        [id, displayName, normalized]
      );
      users = result.rows;
    } else {
      await query('UPDATE users SET phone_verified = TRUE WHERE id = $1', [users[0].id]);
      users[0].phone_verified = true;
    }

    await query('DELETE FROM phone_otp_codes WHERE phone = $1', [normalized]);
    res.json(issueSession(res, users[0]));
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});
