import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config, type Role, type SubscriptionTier } from '../config.js';

export interface AuthPayload {
  sub: string;
  email?: string;
  role: Role;
  subscriptionTier: SubscriptionTier;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwtSecret) as AuthPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.esifit_token as string | undefined;
  const token =
    header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;

  if (!token) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Sign in required' });
    return;
  }

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient role' });
      return;
    }
    next();
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('esifit_token', token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('esifit_token', { path: '/' });
}
