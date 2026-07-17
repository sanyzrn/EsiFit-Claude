"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFeatureFlag } from "@/lib/feature-flags";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Articles", flag: "BLOG" as const },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const blogEnabled = useFeatureFlag("BLOG");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = navLinks.filter((l) => !("flag" in l) || (l.flag === "BLOG" && blogEnabled));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-[var(--duration-smooth)] ease-[var(--ease-smooth)]",
        scrolled ? "glass border-b border-[var(--surface-glass-border)]" : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container-esi flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--mint)] to-[var(--plasma)] text-[#04140e] type-data-sm font-bold">
            E
          </span>
          <span>EsiFit</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="type-body-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button className="hidden sm:inline-flex" asChild>
            <Link href="/signup">Start free</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--surface-glass-border)] bg-[var(--surface-1)] md:hidden">
          <nav className="container-esi flex flex-col gap-1 py-4" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-sm)] px-3 py-3 type-body-md font-medium hover:bg-[var(--surface-2)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button className="mt-2" asChild>
              <Link href="/#pricing" onClick={() => setOpen(false)}>
                Start free
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
