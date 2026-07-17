import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createMetadata, siteConfig } from "@/lib/seo";
import "./globals.css";

const heading = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const data = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
});

export const metadata: Metadata = {
  ...createMetadata({}),
  applicationName: siteConfig.name,
  authors: [{ name: "EsiFit" }],
  keywords: ["fitness", "workout tracker", "nutrition", "readiness", "EsiFit"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0D" },
    { media: "(prefers-color-scheme: light)", color: "#F4F6F8" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} ${data.variable} antialiased`}>
        <AppProviders>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
