/**
 * Deterministic PRNG + date helpers for seed data (Phases 2–4).
 */
export function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function daysAgoISO(n: number, hour = 8) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function dateOnly(n: number) {
  return daysAgoISO(n).slice(0, 10);
}

export const SEED = 42;
