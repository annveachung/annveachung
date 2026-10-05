"use client";

import { useEffect, useRef } from "react";

// Touch screens have no hover, so the .glass-sweep light only played when a tap
// happened to register as :hover on the right spot. This replays the sweep on
// ANY tap / press anywhere inside the parent .glass-sweep element.
export function TouchSweep() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const play = () => {
      host.classList.remove("sweep-now");
      void host.offsetWidth; // restart the animation even if it is mid-run
      host.classList.add("sweep-now");
    };
    const done = (e: AnimationEvent) => {
      if (e.animationName === "glass-sweep") host.classList.remove("sweep-now");
    };
    host.addEventListener("pointerdown", play, { passive: true });
    host.addEventListener("animationend", done);
    return () => {
      host.removeEventListener("pointerdown", play);
      host.removeEventListener("animationend", done);
    };
  }, []);
  return <span ref={ref} hidden />;
}
