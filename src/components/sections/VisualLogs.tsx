import type { SiteData } from "@/lib/data";
import { GalleryCard } from "@/components/sections/GalleryCard";

export function VisualLogs({ gallery }: { gallery: SiteData["gallery"] }) {
  if (gallery.length === 0) return null;

  // Duplicate for a seamless marquee loop.
  const items = [...gallery, ...gallery];

  return (
    <section id="logs" className="visual-logs w-full scroll-mt-32 pt-10">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <span className="section-label">
          Gallery
        </span>
        <h2 className="section-title">
          Archive of Little Things
        </h2>
        <p className="section-sub">
          Paused moments from a moving life.
        </p>
      </div>
      <div data-reveal className="w-full overflow-hidden pb-2">
        <div className="marquee">
          <div className="marquee-content flex">
            {items.map((img, i) => (
              <GalleryCard key={`${img.id}-${i}`} img={img} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
