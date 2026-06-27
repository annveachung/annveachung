import type { SiteData } from "@/lib/data";

export function Hero({ settings }: { settings: SiteData["settings"] }) {
  return (
    <section className="max-w-7xl mx-auto px-margin-desktop text-center mb-xl">
      <h1 className="font-headline font-bold text-[80px] leading-tight text-primary mb-6 tracking-tighter">
        {settings.heroTitle}
      </h1>
      <p className="text-secondary font-headline text-[32px] leading-[40px] max-w-2xl mx-auto opacity-90">
        {settings.heroSubtitle}
      </p>
    </section>
  );
}
