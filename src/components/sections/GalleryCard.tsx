"use client";

import { useEffect, useRef, useState } from "react";
import { makePacmanPath } from "@/lib/pacman";
import type { SiteData } from "@/lib/data";

type GalleryImage = SiteData["gallery"][number];

const YELLOW = "#fff4c4";

// On hover, a small chomping pacman "announces" where the photo was taken —
// the location is authored via the gallery's Caption field in the admin panel.
export function GalleryCard({ img }: { img: GalleryImage }) {
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
    <div
      className="gallery-card relative flex-shrink-0 w-[80vw] sm:w-[420px] md:w-[640px] aspect-video bg-cover bg-center rounded-xl mx-4 border border-outline-variant/20 shadow-2xl overflow-hidden"
      style={{ backgroundImage: `url('${img.url}')` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
  );
}
