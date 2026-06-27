import type { SiteData } from "@/lib/data";
import { FloatingLanguages } from "@/components/sections/FloatingLanguages";

export function Hero({ settings }: { settings: SiteData["settings"] }) {
  return (
    <section className="nocturnal-gradient relative min-h-screen flex items-center justify-center overflow-hidden px-margin-desktop">
      {/* Packed field of floating greeting bubbles filling the hero */}
      <FloatingLanguages />

      {/* Soft radial scrim so the title stays readable over the bubbles */}
      <div className="hero-scrim absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(56rem,92%)] h-[26rem] z-[5] pointer-events-none" />

      {/* Centered hero identity */}
      <div className="relative z-10 text-center flex flex-col items-center gap-3">
        <span className="text-5xl drop-shadow-[0_2px_12px_rgba(143,224,220,0.6)]">🌊</span>
        <p className="font-headline font-semibold text-[22px] tracking-wide text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] [text-shadow:0_0_24px_rgba(143,224,220,0.45)]">
          Annvea Chung&nbsp;&nbsp;|&nbsp;&nbsp;Based in Toronto
        </p>
      </div>
    </section>
  );
}
