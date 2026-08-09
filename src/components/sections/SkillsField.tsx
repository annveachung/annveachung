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
const K_IDLE  = 0.038;   // idle spring stiffness
const K_DRAG  = 0.30;    // drag spring stiffness
const DAMP    = 0.87;    // velocity damping per tick
const REP     = 0.13;    // node repulsion strength
const IDLE_A  = 9;       // idle float amplitude (px)
const IDLE_W  = 0.00055; // idle float frequency (rad/ms)
const SIGMA   = 120;     // Gaussian sigma for field wells

// --- Internal types -----------------------------------------------------
interface PNode {
  id: string; label: string; status: string;
  x: number;  y: number;  vx: number; vy: number;
  rx: number; ry: number; // rest/drop position
  r: number;
  phase: number;
  lift: number; // 0..1 — animated when dragged
}
interface Ripple {
  cx: number; cy: number;
  born: number; dur: number; maxR: number;
  ca: string; // colour alpha prefix
}

// --- Component ----------------------------------------------------------
export function SkillsField({ skills }: { skills: TreeNode[] }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const S   = useRef({
    nodes:   [] as PNode[],
    ripples: [] as Ripple[],
    dragIdx: -1,
    mouse:   { x: 0, y: 0 },
    raf:     0,
    w: 0, h: 0, dpr: 1,
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
      const n  = skills.length;
      if (!n) return;
      const r  = Math.max(36, Math.min(52, Math.floor(Math.min(w, h) * 0.12)));
      const spread = Math.min(w * 0.38, h * 0.38);
      const cx = w / 2, cy = h / 2;

      s.nodes = skills.map((sk, i) => {
        const θ = i * 2.39996; // golden angle
        const ρ = spread * Math.sqrt((i + 0.5) / n);
        let rx = cx + ρ * Math.cos(θ);
        let ry = cy + ρ * Math.sin(θ);
        rx = Math.max(r + 28, Math.min(w - r - 28, rx));
        ry = Math.max(r + 28, Math.min(h - r - 40, ry)); // extra bottom room for the name label
        return { id: sk.id, label: sk.title, status: sk.status,
                 x: rx, y: ry, vx: 0, vy: 0, rx, ry,
                 r, phase: (i * 1.618) % (Math.PI * 2), lift: 0 };
      });

      // Separation passes — push overlapping rest positions apart
      for (let pass = 0; pass < 90; pass++) {
        for (let i = 0; i < s.nodes.length; i++) {
          for (let j = i + 1; j < s.nodes.length; j++) {
            const a = s.nodes[i], b = s.nodes[j];
            const dx = b.rx - a.rx, dy = b.ry - a.ry;
            const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const min = (a.r + b.r) * 1.32;
            if (d < min) {
              const p = (min - d) * 0.5 / d;
              a.rx -= dx * p; a.ry -= dy * p;
              b.rx += dx * p; b.ry += dy * p;
              const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
              a.rx = clamp(a.rx, a.r+28, w-a.r-28); a.ry = clamp(a.ry, a.r+28, h-a.r-40);
              b.rx = clamp(b.rx, b.r+28, w-b.r-28); b.ry = clamp(b.ry, b.r+28, h-b.r-40);
            }
          }
        }
      }
      s.nodes.forEach(n => { n.x = n.rx; n.y = n.ry; });
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
      // Ripple: radially outward wave
      for (const rip of s.ripples) {
        const age = t - rip.born, prog = age / rip.dur;
        if (prog >= 1) continue;
        const rx = px - rip.cx, ry = py - rip.cy;
        const dist = Math.sqrt(rx*rx + ry*ry);
        if (dist < 1) continue;
        const front = prog * rip.maxR;
        const diff  = dist - front;
        if (Math.abs(diff) < 72) {
          const amp = Math.sin(diff * 0.088) * (1 - prog) * 9 * Math.exp(-dist / (rip.maxR * 0.62));
          ddx += amp * rx / dist;
          ddy += amp * ry / dist;
        }
      }
      // Gentle vertical undulation
      ddy += 4 * Math.sin(px / 165 + t * 0.00027) * Math.cos(py / 210 + t * 0.00022);
      return [ddx, ddy];
    }

    // --- Physics tick ---------------------------------------------------
    function physics(t: number) {
      const { nodes, mouse, dragIdx } = s;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dragged = i === dragIdx;

        // Lift animation
        const liftTarget = dragged ? 1 : 0;
        n.lift += (liftTarget - n.lift) * 0.09;

        const k  = dragged ? K_DRAG : K_IDLE;
        const tx = dragged ? mouse.x : n.rx + IDLE_A * Math.sin(t * IDLE_W + n.phase);
        const ty = dragged ? mouse.y : n.ry + IDLE_A * Math.cos(t * IDLE_W * 1.28 + n.phase * 0.77);

        n.vx += k * (tx - n.x);
        n.vy += k * (ty - n.y);
        n.vx *= DAMP; n.vy *= DAMP;
        n.x  += n.vx; n.y  += n.vy;

        // Boundary bounce — extra bottom clearance so the name label never bounces off-canvas
        const m = n.r + 18;
        const mBottom = n.r + 30;
        if (n.x < m)             { n.x = m;             n.vx =  Math.abs(n.vx) * 0.35; }
        if (n.x > s.w - m)       { n.x = s.w - m;       n.vx = -Math.abs(n.vx) * 0.35; }
        if (n.y < m)             { n.y = m;             n.vy =  Math.abs(n.vy) * 0.35; }
        if (n.y > s.h - mBottom) { n.y = s.h - mBottom; n.vy = -Math.abs(n.vy) * 0.35; }
      }

      // Soft repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d  = Math.sqrt(dx*dx + dy*dy) || 0.001;
          const min = (a.r + b.r) * 1.22;
          if (d < min) {
            const f = (min - d) * REP / d;
            if (s.dragIdx !== i) { a.vx -= dx*f; a.vy -= dy*f; }
            if (s.dragIdx !== j) { b.vx += dx*f; b.vy += dy*f; }
          }
        }
      }

      s.ripples = s.ripples.filter(r => t - r.born < r.dur);
    }

    // --- Draw -----------------------------------------------------------
    function draw(t: number) {
      const ctx = canvas.getContext("2d")!;
      const { w, h, dpr, nodes, ripples } = s;
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
      const hint = isMobile ? "Drag a node to rearrange." : "Drag any node to rearrange — the field responds.";
      ctx.fillText(hint, titleX, 116 + headlineSize + 10);
      ctx.restore();

      // --- Ripple rings ---
      for (const rip of ripples) {
        const prog = (t - rip.born) / rip.dur;
        if (prog >= 1) continue;
        const ease = 1 - Math.pow(1 - prog, 3);
        const r1 = ease * rip.maxR;
        ctx.beginPath();
        ctx.arc(rip.cx, rip.cy, r1, 0, Math.PI * 2);
        ctx.strokeStyle = `${rip.ca}${((1 - prog) * 0.32).toFixed(3)})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();
        if (prog > 0.14) {
          ctx.beginPath();
          ctx.arc(rip.cx, rip.cy, (ease - 0.14) * rip.maxR * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = `${rip.ca}${((1 - prog) * 0.14).toFixed(3)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // --- Skill orbs ---
      for (const node of nodes) {
        const c = col(node.status);
        const { x, y, lift } = node;
        const r  = node.r * (1 + lift * 0.14);

        // Outer atmosphere halo
        const atm = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.9);
        atm.addColorStop(0, `${c.a}${(0.14 + lift*0.06).toFixed(3)})`);
        atm.addColorStop(0.45, `${c.a}0.04)`);
        atm.addColorStop(1, "transparent");
        ctx.fillStyle = atm;
        ctx.beginPath(); ctx.arc(x, y, r * 2.9, 0, Math.PI * 2); ctx.fill();

        // Frosted glass base
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(9,16,20,0.78)"; ctx.fill();

        // Energy colour wash
        const energy = ctx.createRadialGradient(x - r*0.22, y - r*0.28, 0, x, y, r);
        energy.addColorStop(0, `${c.a}${(0.30 + lift*0.08).toFixed(3)})`);
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
        ctx.strokeStyle = `${c.a}${(0.38 + lift*0.28).toFixed(3)})`;
        ctx.lineWidth = 1 + lift * 0.6;
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
    function loop(t: number) {
      physics(t);
      draw(t);
      s.raf = requestAnimationFrame(loop);
    }

    // --- Events ---------------------------------------------------------
    function clientPos(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect();
      const src  = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    }
    function hit(x: number, y: number) {
      for (let i = s.nodes.length - 1; i >= 0; i--) {
        const n = s.nodes[i];
        const dx = x - n.x, dy = y - n.y;
        if (dx*dx + dy*dy < (n.r * 1.3) ** 2) return i;
      }
      return -1;
    }
    function onDown(e: MouseEvent | TouchEvent) {
      const p = clientPos(e);
      const i = hit(p.x, p.y);
      if (i < 0) return;
      e.preventDefault();
      s.dragIdx = i; s.mouse = p;
      canvas.style.cursor = "grabbing";
    }
    function onMove(e: MouseEvent | TouchEvent) {
      const p = clientPos(e);
      s.mouse = p;
      if (s.dragIdx < 0)
        canvas.style.cursor = hit(p.x, p.y) >= 0 ? "grab" : "default";
    }
    function onUp() {
      if (s.dragIdx < 0) return;
      const n = s.nodes[s.dragIdx];
      n.rx = n.x; n.ry = n.y;
      s.ripples.push({
        cx: n.x, cy: n.y,
        born: performance.now(),
        dur: 2000,
        maxR: Math.min(s.w, s.h) * 0.65,
        ca: col(n.status).a,
      });
      s.dragIdx = -1;
      canvas.style.cursor = "default";
    }

    // Init
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup",  onUp);
    window.addEventListener("touchend", onUp);
    s.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup",  onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [skills]);

  return (
    <canvas
      ref={cvs}
      className="w-full block h-[460px] sm:h-[520px] md:h-[600px]"
      style={{ touchAction: "none" }}
    />
  );
}
