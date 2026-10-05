import { fadeGradient } from "@/lib/fade";
import { SECTIONS, transition, type SectionKey } from "@/lib/sections";

// Gradient strip between two sections. Colours, heights and easing come from
// lib/sections.ts — edit them there, not here.
export function SectionFade({ from, to }: { from: SectionKey; to: SectionKey }) {
  const { phone, desktop } = transition(from, to);
  const a = SECTIONS[from], b = SECTIONS[to];
  return (
    <>
      {phone.height > 0 && (
        <div
          aria-hidden
          className="md:hidden"
          style={{ height: phone.height, background: fadeGradient(a, b, phone.ease) }}
        />
      )}
      {desktop.height > 0 && (
        <div
          aria-hidden
          className="hidden md:block"
          style={{ height: desktop.height, background: fadeGradient(a, b, desktop.ease) }}
        />
      )}
    </>
  );
}
