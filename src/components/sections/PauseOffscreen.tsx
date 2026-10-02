"use client";

import { useEffect, useRef } from "react";

// Marks the parent element `data-paused="true"` while it's scrolled off-screen
// so CSS can pause its (many) running animations — see `[data-paused]` in
// globals.css. Renders nothing visible.
export function PauseOffscreen() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const io = new IntersectionObserver(([entry]) => {
      parent.dataset.paused = entry.isIntersecting ? "false" : "true";
    });
    io.observe(parent);
    return () => io.disconnect();
  }, []);
  return <span ref={ref} hidden />;
}
