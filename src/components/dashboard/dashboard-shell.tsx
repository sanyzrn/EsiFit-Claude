"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import type { UserTier } from "@/lib/types";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/blog", label: "Articles", icon: Search },
  { href: "/#pricing", label: "Plans", icon: Settings },
];

function tierBadge(tier: UserTier) {
  if (tier === "vip-plus") return "vip-plus" as const;
  if (tier === "vip") return "vip" as const;
  if (tier === "coach") return "coach" as const;
  return "free" as const;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const openPalette = useCommandPaletteStore((s) => s.open);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
    if (status === "expired") router.replace("/login?expired=1");
  }, [status, router]);

  if (!user || status !== "authenticated") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="type-body-sm text-[var(--foreground-muted)]">Checking session…</p>
      </div>
    );
  }

  const unread = 2;

  return (
    <div className="min-h-[100dvh] bg-[var(--surface-0)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--surface-glass-border)] bg-[var(--surface-1)] transition-[width] duration-[var(--duration-smooth)] md:flex md:flex-col",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-[family-name:var(--font-heading)] font-bold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--mint)] to-[var(--plasma)] text-[#04140e] type-data-sm">
              E
            </span>
            {!collapsed ? <span>EsiFit</span> : null}
          </Link>
          <Button variant="ghost" size="icon" aria-label="Collapse sidebar" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-2" aria-label="Dashboard">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 type-body-sm font-semibold transition-colors",
                  active
                    ? "bg-[var(--mint-dim)] text-[var(--mint)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? item.label : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--surface-glass-border)] p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed ? "Sign out" : null}
          </Button>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-[var(--duration-smooth)]", collapsed ? "md:pl-[72px]" : "md:pl-60")}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--surface-glass-border)] bg-[var(--surface-0)]/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="type-caption text-[var(--foreground-subtle)]">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}
              </p>
              <p className="type-h4">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="hidden gap-2 sm:inline-flex" onClick={openPalette}>
              <Command className="h-3.5 w-3.5" />
              Command
              <kbd className="type-caption rounded bg-[var(--surface-3)] px-1.5">⌘K</kbd>
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotifOpen((v) => !v)}>
                <Bell className="h-4 w-4" />
                {unread ? (
                  <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-[var(--mint)] px-1 text-center text-[10px] font-bold text-[#04140e]">
                    {unread}
                  </span>
                ) : null}
              </Button>
              {notifOpen ? (
                <div className="absolute right-0 top-12 z-40 w-72 rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-1)] p-3 shadow-[var(--shadow-float)]">
                  <p className="type-caption mb-2 font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Notifications</p>
                  <ul className="space-y-2">
                    <li className="type-body-sm">Readiness update ready</li>
                    <li className="type-body-sm text-[var(--foreground-muted)]">Hydration reminder</li>
                  </ul>
                </div>
              ) : null}
            </div>
            <Badge variant={tierBadge(user.tier)}>{user.role}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              Theme
            </Button>
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[var(--surface-1)] p-4 shadow-[var(--shadow-float)]">
            <div className="mb-4 flex justify-between">
              <span className="font-bold">EsiFit</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-[var(--radius-sm)] px-3 py-3 type-body-sm font-semibold hover:bg-[var(--surface-2)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
