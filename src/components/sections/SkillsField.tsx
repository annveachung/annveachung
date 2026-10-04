"use client";

import { useEffect, useRef } from "react";
import type { SiteData } from "@/lib/data";

type TreeNode = SiteData["treeNodes"][number] & { glyph?: { path: string; stroke: boolean } | null };

// --- Colour palette -----------------------------------------------------
// Soft pastels drawn from the site theme (turquoise + buttery yellow as the
// anchors, with slate, sea-glass, sand and lilac as supporting tones). Each
// orb gets one, cycling through in order so neighbours differ.
const HEXES = ["#8fe0dc", "#ffefc0", "#b2c8d7", "#a8e6c3", "#f2cfae", "#c3c4f0", "#f0bcc4"];
interface Tint { a: string; hex: string }
const PAL: Tint[] = HEXES.map((hex) => {
  const n = parseInt(hex.slice(1), 16);
  return { hex, a: `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},` };
});

// --- Physics constants --------------------------------------------------
const SPEED   = 0.55;    // base drift speed (px per 60fps tick)
const SIGMA   = 120;     // Gaussian sigma for field wells

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function monogram(label: string) {
  const words = label.split(/[\s/+&.-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const w = words[0] ?? "?";
  return w.charAt(0).toUpperCase() + w.charAt(1).toLowerCase();
}

// --- Internal types -----------------------------------------------------
interface PNode {
  id: string; label: string; tint: Tint; icon: Path2D | null; stroked: boolean;
  x: number;  y: number;  vx: number; vy: number;
  r: number;
  hx: number; hy: number; // home position (compact layout)
  phase: number;
}

// --- Component ----------------------------------------------------------
export function SkillsField({ skills }: { skills: TreeNode[] }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const S   = useRef({
    nodes:   [] as PNode[],
    raf:     0,
    last:    0,
    revealReq: false, // scrolled into view enough to start the entrance
    revealT0: -1,     // timestamp the entrance started (orbs fade in one by one, once)
    w: 0, h: 0, dpr: 1,
    topBound: 0, bottomBound: 0,
    compact: false, // narrow screens: tidy grid with gentle bobbing instead of free-roaming bubbles
  });

  useEffect(() => {
    const canvas = cvs.current!;
    const s = S.current;
    s.dpr = Math.min(2, window.devicePixelRatio || 1); // 3x canvases are costly on phones

    // --- Layout ---------------------------------------------------------
    // Free-roaming field (tablet/desktop). The canvas grows with the number of
    // skills so each bubble keeps its own breathing room (bubble + label +
    // gap per skill) instead of getting packed into a fixed-height box.
    const roamRadius = (w: number) => (w >= 1024 ? 46 : 40);
    const GAP = 14;
    function roamHeight(w: number): number {
      const r = roamRadius(w);
      const cell = (2 * r + GAP) * (2 * r + 34);
      const usableW = Math.max(200, w - 2 * (r + 18));
      const area = (skills.length * cell * 1.45) / usableW;
      return Math.ceil(200 + area + EDGE_FADE + 40);
    }

    function layout(w: number, h: number) {
      if (!skills.length) return;
      const r = roamRadius(w);

      // Keep the golden-angle spiral clear of the title block (mirrors the
      // headline sizing in draw()) so the default/rest layout never sits
      // under "What I Work With" / the drag hint on load. yTop bounds the
      // node CENTER, so it must add back the orb's own radius (plus some
      // buffer for the soft atmosphere-halo bleed) — otherwise a node's
      // visible top edge (y - r) still reaches above the text.
      const headlineSize = w < 480 ? 24 : w < 768 ? 30 : 40;
      const titleBottom = 116 + headlineSize + 10 + (w < 640 ? 12 : 13) + 24;
      const yTop = Math.min(titleBottom + r, h * 0.55);
      const yBottom = h - r - 40;

      // Physics boundary bounce (below) reads these so drifting nodes can
      // never travel back up under the title.
      s.topBound = yTop;
      s.bottomBound = yBottom;

      // Scatter bubbles across the whole field (no central gathering), then
      // push overlaps apart. Each starts with a random drift direction.
      const loX = r + 18, hiX = w - r - 18;
      const loY = yTop, hiY = h - r - 30;
      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
      s.nodes = skills.map((sk, i) => {
        const x = loX + Math.random() * Math.max(1, hiX - loX);
        const y = loY + Math.random() * Math.max(1, hiY - loY);
        const ang = Math.random() * Math.PI * 2;
        const sp = SPEED * (0.7 + Math.random() * 0.6);
        return { id: sk.id, label: sk.title, tint: PAL[i % PAL.length],
                 icon: sk.glyph ? new Path2D(sk.glyph.path) : null,
                 stroked: !!sk.glyph?.stroke,
                 x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r,
                 hx: x, hy: y, phase: i * 1.7 };
      });
      for (let pass = 0; pass < 60; pass++) {
        for (let i = 0; i < s.nodes.length; i++) {
          for (let j = i + 1; j < s.nodes.length; j++) {
            const a = s.nodes[i], b = s.nodes[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const min = a.r + b.r + GAP;
            if (d < min) {
              const p = (min - d) * 0.5 / d;
              a.x -= dx * p; a.y -= dy * p;
              b.x += dx * p; b.y += dy * p;
              a.x = clamp(a.x, loX, hiX); a.y = clamp(a.y, loY, hiY);
              b.x = clamp(b.x, loX, hiX); b.y = clamp(b.y, loY, hiY);
            }
          }
        }
      }
    }

    // Narrow screens: a tidy 3-column grid (staggered like a honeycomb) under
    // the title. Orbs keep the same glass look and bob gently in place. The
    // canvas grows to fit however many skills there are, so nothing is packed.
    const COMPACT_MAX = 768;
    const EDGE_FADE = 130;
    function compactLayout(w: number): number {
      const n = skills.length;
      const cols = w < 340 ? 2 : 3;
      const headlineSize = w < 480 ? 24 : 30;
      const titleBottom = 116 + headlineSize + 10 + 12 + 24;
      const colW = (w - 32) / cols;
      const r = Math.max(26, Math.min(36, Math.floor(colW * 0.3)));
      const rowH = r * 2 + 44;
      const rows = Math.ceil(n / cols);
      const y0 = titleBottom + 14 + r;
      s.nodes = skills.map((sk, i) => {
        const row = Math.floor(i / cols), col = i % cols;
        const hx = 16 + colW * (col + 0.5);
        const hy = y0 + row * rowH + (col % 2 ? rowH * 0.22 : 0);
        return { id: sk.id, label: sk.title, tint: PAL[i % PAL.length],
                 icon: sk.glyph ? new Path2D(sk.glyph.path) : null,
                 stroked: !!sk.glyph?.stroke,
                 x: hx, y: hy, vx: 0, vy: 0, r, hx, hy, phase: i * 1.7 };
      });
      s.topBound = 0; s.bottomBound = 0;
      return Math.ceil(y0 + (rows - 1) * rowH + rowH * 0.22 + r + 40 + EDGE_FADE);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      s.compact = w < COMPACT_MAX && skills.length > 0;
      if (s.compact) {
        const needed = compactLayout(w);
        canvas.style.height = `${needed}px`;
        s.w = w; s.h = needed;
      } else {
        const base = w < 640 ? 460 : w < 768 ? 520 : 600;
        const needed = Math.max(base, roamHeight(w));
        canvas.style.height = needed > base ? `${needed}px` : "";
        s.w = w; s.h = needed;
      }
      canvas.width  = s.w * s.dpr;
      canvas.height = s.h * s.dpr;
      if (!s.compact) layout(s.w, s.h);
    }

    // --- Grid displacement: radial warp around nodes --------------------
    function gridDisplace(px: number, py: number, t: number): [number, number] {
      let ddx = 0, ddy = 0;
      for (const n of s.nodes) {
        const rx = px - n.x, ry = py - n.y;
        const dist2 = rx*rx + ry*ry;
        const wt = Math.exp(-dist2 / (2 * SIGMA * SIGMA));
        // Gradient of Gaussian: pulls radially inward, zero at centre, peaks at r=SIGMA
        ddx -= 34 * rx / SIGMA * wt;
        ddy -= 34 * ry / SIGMA * wt;
      }
      // Gentle vertical undulation
      ddy += 4 * Math.sin(px / 165 + t * 0.00027) * Math.cos(py / 210 + t * 0.00022);
      return [ddx, ddy];
    }

    // --- Physics tick ---------------------------------------------------
    // Bubbles drift at constant speed, bounce off the walls and off each other
    // (equal-mass elastic collisions).
    function physics(t: number) {
      const { nodes } = s;
      const dt = s.last ? Math.min(2.5, (t - s.last) / 16.67) : 1;
      s.last = t;

      if (s.compact) {
        for (const n of nodes) {
          n.x = n.hx + 7 * Math.sin(t * 0.0008 + n.phase);
          n.y = n.hy + 7 * Math.cos(t * 0.00105 + n.phase * 0.8);
        }
        return;
      }

      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt;

        const m = n.r + 18;
        const mBottom = n.r + 30;
        const topM = Math.max(m, s.topBound);
        if (n.x < m)             { n.x = m;             n.vx =  Math.abs(n.vx); }
        if (n.x > s.w - m)       { n.x = s.w - m;       n.vx = -Math.abs(n.vx); }
        if (n.y < topM)          { n.y = topM;          n.vy =  Math.abs(n.vy); }
        if (n.y > s.h - mBottom) { n.y = s.h - mBottom; n.vy = -Math.abs(n.vy); }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d  = Math.sqrt(dx*dx + dy*dy) || 0.001;
          const min = a.r + b.r + GAP * 0.5;
          if (d < min) {
            const nx = dx / d, ny = dy / d;
            // separate
            const push = (min - d) / 2;
            a.x -= nx * push; a.y -= ny * push;
            b.x += nx * push; b.y += ny * push;
            // exchange velocity along the normal if approaching
            const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rel < 0) {
              a.vx += rel * nx; a.vy += rel * ny;
              b.vx -= rel * nx; b.vy -= rel * ny;
            }
          }
        }
      }
    }

    // --- Draw -----------------------------------------------------------
    function draw(t: number) {
      const ctx = canvas.getContext("2d")!;
      const { w, h, dpr, nodes } = s;
      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#141b1f";
      ctx.fillRect(0, 0, w, h);

      // Aurora blobs (match site palette)
      const b1 = ctx.createRadialGradient(w*0.18, h*0.28, 0, w*0.18, h*0.28, h*0.6);
      b1.addColorStop(0, "rgba(143,224,220,0.055)"); b1.addColorStop(1, "transparent");
      ctx.fillStyle = b1; ctx.fillRect(0, 0, w, h);
      const b2 = ctx.createRadialGradient(w*0.82, h*0.72, 0, w*0.82, h*0.72, h*0.52);
      b2.addColorStop(0, "rgba(255,239,192,0.038)"); b2.addColorStop(1, "transparent");
      ctx.fillStyle = b2; ctx.fillRect(0, 0, w, h);

      // Vignette
      const vg = ctx.createRadialGradient(w/2, h/2, h*0.18, w/2, h/2, h*0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(4,9,12,0.68)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);

      // --- Deformable line grid (convex spacetime curvature) ---
      const GX = 36, GY = 22;
      const cw = w / GX, ch = h / GY;
      const STEPS_H = s.compact ? 36 : 72;
      const STEPS_V = s.compact ? 24 : 46;

      ctx.lineWidth = 0.65;

      // Horizontal lines
      for (let iy = 0; iy <= GY; iy++) {
        const byBase = iy * ch;
        let prox = 0;
        for (const n of nodes) { const dy = byBase - n.y; prox += 0.88 * Math.exp(-dy*dy / (2*SIGMA*SIGMA)); }
        ctx.strokeStyle = `rgba(155,210,222,${Math.min(0.10, 0.055 + prox * 0.028).toFixed(3)})`;
        ctx.beginPath();
        for (let si = 0; si <= STEPS_H; si++) {
          const bx = (si / STEPS_H) * w;
          const [dx, dy] = gridDisplace(bx, byBase, t);
          si === 0 ? ctx.moveTo(bx + dx, byBase + dy) : ctx.lineTo(bx + dx, byBase + dy);
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let ix = 0; ix <= GX; ix++) {
        const bxBase = ix * cw;
        let prox = 0;
        for (const n of nodes) { const dx = bxBase - n.x; prox += 0.88 * Math.exp(-dx*dx / (2*SIGMA*SIGMA)); }
        ctx.strokeStyle = `rgba(155,210,222,${Math.min(0.10, 0.055 + prox * 0.028).toFixed(3)})`;
        ctx.beginPath();
        for (let si = 0; si <= STEPS_V; si++) {
          const by = (si / STEPS_V) * h;
          const [dx, dy] = gridDisplace(bxBase, by, t);
          si === 0 ? ctx.moveTo(bxBase + dx, by + dy) : ctx.lineTo(bxBase + dx, by + dy);
        }
        ctx.stroke();
      }

      // --- Section title ---
      // Mirror the max-w-7xl mx-auto px-margin utility used by all other sections
      // (16px on mobile, 64px from md up), scaling font sizes down on narrow canvases.
      const isMobile = w < 640;
      const margin = w < 768 ? 16 : Math.max(64, (w - 1280) / 2 + 64);
      const titleX = margin;
      const headlineSize = w < 480 ? 24 : w < 768 ? 30 : 40;
      const bodySize = isMobile ? 12 : 13;
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = `500 11px -apple-system,"SF Pro Text",sans-serif`;
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.28em";
      ctx.fillStyle = "rgba(143,224,220,0.65)";
      ctx.fillText("ARSENAL", titleX, 96);
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0";
      ctx.font = `700 ${headlineSize}px -apple-system,"SF Pro Display",sans-serif`;
      ctx.fillStyle = "rgba(255,239,192,0.92)";
      ctx.fillText("What I Work With", titleX, 116);
      ctx.font = `400 ${bodySize}px -apple-system,"SF Pro Text",sans-serif`;
      ctx.fillStyle = "rgba(203,212,218,0.45)";
      ctx.fillText("The tools and technologies I build with.", titleX, 116 + headlineSize + 10);
      ctx.restore();

      // --- Skill orbs ---
      // Entrance: orbs fade/scale in one after another the first time the
      // section is scrolled into view, then stay (no replay on scroll back).
      const T = s.revealT0 < 0 ? -1 : t - s.revealT0;
      const STAG = Math.min(200, 2400 / Math.max(1, nodes.length));
      for (let ni = 0; ni < nodes.length; ni++) {
        const node = nodes[ni];
        const rv0 = Math.max(0, Math.min(1, (T - ni * STAG) / 900));
        if (rv0 <= 0) continue;
        const rv = rv0 * rv0 * (3 - 2 * rv0);
        ctx.save();
        ctx.globalAlpha = rv;
        const c = node.tint;
        const { x, y } = node;
        const r  = node.r * (0.78 + 0.22 * rv);

        // Outer atmosphere halo
        const atm = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.9);
        atm.addColorStop(0, `${c.a}${(0.14).toFixed(3)})`);
        atm.addColorStop(0.45, `${c.a}0.04)`);
        atm.addColorStop(1, "transparent");
        ctx.fillStyle = atm;
        ctx.beginPath(); ctx.arc(x, y, r * 2.9, 0, Math.PI * 2); ctx.fill();

        // Frosted glass base
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(9,16,20,0.78)"; ctx.fill();

        // Energy colour wash
        const energy = ctx.createRadialGradient(x - r*0.22, y - r*0.28, 0, x, y, r);
        energy.addColorStop(0, `${c.a}${(0.30).toFixed(3)})`);
        energy.addColorStop(0.5, `${c.a}0.13)`);
        energy.addColorStop(1, `${c.a}0.04)`);
        ctx.fillStyle = energy;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

        // Top-left specular highlight — the "glass" feel
        const spec = ctx.createRadialGradient(x - r*0.3, y - r*0.35, 0, x - r*0.22, y - r*0.26, r * 0.58);
        spec.addColorStop(0, "rgba(255,255,255,0.26)");
        spec.addColorStop(0.55, "rgba(255,255,255,0.06)");
        spec.addColorStop(1, "transparent");
        ctx.fillStyle = spec;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

        // Bottom-right soft inner shadow
        const shadow = ctx.createRadialGradient(x + r*0.25, y + r*0.3, 0, x + r*0.18, y + r*0.22, r * 0.7);
        shadow.addColorStop(0, "rgba(0,0,0,0.22)");
        shadow.addColorStop(1, "transparent");
        ctx.fillStyle = shadow;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

        // Ring
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `${c.a}${(0.38).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Thin inner rim (depth)
        ctx.beginPath(); ctx.arc(x, y, r - 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon (or monogram fallback) — initials generated from the skill name, plus a small
        // arc whose position/length is derived from the id so every orb is
        // visually distinct without needing an uploaded icon.
        const seed = hash(node.id);
        const a0 = (seed % 360) * Math.PI / 180 + t * 0.0003 * (seed % 2 ? 1 : -1);
        const sweep = 0.6 + ((seed >> 8) % 100) / 100 * 1.4;
        ctx.beginPath(); ctx.arc(x, y, r - 5, a0, a0 + sweep);
        ctx.strokeStyle = `${c.a}0.55)`;
        ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt";

        if (node.icon) {
          // 24x24 viewBox path (brand logo filled, generic icon stroked), tinted to the orb colour.
          const size = r * 1.05;
          ctx.save();
          ctx.translate(x - size / 2, y - size / 2);
          ctx.scale(size / 24, size / 24);
          if (node.stroked) {
            ctx.strokeStyle = c.hex; ctx.lineWidth = 1.6;
            ctx.lineCap = "round"; ctx.lineJoin = "round";
            ctx.stroke(node.icon);
          } else {
            ctx.fillStyle = c.hex;
            ctx.fill(node.icon);
          }
          ctx.restore();
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `600 ${Math.floor(r * 0.62)}px -apple-system,"SF Pro Display",sans-serif`;
          ctx.fillStyle = c.hex;
          ctx.fillText(monogram(node.label), x, y + 1);
        }

        // Skill name — always shown below the orb (title field from the admin panel).
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        let labelFz = 11;
        ctx.font = `500 ${labelFz}px -apple-system,"SF Pro Text",sans-serif`;
        const maxLabelW = r * 2.6;
        while (ctx.measureText(node.label).width > maxLabelW && labelFz > 8) {
          labelFz -= 1;
          ctx.font = `500 ${labelFz}px -apple-system,"SF Pro Text",sans-serif`;
        }
        ctx.fillStyle = "rgba(219,228,232,0.85)";
        ctx.fillText(node.label, x, y + r + 10);
        ctx.restore();
      }

      // --- Edge fades: blend canvas into neighbouring sections ---
      const topFade = ctx.createLinearGradient(0, 0, 0, 96);
      topFade.addColorStop(0, "#141b1f");
      topFade.addColorStop(1, "rgba(20,27,31,0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, w, 96);

      const botFade = ctx.createLinearGradient(0, h - 96, 0, h);
      botFade.addColorStop(0, "rgba(20,27,31,0)");
      botFade.addColorStop(1, "#141b1f");
      ctx.fillStyle = botFade;
      ctx.fillRect(0, h - 96, w, 96);

      ctx.restore();
    }

    // --- Loop -----------------------------------------------------------
    // Skip the (fairly expensive — grid-warp + physics over every node)
    // work while the canvas is scrolled off-screen, so it doesn't compete
    // with scroll compositing elsewhere on the page.
    let visible = false;
    function loop(t: number) {
      if (visible) {
        if (s.revealReq && s.revealT0 < 0) s.revealT0 = t;
        physics(t);
        draw(t);
      }
      s.raf = requestAnimationFrame(loop);
    }

    // Init
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (entry.intersectionRatio >= 0.15) s.revealReq = true;
    }, { threshold: [0, 0.15] });
    io.observe(canvas);
    s.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [skills]);

  return (
    <canvas
      ref={cvs}
      className="w-full block h-[460px] sm:h-[520px] md:h-[600px]"
    />
  );
}
