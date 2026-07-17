import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai/generate";
import { generateBodySchema, readMockSession } from "@/lib/ai/session";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isFeatureEnabled("AI_ANALYTICS") && !isFeatureEnabled("AI_CHAT")) {
    return NextResponse.json({ error: "AI features disabled" }, { status: 404 });
  }

  const session = readMockSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Sign in required", code: "auth_required" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = generateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.touchpoint === "chat" && !isFeatureEnabled("AI_CHAT")) {
    return NextResponse.json({ error: "AI chat disabled" }, { status: 404 });
  }
  if (parsed.data.touchpoint !== "chat" && !isFeatureEnabled("AI_ANALYTICS")) {
    return NextResponse.json({ error: "AI analytics disabled" }, { status: 404 });
  }

  const result = await generateAIResponse({
    userId: session.userId,
    tier: session.tier,
    request: {
      prompt: parsed.data.prompt,
      context: parsed.data.context,
      touchpoint: parsed.data.touchpoint,
      stream: parsed.data.stream,
    },
  });

  return NextResponse.json(result);
}
