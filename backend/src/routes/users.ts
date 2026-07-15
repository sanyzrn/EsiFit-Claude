import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import type { Goal, ActivityLevel } from '../types.js';

const GOALS: Goal[] = ['MUSCLE_GAIN', 'FAT_LOSS', 'GENERAL_FITNESS', 'STRENGTH'];
const ACTIVITY_LEVELS: ActivityLevel[] = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'];

export const usersRouter = Router();

usersRouter.patch('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const updates = req.body ?? {};
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const allowed: Record<string, string> = {
      name: 'name',
      age: 'age',
      gender: 'gender',
      heightCm: 'height_cm',
      weightKg: 'weight_kg',
      goal: 'goal',
      activityLevel: 'activity_level',
      injuries: 'injuries',
    };

    for (const [key, column] of Object.entries(allowed)) {
      if (updates[key] === undefined) continue;
      if (key === 'goal' && !GOALS.includes(updates[key])) continue;
      if (key === 'activityLevel' && !ACTIVITY_LEVELS.includes(updates[key])) continue;
      fields.push(`${column} = $${idx++}`);
      values.push(updates[key]);
    }

    if (fields.length === 0) {
      res.json({ ok: true });
      return;
    }

    values.push(req.auth!.sub);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    res.json({ ok: true });
  } catch (err) {
    console.error('patch profile error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

usersRouter.put('/me/saved-exercises', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { savedExercises } = req.body ?? {};
    if (!Array.isArray(savedExercises)) {
      res.status(400).json({ error: 'INVALID_REQUEST' });
      return;
    }

    const userId = req.auth!.sub;
    const ids = savedExercises.filter((id): id is string => typeof id === 'string').slice(0, 100);

    await query('DELETE FROM saved_exercises WHERE user_id = $1', [userId]);
    for (const exerciseId of ids) {
      await query(
        'INSERT INTO saved_exercises (user_id, exercise_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, exerciseId]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('saved-exercises error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});
