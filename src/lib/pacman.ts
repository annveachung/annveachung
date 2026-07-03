const SVG_R = 40;

// Generates a pacman wedge path on a 100x100 viewBox; `deg` is the mouth's
// half-angle in degrees (0 = fully closed, ~34 = fully open).
export function makePacmanPath(deg: number): string {
  if (deg < 1)
    return `M10,50 A${SVG_R},${SVG_R},0,1,0,90,50 A${SVG_R},${SVG_R},0,1,0,10,50`;
  const r = (deg * Math.PI) / 180;
  const ux = (50 + SVG_R * Math.cos(r)).toFixed(2);
  const uy = (50 - SVG_R * Math.sin(r)).toFixed(2);
  const lx = ux;
  const ly = (50 + SVG_R * Math.sin(r)).toFixed(2);
  return `M50,50 L${ux},${uy} A${SVG_R},${SVG_R},0,1,0,${lx},${ly}Z`;
}
