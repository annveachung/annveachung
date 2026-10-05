"use client";

import { useEffect } from "react";

// Reveals content only when the visitor reaches it: every section heading
// (.section-label / .section-title / .section-sub) and anything marked
// data-reveal fades/slides in the first time it scrolls into view, then stays.
// Elements entering together are staggered in reading order.
//
// (Progression cards, the Arsenal orbs, the map countries and the hero chips
// have their own entrance animations.)
const SELECTOR = ".section-label, .section-title, .section-sub, [data-reveal]";
const STAGGER = 0.12; // s
const MAX_DELAY = 1.2; // s

export function RevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (!els.length) return;
    // Only hide things once JS is running (no-JS visitors see everything).
    document.documentElement.classList.add("reveal-ready");

    const pending = new Set(els);
    const reveal = (list: HTMLElement[]) => {
      list
        .filter((el) => pending.has(el))
        .sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return ra.top - rb.top || ra.left - rb.left;
        })
        .forEach((el, k) => {
          pending.delete(el);
          io.unobserve(el);
          const delay = Math.min(MAX_DELAY, k * STAGGER);
          el.style.transitionDelay = `${delay}s`;
          el.classList.add("revealed");
          // Clear the stagger afterwards so hover transitions stay instant.
          setTimeout(() => { el.style.transitionDelay = ""; }, (delay + 1) * 1000);
        });
    };

    const io = new IntersectionObserver(
      (entries) => reveal(entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)),
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // Safety net (some mobile browsers skip observer callbacks during fast
    // momentum scrolling): on scroll, reveal anything already on screen, and
    // anything the visitor has scrolled past.
    let raf = 0;
    const check = () => {
      raf = 0;
      const vh = window.innerHeight;
      reveal([...pending].filter((el) => el.getBoundingClientRect().top < vh * 0.94));
      if (!pending.size) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
