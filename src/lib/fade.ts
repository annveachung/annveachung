// Gradient maths shared by every section transition (HTML strips, the hero's
// bottom fade and the Arsenal canvas edges). Stops are computed in JS rather
// than with CSS color-mix() so the result doesn't depend on the CSS toolchain
// or browser support.

import type { Ease } from "@/lib/sections";

export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 0..1 → 0..1 progress for the chosen easing.
export function easeAt(t: number, ease: Ease): number {
  return ease === "linear" ? t : t * t * (3 - 2 * t);
}

const STEPS = 12;

// Vertical CSS gradient from one colour to another.
export function fadeGradient(from: string, to: string, ease: Ease = "eased"): string {
  if (ease === "linear") return `linear-gradient(to bottom, ${from}, ${to})`;
  const a = rgb(from), b = rgb(to);
  const stops = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS, k = easeAt(t, ease);
    const c = a.map((v, j) => Math.round(v + (b[j] - v) * k));
    return `rgb(${c[0]},${c[1]},${c[2]}) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

// Vertical CSS gradient fading a single colour from transparent to opaque.
export function fadeToOpaque(color: string, ease: Ease = "eased"): string {
  const [r, g, b] = rgb(color);
  const stops = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    return `rgba(${r},${g},${b},${easeAt(t, ease).toFixed(3)}) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

// Canvas version: add stops to a CanvasGradient so `color` goes from alpha
// `a0` to `a1` along it.
export function addCanvasFadeStops(
  grad: CanvasGradient, color: string, a0: number, a1: number, ease: Ease,
) {
  const [r, g, b] = rgb(color);
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, a = a0 + (a1 - a0) * easeAt(t, ease);
    grad.addColorStop(t, `rgba(${r},${g},${b},${a.toFixed(3)})`);
  }
}
