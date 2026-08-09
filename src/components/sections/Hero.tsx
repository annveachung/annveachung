import type { SiteData } from "@/lib/data";
import { FloatingLanguages } from "@/components/sections/FloatingLanguages";
import { PacmanHero } from "@/components/sections/PacmanHero";

export function Hero({ settings }: { settings: SiteData["settings"] }) {
  return (
    <section className="nocturnal-gradient relative min-h-screen flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
      {/* Packed field of floating greeting bubbles filling the hero */}
      <FloatingLanguages />

      {/* Soft radial scrim so the identity stays readable over the bubbles */}
      <div className="hero-scrim absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(56rem,92%)] h-[26rem] z-[5] pointer-events-none" />

      {/* Centered hero identity */}
      <div className="relative z-10 text-center flex flex-col items-center gap-3">
        <PacmanHero />
      </div>
    </section>
  );
}
