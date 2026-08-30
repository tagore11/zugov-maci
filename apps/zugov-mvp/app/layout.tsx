import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import "./globals.css";

/* Self-hosted at build time. A local-first app should not phone a font CDN. */
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-inter" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "ZuGov",
  description: "Topluluk kararları için yerel çalışan karar altyapısı.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="min-h-[100dvh]">{children}</body>
    </html>
  );
}
