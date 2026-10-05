"use client";

import { useEffect, useRef, useState } from "react";
import { makePacmanPath } from "@/lib/pacman";
import type { SiteData } from "@/lib/data";

type GalleryImage = SiteData["gallery"][number];

const YELLOW = "#fff4c4";

// On hover, a small chomping pacman "announces" where the photo was taken —
// the location is authored via the gallery's Caption field in the admin panel.
export function GalleryCard({ img, index = 0 }: { img: GalleryImage; index?: number }) {
  const [hover, setHover] = useState(false);
  const [mouth, setMouth] = useState(28);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!hover) return;
    function tick(now: number) {
      const open = Math.max(0, Math.sin(now * 0.006)) * 34;
      setMouth(open);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hover]);

  return (
    // Outer frame: rounded, clips everything. A slowly rotating conic light
    // sits behind the photo and only shows through the 2px gap around it,
    // so a dim, half-transparent glint travels along the border. The rotation
    // is a plain transform (GPU-composited, no repaints).
    <div
      className="gallery-card relative flex-shrink-0 w-[80vw] sm:w-[420px] md:w-[640px] aspect-video rounded-xl mx-4 shadow-2xl overflow-hidden bg-white/[0.06]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        aria-hidden
        className="gallery-orbit"
        style={{ animationDelay: `${-(index * 1.7) % 9}s` }}
      />
      <div
        className="absolute inset-[2px] rounded-[calc(0.75rem-2px)] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${img.url}')` }}
      >
        {img.caption && (
          <div
            className={`gallery-card-overlay absolute inset-x-0 bottom-0 flex items-center gap-3 px-5 py-4 ${
              hover ? "gallery-card-overlay--visible" : ""
            }`}
          >
            <svg
              viewBox="0 0 100 100"
              width={32}
              height={32}
              className="flex-shrink-0 drop-shadow-[0_0_6px_rgba(255,244,196,0.5)]"
            >
              <path d={makePacmanPath(hover ? mouth : 28)} fill={YELLOW} />
            </svg>
            <span className="font-label text-xs tracking-[0.08em] text-primary bg-charcoal/70 backdrop-blur-md border border-accent-turquoise/25 rounded-full px-4 py-1.5">
              Taken in {img.caption}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
