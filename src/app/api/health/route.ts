import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "esifit",
    phase: 1,
    timestamp: new Date().toISOString(),
  });
}
