"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/overlays";
import { initAuthCrossTabSync, useAuthStore } from "@/stores/auth-store";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { CelebrationHost } from "@/components/celebration/celebration";
import { AskAIBubble } from "@/components/ai/ask-ai-bubble";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";

function AuthLifecycle() {
  const checkExpiry = useAuthStore((s) => s.checkExpiry);
  const hydrate = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrate();
    const cleanup = initAuthCrossTabSync();
    const id = window.setInterval(checkExpiry, 30_000);
    return () => {
      cleanup();
      window.clearInterval(id);
    };
  }, [checkExpiry, hydrate]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>
        <TooltipProvider delayDuration={200}>
          <AuthLifecycle />
          <ServiceWorkerRegister />
          {children}
          <CelebrationHost />
          <AskAIBubble />
          <CommandPalette />
          <Toaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "glass !border-[var(--surface-glass-border)] !bg-[var(--surface-1)] !text-[var(--foreground)]",
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
