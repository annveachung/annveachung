// Eased (smoothstep) vertical gradient between two colours, as explicit rgba
// stops. Computed in JS rather than CSS color-mix() so the result doesn't
// depend on the CSS toolchain or browser support. Passing `alphaOnly` fades a
// single colour from transparent to opaque instead (used to dissolve content
// into a background).

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const ease = (t: number) => t * t * (3 - 2 * t);

export function fadeGradient(from: string, to: string, steps = 12): string {
  const a = rgb(from), b = rgb(to);
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps, k = ease(t);
    const c = a.map((v, j) => Math.round(v + (b[j] - v) * k));
    return `rgb(${c[0]},${c[1]},${c[2]}) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

export function fadeToOpaque(color: string, steps = 12): string {
  const [r, g, b] = rgb(color);
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return `rgba(${r},${g},${b},${ease(t).toFixed(3)}) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}
