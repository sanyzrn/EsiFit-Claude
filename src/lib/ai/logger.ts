type LogFields = Record<string, string | number | boolean | null | undefined>;

/** Structured logging utility — route to aggregators later without changing call sites. */
export function logInfo(event: string, fields: LogFields = {}) {
  console.info(JSON.stringify({ level: "info", event, ts: new Date().toISOString(), ...fields }));
}

export function logWarn(event: string, fields: LogFields = {}) {
  console.warn(JSON.stringify({ level: "warn", event, ts: new Date().toISOString(), ...fields }));
}

export function logError(event: string, fields: LogFields = {}) {
  console.error(JSON.stringify({ level: "error", event, ts: new Date().toISOString(), ...fields }));
}

export async function captureError(error: unknown, context: LogFields = {}) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logError("exception", { message, stack, ...context });
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    try {
      // Lightweight envelope-free ping so failures are not silent when DSN is set.
      await fetch("https://sentry.io/api/0/", {
        method: "HEAD",
        signal: AbortSignal.timeout(1500),
      }).catch(() => undefined);
      logWarn("sentry_dsn_configured", { note: "Install @sentry/nextjs for full reporting; DSN present." });
    } catch {
      /* ignore */
    }
  }
}
