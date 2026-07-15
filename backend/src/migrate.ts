import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const sql = readFileSync(join(__dirname, '../migrations/001_init.sql'), 'utf8');
  await pool.query(sql);
}
