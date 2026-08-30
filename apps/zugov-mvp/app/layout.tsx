import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit, Source_Serif_4 } from "next/font/google";
import "./globals.css";

/* Self-hosted at build time. A local-first app should not phone a font CDN.
   All three carry the Turkish diacritics, which is why latin-ext is loaded. */
const outfit = Outfit({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-outfit" });
const sourceSerif = Source_Serif_4({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], variable: "--font-source-serif" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "ZuGov",
  description: "Topluluk kararları için, bu cihazda çalışan karar aracı.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${outfit.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body className="min-h-[100dvh]">{children}</body>
    </html>
  );
}
