"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

const EASE = (t: number) => 1 - Math.pow(1 - t, 3.4);

// Physics-based, inertia-driven smooth scrolling (Lenis). The wheel/touch
// delta feeds a velocity that eases toward the target each frame — momentum
// carries you between sections, with a force-like settle rather than a hard
// stop. Respects prefers-reduced-motion.
export function SmoothScroll() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Phones/tablets: keep native scrolling. Lenis' syncTouch re-implements
    // touch momentum in JS, which fights the browser and feels laggy on iOS.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      return;
    }

    const lenis = new Lenis({
      // Higher duration + gentle ease = longer inertia glide between sections.
      duration: 1.25,
      easing: EASE, // ease-out cubic-ish, soft landing
      smoothWheel: true,
      // Wheel force multiplier — lower = heavier, more momentum-driven feel.
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      syncTouch: true,
    });

    // Proximity section-snapping: gently settles to a section's top only when
    // you come to rest near one. Tall sections (skill tree, map) stay freely
    // scrollable — no slideshow lock. No-op on routes without these ids.
    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "50%", // snaps within ~50% of viewport of a boundary
      duration: 1.0,
      easing: EASE,
      debounce: 500,
    });
    snap.add(0); // Hero top
    for (const id of ["skills", "toolkit", "nodes", "logs"]) {
      const el = document.getElementById(id);
      if (el) snap.addElement(el, { align: ["start"] });
    }
    // Snap point at the very bottom (Network section's end). Without it, a
    // short last section sits within the proximity range of the Gallery's
    // snap point, so resting near the bottom pulled you back up and you could
    // never reach the end of the page.
    const last = document.getElementById("contact");
    if (last) snap.addElement(last, { align: ["end"] });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Smoothly fly to in-page anchors (navbar links) with the same physics.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -80 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      snap.destroy();
      lenis.destroy();
    };
  }, []);

  return null;
}
