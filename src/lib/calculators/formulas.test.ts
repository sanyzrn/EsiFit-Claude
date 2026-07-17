import { describe, expect, it } from "vitest";
import {
  calcBMI,
  calcBMR,
  calcTDEE,
  calcOneRepMax,
  calcProtein,
  calcDeficit,
} from "@/lib/calculators/formulas";

describe("calculator formulas", () => {
  it("BMI category edges", () => {
    expect(calcBMI({ weightKg: 50, heightCm: 170 }).band).toBe("Underweight"); // ~17.3
    expect(calcBMI({ weightKg: 70, heightCm: 170 }).band).toBe("Healthy"); // ~24.2
    expect(calcBMI({ weightKg: 85, heightCm: 170 }).band).toBe("Overweight"); // ~29.4
    expect(calcBMI({ weightKg: 100, heightCm: 170 }).value).toBeGreaterThan(30);
  });

  it("BMR Mifflin-St Jeor known pair", () => {
    // male 70kg 170cm 30y ≈ 10*70+6.25*170-5*30+5 = 1617.5
    expect(calcBMR({ weightKg: 70, heightCm: 170, age: 30, sex: 1 }).value).toBe(1618);
    // female same ≈ 10*70+6.25*170-5*30-161 = 1451.5
    expect(calcBMR({ weightKg: 70, heightCm: 170, age: 30, sex: 0 }).value).toBe(1452);
  });

  it("TDEE scales with activity", () => {
    const sedentary = calcTDEE({ weightKg: 70, heightCm: 170, age: 30, sex: 1, activity: 1.2 }).value;
    const active = calcTDEE({ weightKg: 70, heightCm: 170, age: 30, sex: 1, activity: 1.725 }).value;
    expect(active).toBeGreaterThan(sedentary);
  });

  it("1RM Epley boundary", () => {
    expect(calcOneRepMax({ weight: 100, reps: 1 }).value).toBeCloseTo(103.3, 0);
    expect(calcOneRepMax({ weight: 60, reps: 5 }).value).toBe(70);
  });

  it("protein scales with training demand", () => {
    const low = calcProtein({ weightKg: 80, training: 0 }).value;
    const high = calcProtein({ weightKg: 80, training: 2 }).value;
    expect(high).toBeGreaterThan(low);
  });

  it("deficit simulator returns series", () => {
    const r = calcDeficit({ weightKg: 80, heightCm: 175, age: 28, sex: 1, activity: 1.55, deficit: 500, weeks: 4 });
    expect(r.series?.length).toBe(5);
    expect(r.series![0]!.y).toBe(80);
    expect(r.series![4]!.y).toBeLessThan(80);
  });
});
