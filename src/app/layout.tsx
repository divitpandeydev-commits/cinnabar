import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinnabar — The Artisanal URL Shortener & Link Intelligence Engine",
  description:
    "Transform unruly URLs into refined, lightning-fast, and trackable links with custom slugs, instant QR code rendering, and real-time telemetry.",
  keywords: ["URL shortener", "custom alias", "QR code generator", "link tracking", "link analytics", "Cinnabar"],
  authors: [{ name: "Cinnabar Engineering" }],
  openGraph: {
    title: "Cinnabar — The Artisanal URL Shortener",
    description: "Refined, lightning-fast, and privacy-first URL shortening with custom slugs and link intelligence.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#991B1B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
