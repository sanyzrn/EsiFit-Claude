import { promises as fs } from "fs";
import path from "path";
import type { AIUsageLog } from "@/lib/ai/types";
import type { UserTier } from "@/lib/types";
import { quotaForTier } from "@/lib/ai/quota";
import { logInfo } from "@/lib/ai/logger";

const memory: AIUsageLog[] = [];

function usagePath() {
  return path.join(process.env.AI_USAGE_DIR || "/tmp/esifit-ai", "usage.jsonl");
}

async function ensureDir() {
  const dir = path.dirname(usagePath());
  await fs.mkdir(dir, { recursive: true }).catch(() => undefined);
}

export async function appendUsage(entry: AIUsageLog) {
  memory.push(entry);
  if (memory.length > 2000) memory.splice(0, memory.length - 1500);
  logInfo("ai_usage", {
    userId: entry.userId,
    tier: entry.tier,
    provider: entry.provider,
    model: entry.model,
    touchpoint: entry.touchpoint,
    promptTokens: entry.promptTokens,
    completionTokens: entry.completionTokens,
    ok: entry.ok,
    error: entry.error,
  });
  try {
    await ensureDir();
    await fs.appendFile(usagePath(), `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    /* /tmp may be unavailable in some sandboxes — memory + stdout still work */
  }
}

export async function listUsage(limit = 100): Promise<AIUsageLog[]> {
  const fromMem = [...memory].reverse().slice(0, limit);
  if (fromMem.length) return fromMem;
  try {
    const raw = await fs.readFile(usagePath(), "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AIUsageLog)
      .reverse()
      .slice(0, limit);
  } catch {
    return [];
  }
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export async function countToday(userId: string): Promise<number> {
  const key = dayKey();
  const logs = await listUsage(500);
  return logs.filter((l) => l.userId === userId && l.createdAt.startsWith(key) && l.ok).length;
}

export async function checkQuota(userId: string, tier: UserTier) {
  const used = await countToday(userId);
  const limit = quotaForTier(tier);
  return { used, limit, remaining: Math.max(0, limit - used), allowed: used < limit };
}
