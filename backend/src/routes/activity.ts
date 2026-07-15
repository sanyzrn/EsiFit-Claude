import { Router } from 'express';
import { generateId, query } from '../db.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const activityRouter = Router();

activityRouter.use(requireAuth);

activityRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.sub;

    const [bodyLogs, exerciseLogs, calculatorResults, tickets, saved] = await Promise.all([
      query('SELECT * FROM body_logs WHERE user_id = $1 ORDER BY date DESC', [userId]),
      query('SELECT * FROM exercise_logs WHERE user_id = $1 ORDER BY date DESC', [userId]),
      query('SELECT * FROM calculator_results WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      query('SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      query('SELECT exercise_id FROM saved_exercises WHERE user_id = $1', [userId]),
    ]);

    const ticketIds = tickets.rows.map((t) => String((t as Record<string, unknown>).id));
    const messages: Record<string, unknown[]> = {};
    if (ticketIds.length > 0) {
      const msgResult = await query(
        `SELECT * FROM ticket_messages WHERE ticket_id = ANY($1::text[]) ORDER BY created_at ASC`,
        [ticketIds]
      );
      for (const msg of msgResult.rows) {
        const row = msg as Record<string, unknown>;
        const tid = String(row.ticket_id);
        if (!messages[tid]) messages[tid] = [];
        messages[tid].push({
          id: row.id,
          ticketId: tid,
          senderId: row.sender_id,
          senderName: row.sender_name,
          content: row.content,
          createdAt: new Date(row.created_at as string | Date).toISOString(),
        });
      }
    }

    res.json({
      bodyLogs: bodyLogs.rows.map(mapBodyLog),
      exerciseLogs: exerciseLogs.rows.map(mapExerciseLog),
      calculatorResults: calculatorResults.rows.map(mapCalculatorResult),
      tickets: tickets.rows.map((t) => mapTicket(t, messages[(t as { id: string }).id] ?? [])),
      savedExercises: saved.rows.map((r) => String((r as Record<string, unknown>).exercise_id)),
    });
  } catch (err) {
    console.error('get activity error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

activityRouter.post('/body-logs', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.sub;
    const log = req.body ?? {};
    const id = typeof log.id === 'string' ? log.id : generateId('bl');

    await query(
      `INSERT INTO body_logs (id, user_id, date, weight_kg, waist_cm, neck_cm, hip_cm, chest_cm, arm_cm, body_fat_pct, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         date = EXCLUDED.date, weight_kg = EXCLUDED.weight_kg, waist_cm = EXCLUDED.waist_cm,
         neck_cm = EXCLUDED.neck_cm, hip_cm = EXCLUDED.hip_cm, chest_cm = EXCLUDED.chest_cm,
         arm_cm = EXCLUDED.arm_cm, body_fat_pct = EXCLUDED.body_fat_pct, photo_url = EXCLUDED.photo_url
       WHERE body_logs.user_id = $2`,
      [
        id, userId, log.date,
        log.weightKg ?? null, log.waistCm ?? null, log.neckCm ?? null,
        log.hipCm ?? null, log.chestCm ?? null, log.armCm ?? null,
        log.bodyFatPct ?? null, log.photoUrl ?? null,
      ]
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error('body-log error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

activityRouter.post('/exercise-logs', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.sub;
    const log = req.body ?? {};
    const id = typeof log.id === 'string' ? log.id : generateId('el');

    await query(
      `INSERT INTO exercise_logs (id, user_id, exercise_id, exercise_name, date, sets, reps, weight_kg)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         exercise_id = EXCLUDED.exercise_id, exercise_name = EXCLUDED.exercise_name,
         date = EXCLUDED.date, sets = EXCLUDED.sets, reps = EXCLUDED.reps, weight_kg = EXCLUDED.weight_kg
       WHERE exercise_logs.user_id = $2`,
      [id, userId, log.exerciseId, log.exerciseName, log.date, log.sets, log.reps, log.weightKg]
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error('exercise-log error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

activityRouter.post('/calculator-results', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.sub;
    const result = req.body ?? {};
    const id = typeof result.id === 'string' ? result.id : generateId('cr');

    await query(
      `INSERT INTO calculator_results (id, user_id, type, input_json, result_json, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [
        id, userId, result.type,
        JSON.stringify(result.inputJson ?? {}),
        JSON.stringify(result.resultJson ?? {}),
        result.createdAt ?? new Date().toISOString(),
      ]
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error('calculator-result error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

activityRouter.post('/tickets', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth!.sub;
    const ticket = req.body ?? {};
    const id = typeof ticket.id === 'string' ? ticket.id : generateId('tk');
    const messages = Array.isArray(ticket.messages) ? ticket.messages : [];

    await query(
      `INSERT INTO tickets (id, user_id, subject, status) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET subject = EXCLUDED.subject, status = EXCLUDED.status
       WHERE tickets.user_id = $2`,
      [id, userId, ticket.subject, ticket.status ?? 'open']
    );

    for (const msg of messages) {
      const msgId = typeof msg.id === 'string' ? msg.id : generateId('msg');
      await query(
        `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, content, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [msgId, id, msg.senderId, msg.senderName, msg.content, msg.createdAt ?? new Date().toISOString()]
      );
    }

    res.status(201).json({ id });
  } catch (err) {
    console.error('ticket error:', err);
    res.status(500).json({ error: 'INTERNAL' });
  }
});

function mapBodyLog(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    weightKg: row.weight_kg ?? undefined,
    waistCm: row.waist_cm ?? undefined,
    neckCm: row.neck_cm ?? undefined,
    hipCm: row.hip_cm ?? undefined,
    chestCm: row.chest_cm ?? undefined,
    armCm: row.arm_cm ?? undefined,
    bodyFatPct: row.body_fat_pct ?? undefined,
    photoUrl: row.photo_url ?? undefined,
  };
}

function mapExerciseLog(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    date: row.date,
    sets: row.sets,
    reps: row.reps,
    weightKg: row.weight_kg,
  };
}

function mapCalculatorResult(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    inputJson: row.input_json,
    resultJson: row.result_json,
    createdAt: new Date(row.created_at as string | Date).toISOString(),
  };
}

function mapTicket(row: Record<string, unknown>, messages: unknown[]) {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    status: row.status,
    messages,
  };
}
