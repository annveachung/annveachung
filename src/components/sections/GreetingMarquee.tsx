import type { SiteData } from "@/lib/data";

export function GreetingMarquee({
  greetings,
}: {
  greetings: SiteData["greetings"];
}) {
  if (greetings.length === 0) return null;

  // Flow all greetings together as one long line (em-space between words so
  // they read as a continuous multilingual sentence, no separators).
  const line = greetings.map((g) => g.text).join(" ");

  return (
    <div className="w-full bg-midnight py-5 border-y border-outline-variant/30 overflow-hidden mb-xl">
      <div className="marquee">
        {/* Two identical copies for a seamless loop; trailing padding keeps
            spacing across the seam. */}
        <div className="marquee-content font-headline text-[32px] text-on-surface-variant opacity-40">
          <span className="whitespace-nowrap pr-12">{line}</span>
          <span className="whitespace-nowrap pr-12">{line}</span>
        </div>
      </div>
    </div>
  );
}
