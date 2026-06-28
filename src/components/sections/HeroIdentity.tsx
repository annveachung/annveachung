"use client";

import { useState } from "react";

const GLOW_COLORS = [
  { color: "#ffefc0", shadow: "0 0 20px #ffefc0, 0 0 50px rgba(255,239,192,0.7)" },
  { color: "#8fe0dc", shadow: "0 0 20px #8fe0dc, 0 0 50px rgba(143,224,220,0.7)" },
  { color: "#ffffff", shadow: "0 0 20px #fff,    0 0 50px rgba(255,255,255,0.7)" },
  { color: "#fff4c4", shadow: "0 0 20px #fff4c4, 0 0 50px rgba(255,244,196,0.7)" },
  { color: "#c4f0ee", shadow: "0 0 20px #c4f0ee, 0 0 50px rgba(196,240,238,0.7)" },
];

type CharItem = { char: string; idx: number; isSpace: boolean };

function buildChars(name: string, location: string): CharItem[] {
  const items: CharItem[] = [];
  let idx = 0;
  for (const char of name) {
    items.push({ char, idx: idx++, isSpace: char === " " });
  }
  items.push({ char: "|", idx: -1, isSpace: false }); // separator — not part of wave
  for (const char of location) {
    items.push({ char, idx: idx++, isSpace: char === " " });
  }
  return items;
}

export function HeroIdentity() {
  const [hovered, setHovered] = useState<number | null>(null);

  const chars = buildChars("Annvea Chung", "Based in Toronto");

  return (
    <p
      className="font-headline font-semibold text-[22px] tracking-wide text-white select-none"
      style={{ overflow: "visible" }}
    >
      {chars.map((item, i) => {
        if (item.char === "|") {
          return (
            <span key="sep" className="inline-block mx-3 opacity-25 text-on-surface-variant">
              |
            </span>
          );
        }

        if (item.isSpace) {
          return <span key={i} className="inline-block w-[0.3em]" />;
        }

        const dist = hovered !== null ? Math.abs(item.idx - hovered) : Infinity;
        const glowStyle = GLOW_COLORS[item.idx % GLOW_COLORS.length];

        // Gaussian falloff — sigma 3.2 gives a wide, smooth ~7-char wave
        const sigma = 3.2;
        const t = dist === Infinity ? 0 : Math.exp(-(dist * dist) / (2 * sigma * sigma));

        const scale = 1 + 1.9 * t;
        // Compensate for the visual overflow: scaled char is (scale-1)*charWidth/2
        // wider on each side than its layout box. Push neighbours apart with margin.
        const CHAR_WIDTH_EM = 0.54;
        const extraMarginEm = (scale - 1) * 0.5 * CHAR_WIDTH_EM;

        const color = t > 0.85 ? glowStyle.color : "inherit";
        const textShadow = t > 0.85 ? glowStyle.shadow : "none";
        const zIndex = Math.round(t * 50);

        return (
          <span
            key={i}
            className="inline-block cursor-default"
            style={{
              transform: `scale(${scale.toFixed(3)})`,
              transformOrigin: "center bottom",
              marginLeft: `${extraMarginEm.toFixed(3)}em`,
              marginRight: `${extraMarginEm.toFixed(3)}em`,
              color,
              textShadow,
              transition:
                "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), margin 0.2s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s ease, text-shadow 0.2s ease",
              position: "relative",
              zIndex,
            }}
            onMouseEnter={() => setHovered(item.idx)}
            onMouseLeave={() => setHovered(null)}
          >
            {item.char}
          </span>
        );
      })}
    </p>
  );
}
