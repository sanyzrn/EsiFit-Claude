"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/overlays";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        {children}
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
    </NextThemesProvider>
  );
}
