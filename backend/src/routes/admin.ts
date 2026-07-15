import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { ROLES, TIERS, type Role, type SubscriptionTier } from '../config.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/users', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, role, subscription_tier, created_at FROM users ORDER BY created_at DESC LIMIT 200`
    );
    res.json({
      users: rows.map((r: Record<string, unknown>) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        subscriptionTier: r.subscription_tier,
        createdAt: new Date(r.created_at as Date).toISOString(),
      })),
    });
  } catch (err) {
    console.error('admin users error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

adminRouter.patch('/users/:id/entitlements', async (req: AuthenticatedRequest, res) => {
  try {
    const { role, subscriptionTier } = req.body ?? {};
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (role !== undefined) {
      if (!ROLES.includes(role as Role)) {
        res.status(400).json({ error: 'INVALID_ROLE' });
        return;
      }
      updates.push(`role = $${idx++}`);
      values.push(role);
    }
    if (subscriptionTier !== undefined) {
      if (!TIERS.includes(subscriptionTier as SubscriptionTier)) {
        res.status(400).json({ error: 'INVALID_TIER' });
        return;
      }
      updates.push(`subscription_tier = $${idx++}`);
      values.push(subscriptionTier);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'NO_UPDATES' });
      return;
    }

    values.push(req.params.id);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`, values);
    res.json({ ok: true });
  } catch (err) {
    console.error('admin entitlements error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});
