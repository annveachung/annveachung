// Single source of truth for the home page's section backgrounds and the
// gradient transitions between them. Edit colours / heights / easing here —
// the strips (<SectionFade>), the section backgrounds (CSS variables injected
// by sectionVars()), the hero's bottom fade and the Arsenal canvas edges all
// read from this file.

export type Ease = "eased" | "linear";

// --- Section background colours (top to bottom) ---------------------------
export const SECTIONS = {
  // "Ink & Soft graphite": A = ink, B = soft graphite.
  hero: "#0d1016",
  progression: "#171c24",
  arsenal: "#0d1016",
  whereabouts: "#171c24",
  gallery: "#0d1016",
  network: "#171c24",
} as const;

export type SectionKey = keyof typeof SECTIONS;
export type Palette = Record<SectionKey, string>;

// --- Transitions between neighbouring sections -----------------------------
// `phone` applies below the md breakpoint (768px), `desktop` from md up.
// height 0 = no strip (the section itself already blends; see CANVAS_EDGES).
// "eased" = smoothstep curve (soft start/end, best for long strips);
// "linear" = colour changes evenly across the whole height (best for short ones).
export interface Transition {
  from: SectionKey;
  to: SectionKey;
  phone: { height: number; ease: Ease };
  desktop: { height: number; ease: Ease };
}

export const TRANSITIONS: Transition[] = [
  { from: "hero",        to: "progression", phone: { height: 64, ease: "eased" },  desktop: { height: 96,  ease: "eased" } },
  { from: "progression", to: "arsenal",     phone: { height: 64, ease: "eased" },  desktop: { height: 96,  ease: "eased" } },
  { from: "arsenal",     to: "whereabouts", phone: { height: 0,  ease: "linear" }, desktop: { height: 160, ease: "eased" } },
  { from: "whereabouts", to: "gallery",     phone: { height: 64, ease: "linear" }, desktop: { height: 160, ease: "eased" } },
  { from: "gallery",     to: "network",     phone: { height: 56, ease: "eased" },  desktop: { height: 80,  ease: "eased" } },
];

export function transition(from: SectionKey, to: SectionKey): Transition {
  const t = TRANSITIONS.find((x) => x.from === from && x.to === to);
  if (!t) throw new Error(`No transition configured for ${from} → ${to}`);
  return t;
}

// --- Fades drawn INSIDE sections -------------------------------------------
// Hero: its corner glow + chips dissolve into the hero colour at the bottom.
export const HERO_BOTTOM_FADE = 80; // px

// Arsenal canvas edges. Top always fades from the Arsenal colour. At the
// bottom, if the phone strip to Whereabouts is 0, the canvas itself blends
// into the Whereabouts colour (one gradient instead of strip + canvas fade).
export const CANVAS_EDGES = {
  phone: { height: 64, ease: "linear" as Ease },
  desktop: { height: 96, ease: "eased" as Ease },
};

// CSS custom properties (--sec-hero, --sec-progression, …) set once on the page
// wrapper; section styles use var(--sec-…) so they follow this file.
export function sectionVars(palette: Palette = SECTIONS): Record<string, string> {
  return Object.fromEntries(
    Object.entries(palette).map(([k, v]) => [`--sec-${k}`, v]),
  );
}
