"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fuzzyMatch, getCommands, registerCommand, subscribeCommands, type CommandItem } from "@/lib/command-registry";
import { useFeatureFlag } from "@/lib/feature-flags";
import { useCommandPaletteStore } from "@/stores/command-palette-store";

export function CommandPalette() {
  const enabled = useFeatureFlag("COMMAND_PALETTE");
  const { isOpen, open, close, toggle } = useCommandPaletteStore();
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => subscribeCommands(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!enabled) return;
    const unsubs = [
      registerCommand({
        id: "nav-dashboard",
        label: "Go to Dashboard",
        group: "navigation",
        keywords: ["home"],
        run: () => router.push("/dashboard"),
      }),
      registerCommand({
        id: "nav-blog",
        label: "Go to Articles",
        group: "navigation",
        keywords: ["blog", "content"],
        run: () => router.push("/blog"),
      }),
      registerCommand({
        id: "nav-pricing",
        label: "View pricing",
        group: "navigation",
        run: () => router.push("/#pricing"),
      }),
      registerCommand({
        id: "nav-workouts",
        label: "Go to Workouts",
        group: "navigation",
        keywords: ["training", "exercise", "gym"],
        run: () => router.push("/workouts"),
      }),
      registerCommand({
        id: "nav-nutrition",
        label: "Go to Nutrition",
        group: "navigation",
        keywords: ["meals", "macros", "food"],
        run: () => router.push("/nutrition"),
      }),
      registerCommand({
        id: "nav-calculators",
        label: "Go to Calculators",
        group: "navigation",
        keywords: ["bmi", "tdee", "tools"],
        run: () => router.push("/calculators"),
      }),
      registerCommand({
        id: "nav-analytics",
        label: "Go to Analytics",
        group: "navigation",
        keywords: ["progress", "charts", "stats"],
        run: () => router.push("/analytics"),
      }),
      registerCommand({
        id: "nav-settings",
        label: "Go to Settings",
        group: "navigation",
        keywords: ["install", "pwa"],
        run: () => router.push("/settings"),
      }),
      registerCommand({
        id: "nav-workout-builder",
        label: "Open workout builder",
        group: "navigation",
        keywords: ["routine", "program"],
        run: () => router.push("/workouts/builder"),
      }),
      registerCommand({
        id: "nav-workout-session",
        label: "Start workout session",
        group: "navigation",
        keywords: ["tracker", "live", "log sets"],
        run: () => router.push("/workouts/session"),
      }),
      registerCommand({
        id: "action-water",
        label: "Log water (+250 ml)",
        group: "actions",
        keywords: ["hydrate"],
        run: () => toast.success("Logged +250 ml water (mock)"),
      }),
      registerCommand({
        id: "action-rest",
        label: "Start rest timer",
        group: "actions",
        run: () => toast.message("Rest timer started (mock 90s)"),
      }),
      registerCommand({
        id: "action-theme",
        label: "Toggle theme",
        group: "actions",
        keywords: ["dark", "light"],
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      }),
      registerCommand({
        id: "calc-bmr",
        label: "Open BMR calculator",
        group: "content",
        keywords: ["calculator", "bmr", "metabolism"],
        run: () => router.push("/calculators/bmr"),
      }),
      registerCommand({
        id: "calc-tdee",
        label: "Open TDEE calculator",
        group: "content",
        keywords: ["calculator", "tdee", "calories"],
        run: () => router.push("/calculators/tdee"),
      }),
      registerCommand({
        id: "calc-1rm",
        label: "Open One Rep Max calculator",
        group: "content",
        keywords: ["calculator", "orm", "strength"],
        run: () => router.push("/calculators/one-rep-max"),
      }),
      registerCommand({
        id: "content-readiness",
        label: "Article: Readiness before volume",
        group: "content",
        run: () => router.push("/blog/training/readiness-before-volume"),
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [enabled, router, resolvedTheme, setTheme]);

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, toggle]);

  const items = useMemo(() => {
    void tick;
    return getCommands().filter((c) => fuzzyMatch(query, c));
  }, [query, tick]);

  const groups = useMemo(() => {
    const map: Record<CommandItem["group"], CommandItem[]> = {
      navigation: [],
      actions: [],
      content: [],
    };
    items.forEach((i) => map[i.group].push(i));
    return map;
  }, [items]);

  if (!enabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (o ? open() : close())}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <Command className="bg-transparent" shouldFilter={false}>
          <div className="border-b border-[var(--surface-glass-border)] px-3">
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages, actions, articles…"
              className="h-12 w-full bg-transparent type-body-md outline-none"
            />
          </div>
          <Command.List className="max-h-80 overflow-auto p-2">
            <Command.Empty className="px-3 py-6 type-body-sm text-[var(--foreground-muted)]">No matches.</Command.Empty>
            {(Object.keys(groups) as CommandItem["group"][]).map((group) =>
              groups[group].length ? (
                <Command.Group key={group} heading={group} className="px-2 py-2 type-caption uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                  {groups[group].map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        item.run();
                        close();
                        setQuery("");
                      }}
                      className="cursor-pointer rounded-[var(--radius-sm)] px-3 py-2 type-body-sm font-medium text-[var(--foreground)] aria-selected:bg-[var(--mint-dim)]"
                    >
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null,
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
