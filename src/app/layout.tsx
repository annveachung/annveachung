import type { Metadata } from "next";
import { Sora, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Display / headlines — geometric, techy contrast against Geist Sans.
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

// Primary body & UI face.
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
});

// Labels, caps and technical readouts — same family as Geist Sans for a
// cohesive system, monospace for an engineering accent.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Annvea Chung | Nocturnal Shoreline Tech",
  description:
    "Architecting immersive digital experiences at the intersection of technical precision and artistic whimsy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${geist.variable} ${geistMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
