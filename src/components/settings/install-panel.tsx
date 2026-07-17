"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsStandalone } from "@/hooks/use-online";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function SettingsInstallPanel() {
  const standalone = useIsStandalone();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function install() {
    if (!deferred) {
      setStatus("Use your browser menu → Add to Home Screen / Install app.");
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setStatus(choice.outcome === "accepted" ? "Install started." : "Install dismissed.");
    setDeferred(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-mint/10 p-2 text-mint">
          <Smartphone className="size-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold">Install EsiFit</h2>
          <p className="mt-1 text-sm text-muted">
            Add the app to your home screen for offline shell caching and faster launches.
          </p>
          {standalone ? (
            <p className="mt-3 text-sm text-mint">Already running as an installed app.</p>
          ) : (
            <Button type="button" className="mt-4" onClick={() => void install()}>
              <Download className="size-4" />
              Install app
            </Button>
          )}
          {status ? <p className="mt-2 text-xs text-muted">{status}</p> : null}
        </div>
      </div>
    </div>
  );
}
