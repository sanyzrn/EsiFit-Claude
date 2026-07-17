import { createMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "How EsiFit handles personal and health-related data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container-esi max-w-3xl pb-24 pt-28">
      <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Legal</p>
      <h1 className="type-h1 mt-3">Privacy Policy</h1>
      <p className="type-body-md mt-4 text-[var(--foreground-muted)]">
        Placeholder policy for Phases 1–5. Health metrics in EsiFit are self-reported and are not medical records.
      </p>
      <div className="prose-esi mt-8 space-y-4 type-body-md text-[var(--foreground-muted)]">
        <p>
          <strong className="text-[var(--foreground)]">What we collect (mock today):</strong> account profile fields,
          workout/nutrition logs, calculator history stored locally, and community posts you choose to publish.
        </p>
        <p>
          <strong className="text-[var(--foreground)]">Sharing defaults:</strong> Weekly Recap and share cards default to
          safer stats (streak, workouts, volume, XP) and exclude sensitive body metrics unless you opt in.
        </p>
        <p>
          <strong className="text-[var(--foreground)]">AI (Phase 5):</strong> When enabled, prompts send only the context
          needed for that insight — not your full history by default.
        </p>
        <p>
          <Link href="/" className="text-[var(--plasma)] hover:underline">
            Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
