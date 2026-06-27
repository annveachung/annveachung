import type { SiteData } from "@/lib/data";
import { FloatingLanguages } from "@/components/sections/FloatingLanguages";

export function Hero({ settings }: { settings: SiteData["settings"] }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-margin-desktop">
      {/* Packed field of floating greeting bubbles filling the hero */}
      <FloatingLanguages />

      {/* Soft radial scrim so the title stays readable over the bubbles */}
      <div className="hero-scrim absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(56rem,92%)] h-[26rem] z-[5] pointer-events-none" />

      {/* Centered hero copy (sits above the bubbles) */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="font-headline font-bold text-[80px] leading-tight text-primary mb-6 tracking-tighter">
          {settings.heroTitle}
        </h1>
        <p className="text-secondary font-headline text-[32px] leading-[40px] max-w-2xl mx-auto opacity-90">
          {settings.heroSubtitle}
        </p>
      </div>
    </section>
  );
}
