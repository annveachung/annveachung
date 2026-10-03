// Packed field of floating greeting bubbles for the hero. Salutations in many
// languages/scripts, mixed typefaces, varying sizes — a calm ambient motion.
// Pure-CSS transform animation (see globals.css) keeps 50+ bubbles at 60fps.
// Layout is generated with a SEEDED PRNG so server and client render identically
// (no hydration mismatch) while still looking organic.

// "Hello" in many languages (native scripts where natural).
const SALUTATIONS = [
  "Hello", "Hi", "Hey", "你好", "您好", "早安", "こんにちは", "おはよう",
  "안녕", "안녕하세요", "สวัสดี", "नमस्ते", "নমস্কার", "வணக்கம்", "ഹലോ",
  "Bonjour", "Salut", "Hola", "Buenas", "Ciao", "Salve", "Olá", "Oi",
  "Hallo", "Hoi", "Hej", "Cześć", "Ahoj", "Привіт", "Здравствуйте",
  "Γειά", "Καλημέρα", "مرحبا", "أهلا", "سلام", "שלום", "Merhaba", "Selam",
  "Xin chào", "Halo", "Apa kabar", "Kumusta", "Mabuhay", "Jambo", "Habari",
  "Sawubona", "Aloha", "Kia ora", "გამარჯობა", "Բարև", "Сайн уу", "Сәлем",
];

// Typeface pool — variables defined in layout.tsx via next/font.
const FONTS = [
  "var(--font-sora)",
  "var(--font-geist)",
  "var(--font-geist-mono)",
  "var(--font-playfair)",
  "var(--font-caveat)",
  "var(--font-space-grotesk)",
];

type Bubble = {
  text: string;
  font: string;
  italic: boolean;
  top: number; // %
  left: number; // %
  size: number; // px font-size
  opacity: number;
  dur: number; // s
  delay: number; // s (negative → desynced start)
  dx: number; // px drift
  dy: number; // px float
  r0: number; // deg
  r1: number; // deg
};

// Small deterministic PRNG (mulberry32).
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBubbles(): Bubble[] {
  const rng = mulberry32(20260627);
  const COLS = 10;
  const ROWS = 6;
  const cellW = 100 / COLS;
  const cellH = 100 / ROWS;
  const bubbles: Bubble[] = [];
  let salIdx = Math.floor(rng() * SALUTATIONS.length);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Drop a few cells for organic irregularity.
      if (rng() < 0.07) continue;

      // Jittered position within the cell, clamped so bubbles never leave view.
      const left = Math.min(
        95,
        Math.max(5, (c + 0.5) * cellW + (rng() - 0.5) * cellW * 0.85),
      );
      const top = Math.min(
        93,
        Math.max(7, (r + 0.5) * cellH + (rng() - 0.5) * cellH * 0.85),
      );

      // Size tiers: mostly small/medium, a few large.
      const tier = rng();
      const size =
        tier < 0.6
          ? 13 + rng() * 6
          : tier < 0.9
            ? 20 + rng() * 9
            : 30 + rng() * 14;

      // Larger bubbles read as nearer → slightly more opaque.
      const opacity = 0.55 + (size - 13) / 31 * 0.4 + rng() * 0.05;

      bubbles.push({
        text: SALUTATIONS[salIdx % SALUTATIONS.length],
        font: FONTS[Math.floor(rng() * FONTS.length)],
        italic: rng() < 0.18,
        top,
        left,
        size: Math.round(size * 10) / 10,
        opacity: Math.min(1, Math.round(opacity * 100) / 100),
        dur: 9 + rng() * 11, // 9–20s
        delay: -rng() * 20, // desync
        dx: (rng() - 0.5) * 26, // ±13px
        dy: -(5 + rng() * 12), // float up 5–17px
        r0: (rng() - 0.5) * 2, // ±1deg
        r1: (rng() - 0.5) * 4, // ±2deg
      });
      salIdx += 1 + Math.floor(rng() * 3); // spread the salutations around
    }
  }
  return bubbles;
}

// Generated once at module load — deterministic, so SSR === CSR.
const BUBBLES = buildBubbles();

export function FloatingLanguages() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="bubble-anchor pointer-events-none"
          style={{ top: `${b.top}%`, left: `${b.left}%` }}
        >
          <div
            className="bubble-float"
            style={
              {
                "--dur": `${b.dur}s`,
                "--delay": `${b.delay}s`,
                "--dx": `${b.dx}px`,
                "--dy": `${b.dy}px`,
                "--r0": `${b.r0}deg`,
                "--r1": `${b.r1}deg`,
              } as React.CSSProperties
            }
          >
            <span
              className="bubble pointer-events-auto"
              style={{
                fontFamily: b.font,
                fontSize: `${b.size}px`,
                fontStyle: b.italic ? "italic" : "normal",
                opacity: b.opacity,
              }}
            >
              {b.text}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
