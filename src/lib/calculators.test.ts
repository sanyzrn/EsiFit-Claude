import { describe, expect, it } from 'vitest';
import { calcBMI, calcOneRepMax, calcWHR } from './calculators';

describe('calcBMI (CALC-2)', () => {
  it('returns a valid BMI for normal inputs', () => {
    const result = calcBMI(75, 175);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.bmi).toBeGreaterThan(0);
      expect(result.value.category).toBeTruthy();
    }
  });

  it('rejects height <= 0 instead of returning Infinity', () => {
    const result = calcBMI(75, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/height/i);
    }
  });

  it('rejects weight <= 0', () => {
    const result = calcBMI(0, 175);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/weight/i);
    }
  });
});

describe('calcWHR (CALC-3)', () => {
  it('returns a valid WHR for normal inputs', () => {
    const result = calcWHR(85, 95, 'male');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.whr).toBeGreaterThan(0);
      expect(result.value.risk).toBeTruthy();
    }
  });

  it('rejects hip <= 0 instead of returning Infinity', () => {
    const result = calcWHR(85, 0, 'male');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/hip/i);
    }
  });

  it('rejects waist <= 0', () => {
    const result = calcWHR(0, 95, 'female');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/waist/i);
    }
  });
});

describe('calcOneRepMax (CALC-4)', () => {
  it('estimates 1RM with Epley for typical reps', () => {
    const result = calcOneRepMax(100, 5, 'epley');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeGreaterThan(100);
    }
  });

  it('rejects Brzycki when reps >= 37 instead of returning NaN', () => {
    const result = calcOneRepMax(100, 37, 'brzycki');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/37/);
    }
  });

  it('returns lifted weight when reps is 0 or 1', () => {
    expect(calcOneRepMax(100, 0)).toEqual({ ok: true, value: 100 });
    expect(calcOneRepMax(100, 1)).toEqual({ ok: true, value: 100 });
  });

  it('rejects non-positive weight', () => {
    const result = calcOneRepMax(0, 5, 'epley');
    expect(result.ok).toBe(false);
  });
});
