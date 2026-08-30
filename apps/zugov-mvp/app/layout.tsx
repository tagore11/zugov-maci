import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

/* One superfamily, three voices. Self-hosted at build time: a local-first app
   should not phone a font CDN. latin-ext carries the Turkish diacritics. */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});
const plexSerif = IBM_Plex_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-plex-serif",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "ZuGov",
  description: "Topluluk kararları için, bu cihazda çalışan karar aracı.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}>
      <body className="min-h-[100dvh]">{children}</body>
    </html>
  );
}
