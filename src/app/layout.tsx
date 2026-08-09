import type { Metadata } from "next";
import {
  Sora,
  Geist,
  Geist_Mono,
  Playfair_Display,
  Caveat,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

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

// Extra typefaces for the packed greeting bubbles — an elegant serif, a
// handwriting script, and a geometric grotesque give the field its variety.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Annvea Chung's Web",
  description:
    "Architecting immersive digital experiences at the intersection of technical precision and artistic whimsy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${geist.variable} ${geistMono.variable} ${playfair.variable} ${caveat.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
