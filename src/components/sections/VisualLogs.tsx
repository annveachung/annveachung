import type { SiteData } from "@/lib/data";

export function VisualLogs({ gallery }: { gallery: SiteData["gallery"] }) {
  if (gallery.length === 0) return null;

  // Duplicate for a seamless marquee loop.
  const items = [...gallery, ...gallery];

  return (
    <section id="logs" className="visual-logs w-full scroll-mt-32">
      <div className="max-w-7xl mx-auto px-margin-desktop mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-headline font-bold text-[32px] leading-[40px] text-primary">
            Visual Logs
          </h2>
          <p className="text-on-surface-variant">
            Glimpses of a journey through tech and travel.
          </p>
        </div>
        <button className="text-secondary font-label text-[11px] tracking-[0.1em] uppercase border border-accent-turquoise/40 px-6 py-2 rounded-full hover:bg-accent-turquoise/10 hover:border-accent-turquoise transition-all">
          View All Entries
        </button>
      </div>
      <div className="w-full overflow-hidden pb-12">
        <div className="marquee">
          <div className="marquee-content flex">
            {items.map((img, i) => (
              <div
                key={`${img.id}-${i}`}
                title={img.caption}
                className="flex-shrink-0 w-[640px] aspect-video bg-cover bg-center rounded-xl mx-4 border border-outline-variant/20 shadow-2xl"
                style={{ backgroundImage: `url('${img.url}')` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
