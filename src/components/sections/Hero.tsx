import type { SiteData } from "@/lib/data";
import { FloatingLanguages } from "@/components/sections/FloatingLanguages";
import { fadeToOpaque } from "@/lib/fade";
import { HERO_BOTTOM_FADE, SECTIONS } from "@/lib/sections";
import { PacmanHero } from "@/components/sections/PacmanHero";

export function Hero({ settings, phone = false }: { settings: SiteData["settings"]; phone?: boolean }) {
  return (
    <section className="nocturnal-gradient relative min-h-screen flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
      {/* Packed field of floating greeting bubbles filling the hero */}
      <FloatingLanguages lite={phone} />

      {/* Soft radial scrim so the identity stays readable over the bubbles */}
      <div className="hero-scrim absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(56rem,92%)] h-[26rem] z-[5] pointer-events-none" />

      {/* Bottom fade: the hero's corner glow and the chips dissolve into the page
          background, so there is no step where the hero meets the next strip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6]"
        style={{ height: HERO_BOTTOM_FADE, background: fadeToOpaque(SECTIONS.hero) }}
      />

      {/* Centered hero identity */}
      <div className="relative z-10 text-center flex flex-col items-center gap-3">
        <PacmanHero lite={phone} />
      </div>
    </section>
  );
}
