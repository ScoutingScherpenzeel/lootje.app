import type { Metadata } from "next";
import "./globals.css";
import Snowfall from "@/components/Snowfall";
import SiteFooter from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import React from "react";

// Metadata for the application
export const metadata: Metadata = {
  title: "lootje.app – Eenvoudig lootjes trekken",
  description: "Lootjes trekken, zonder poespas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`relative min-h-screen bg-white antialiased`}>
        <Snowfall style={{ zIndex: 50 }} />
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
