import { NextResponse } from "next/server";
import { getPublicAIStatus } from "@/lib/ai/config";
import { listUsage, checkQuota } from "@/lib/ai/usage-store";
import { readMockSession } from "@/lib/ai/session";
import { nextResetISO } from "@/lib/ai/quota";
import { DAILY_AI_QUOTA } from "@/lib/ai/quota";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = readMockSession(req);
  const status = getPublicAIStatus();

  if (!session) {
    return NextResponse.json({
      status,
      quotas: DAILY_AI_QUOTA,
      usage: [],
      auth: false,
    });
  }

  const quota = await checkQuota(session.userId, session.tier);
  const usage = await listUsage(80);
  const mine = usage.filter((u) => u.userId === session.userId).slice(0, 40);
  const isAdmin = session.tier === "admin" || session.tier === "super-admin" || session.tier === "coach";

  return NextResponse.json({
    status,
    auth: true,
    quota: { ...quota, resetsAt: nextResetISO() },
    quotas: DAILY_AI_QUOTA,
    usage: isAdmin ? usage.slice(0, 80) : mine,
  });
}
