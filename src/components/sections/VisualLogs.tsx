import type { SiteData } from "@/lib/data";
import { GalleryCard } from "@/components/sections/GalleryCard";

export function VisualLogs({ gallery }: { gallery: SiteData["gallery"] }) {
  if (gallery.length === 0) return null;

  // Duplicate for a seamless marquee loop.
  const items = [...gallery, ...gallery];

  return (
    <section id="logs" className="visual-logs w-full scroll-mt-32 pt-10 bg-[#141b1f]">
      <div className="max-w-7xl mx-auto px-margin-desktop mb-8">
        <span className="font-label text-[11px] tracking-[0.3em] uppercase text-secondary">
          Gallery
        </span>
        <h2 className="font-headline font-bold text-[32px] leading-[40px] text-primary mt-2">
          Archive of Little Things
        </h2>
        <p className="text-on-surface-variant">
          Paused moments from a moving life.
        </p>
      </div>
      <div className="w-full overflow-hidden pb-2">
        <div className="marquee">
          <div className="marquee-content flex">
            {items.map((img, i) => (
              <GalleryCard key={`${img.id}-${i}`} img={img} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
