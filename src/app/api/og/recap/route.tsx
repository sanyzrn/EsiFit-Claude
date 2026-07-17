import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const streak = searchParams.get("streak");
  const workouts = searchParams.get("workouts");
  const volume = searchParams.get("volume");
  const xp = searchParams.get("xp");
  const bf = searchParams.get("bf");
  const level = searchParams.get("level") || "1";

  const rows: { label: string; value: string }[] = [];
  if (streak) rows.push({ label: "Streak", value: `${streak} days` });
  if (workouts) rows.push({ label: "Workouts", value: workouts });
  if (volume) rows.push({ label: "Volume", value: `${Number(volume).toLocaleString()} kg` });
  if (xp) rows.push({ label: "XP", value: Number(xp).toLocaleString() });
  if (bf) rows.push({ label: "Body fat", value: `${bf}%` });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0B0D10 0%, #12181F 50%, #0d2a22 100%)",
          color: "#F4F6F8",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#00F5A0", letterSpacing: 4, textTransform: "uppercase" }}>
            EsiFit Weekly Recap
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, marginTop: 16 }}>Your week, wrapped</div>
          <div style={{ fontSize: 28, color: "#8b95a1", marginTop: 12 }}>Level {level}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {rows.map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px 28px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                minWidth: 180,
              }}
            >
              <div style={{ fontSize: 20, color: "#8b95a1" }}>{r.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
