"use client";

import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-online";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const online = useOnline();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center transition-transform duration-300",
        online ? "-translate-y-full" : "translate-y-0",
      )}
      aria-live="polite"
    >
      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted shadow-lg">
        <WifiOff className="size-3.5 text-gold" />
        Offline — changes sync when you reconnect
      </div>
    </div>
  );
}
