#!/usr/bin/env tsx
/**
 * Regenerates deterministic demo dataset JSON for Phases 2–4.
 * Usage: npm run seed
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { generateSeedDataset } from "../src/lib/mock/seed";

const outDir = resolve(process.cwd(), "src/lib/mock/generated");
mkdirSync(outDir, { recursive: true });
const data = generateSeedDataset(45);
const outPath = resolve(outDir, "dataset.json");
writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Seeded ${data.days} days → ${outPath}`);
console.log(`Workouts: ${data.workouts.length}, nutrition days: ${data.nutritionDays.length}`);
