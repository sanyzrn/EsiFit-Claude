"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const HIDE_CHROME = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/2fa",
  "/onboarding",
  "/dashboard",
  "/workouts",
  "/nutrition",
  "/analytics",
  "/settings",
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide = HIDE_CHROME.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (hide) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
