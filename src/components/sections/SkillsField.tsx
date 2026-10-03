"use client";

import { useEffect, useRef } from "react";
import type { SiteData } from "@/lib/data";

type TreeNode = SiteData["treeNodes"][number];

// --- Colour palette per status -----------------------------------------
const PAL = {
  completed: { a: "rgba(143,224,220,", hex: "#8fe0dc" },
  learning:  { a: "rgba(255,239,192,", hex: "#ffefc0" },
  planned:   { a: "rgba(178,200,215,", hex: "#b2c8d7" },
} as const;
type StatusKey = keyof typeof PAL;
function col(status: string) { return PAL[status as StatusKey] ?? PAL.completed; }

// --- Physics constants --------------------------------------------------
const SPEED   = 0.55;    // base drift speed (px per 60fps tick)
const SIGMA   = 120;     // Gaussian sigma for field wells

// --- Internal types -----------------------------------------------------
interface PNode {
  id: string; label: string; status: string;
  x: number;  y: number;  vx: number; vy: number;
  r: number;
}

// --- Component ----------------------------------------------------------
export function SkillsField({ skills }: { skills: TreeNode[] }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const S   = useRef({
    nodes:   [] as PNode[],
    raf:     0,
    last:    0,
    w: 0, h: 0, dpr: 1,
    topBound: 0, bottomBound: 0,
  });

  useEffect(() => {
    const canvas = cvs.current!;
    const s = S.current;
    s.dpr = window.devicePixelRatio || 1;

    // Preload skill icons — drawn inside the orbs. Every icon renders in the
    // same-size circle regardless of its source dimensions (cover-cropped).
    const iconImgs = new Map<string, HTMLImageElement>();
    for (const sk of skills) {
      if (sk.icon) {
        const im = new Image();
        im.src = sk.icon;
        iconImgs.set(sk.id, im);
      }
    }

    // --- Layout ---------------------------------------------------------
    function layout(w: number, h: number) {
      if (!skills.length) return;
      const r  = Math.max(36, Math.min(52, Math.floor(Math.min(w, h) * 0.12)));

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
        return { id: sk.id, label: sk.title, status: sk.status,
                 x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r };
      });
      for (let pass = 0; pass < 60; pass++) {
        for (let i = 0; i < s.nodes.length; i++) {
          for (let j = i + 1; j < s.nodes.length; j++) {
            const a = s.nodes[i], b = s.nodes[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const min = a.r + b.r;
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

    function resize() {
      const rect = canvas.getBoundingClientRect();
      s.w = rect.width; s.h = rect.height;
      canvas.width  = s.w * s.dpr;
      canvas.height = s.h * s.dpr;
      layout(s.w, s.h);
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
          const min = a.r + b.r;
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
      const STEPS_H = 72;
      const STEPS_V = 46;

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
      for (const node of nodes) {
        const c = col(node.status);
        const { x, y } = node;
        const r  = node.r;

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

        // Icon (if uploaded) — uniform size across all orbs, cover-cropped to
        // a circle. Uses the base radius so every icon is identical in size.
        const icon = iconImgs.get(node.id);
        if (icon && icon.complete && icon.naturalWidth > 0) {
          const size = node.r * 1.15;
          const scale = Math.max(size / icon.naturalWidth, size / icon.naturalHeight);
          const dw = icon.naturalWidth * scale, dh = icon.naturalHeight * scale;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(icon, x - dw / 2, y - dh / 2, dw, dh);
          ctx.restore();
        } else {
          // Fallback glyph (no icon uploaded) — first letter, name still labelled below.
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `600 ${Math.floor(r * 0.55)}px -apple-system,"SF Pro Display",sans-serif`;
          ctx.fillStyle = c.hex;
          ctx.fillText(node.label.charAt(0).toUpperCase(), x, y + 1);
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
    let visible = true;
    function loop(t: number) {
      if (visible) {
        physics(t);
        draw(t);
      }
      s.raf = requestAnimationFrame(loop);
    }

    // Init
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
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
