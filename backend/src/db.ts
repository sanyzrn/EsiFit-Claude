import { randomBytes } from 'crypto';
import { Pool } from 'pg';
import { config } from './config.js';

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const result = await pool.query(text, params);
  return { rows: result.rows as T[], rowCount: result.rowCount };
}

export function generateId(prefix: string): string {
  const suffix = randomBytes(8).toString('hex');
  return `${prefix}_${suffix}`;
}
