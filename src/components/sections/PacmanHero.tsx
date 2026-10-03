"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { makePacmanPath } from "@/lib/pacman";

// ─── constants ────────────────────────────────────────────────────────────────
const YELLOW = "#fff4c4";
const PARTICLE_COLORS = ["#fff4c4", "#ffefc0", "#ffe680", "#8fe0dc", "#c4f0ee", "#ffffff"];
const MAX_SCALE   = 4.6;
const GROW_RATE   = 1.3;   // scale units / sec while hovering
const SHRINK_RATE = 0.5;   // scale units / sec while not hovering
const SHAKE_START = 3.2;   // start jittering above this scale
const PARTICLE_N  = 14;
const SPAWN_MS    = 420;   // duration of spawn-in animation

// ─── types ────────────────────────────────────────────────────────────────────
interface Particle { id: number; tx: number; ty: number; color: string; size: number; }
type Phase = "normal" | "exploding" | "spawning";

// ─── component ────────────────────────────────────────────────────────────────
export function PacmanHero() {
  const [scale,     setScale    ] = useState(1);
  const [mouth,     setMouth    ] = useState(28);
  const [shakeX,    setShakeX   ] = useState(0);
  const [shakeY,    setShakeY   ] = useState(0);
  const [phase,     setPhase    ] = useState<Phase>("normal");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pReady,    setPReady   ] = useState(false);
  const [gen,       setGen      ] = useState(0);

  const hoveringRef = useRef(false);
  const scaleRef    = useRef(1);
  const phaseRef    = useRef<Phase>("normal");
  const rafRef      = useRef(0);

  // ── particle spawn effect: animate out one frame after mount ──────────────
  useEffect(() => {
    if (particles.length === 0) return;
    const id = requestAnimationFrame(() => setPReady(true));
    return () => cancelAnimationFrame(id);
  }, [particles]);

  // ── explosion ─────────────────────────────────────────────────────────────
  const doExplode = useCallback(() => {
    phaseRef.current = "exploding";
    setPhase("exploding");

    const ps: Particle[] = Array.from({ length: PARTICLE_N }, (_, i) => {
      const angle = (i / PARTICLE_N) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist  = 65 + Math.random() * 55;
      return {
        id:    i,
        tx:    Math.cos(angle) * dist,
        ty:    Math.sin(angle) * dist,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size:  5 + Math.random() * 8,
      };
    });
    setParticles(ps);
    setPReady(false);

    // After explosion, respawn
    setTimeout(() => {
      scaleRef.current = 1;
      setScale(1);
      setShakeX(0);
      setShakeY(0);
      setMouth(28);
      setParticles([]);
      setPReady(false);
      phaseRef.current = "spawning";
      setPhase("spawning");
      setGen(g => g + 1);

      setTimeout(() => {
        phaseRef.current = "normal";
        setPhase("normal");
      }, SPAWN_MS);
    }, 700);
  }, []);

  // ── RAF animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    let last = 0;

    function tick(now: number) {
      const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;

      if (phaseRef.current === "normal") {
        let s = scaleRef.current;
        s = hoveringRef.current
          ? Math.min(MAX_SCALE, s + GROW_RATE * dt)
          : Math.max(1,         s - SHRINK_RATE * dt);
        scaleRef.current = s;
        setScale(s);

        // Chomp — frequency & amplitude ramp up with scale
        const freq = 1.5 + s * 1.1;
        const open = Math.max(0, Math.sin(now * 0.001 * freq * Math.PI));
        setMouth(open * 36);

        // Jitter above shake threshold
        if (s > SHAKE_START) {
          const intensity = ((s - SHAKE_START) / (MAX_SCALE - SHAKE_START)) * 7;
          setShakeX((Math.random() * 2 - 1) * intensity);
          setShakeY((Math.random() * 2 - 1) * intensity);
        } else {
          setShakeX(0);
          setShakeY(0);
        }

        if (s >= MAX_SCALE) {
          doExplode();
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [doExplode]);

  // ── derived values ────────────────────────────────────────────────────────
  const glowPx  = Math.max(0, (scale - 1) * 7);
  const isNorm  = phase === "normal";
  const isSpawn = phase === "spawning";

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Pacman container — stays 64×64 in layout; SVG overflows visually */}
      <div
        className="relative"
        style={{ width: 64, height: 64 }}
        onMouseEnter={() => { hoveringRef.current = true; }}
        onMouseLeave={() => { hoveringRef.current = false; }}
      >
        {/* Explosion particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width:  p.size,
              height: p.size,
              background: p.color,
              top:  "50%",
              left: "50%",
              transform: pReady
                ? `translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty}px)) scale(0)`
                : "translate(-50%, -50%) scale(1)",
              opacity:    pReady ? 0 : 1,
              transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease-out 0.08s",
              boxShadow:  `0 0 6px ${p.color}`,
            }}
          />
        ))}

        {/* Flash on explosion */}
        {phase === "exploding" && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: YELLOW,
              boxShadow:  `0 0 30px 10px ${YELLOW}`,
              animation:  "pacman-flash 0.55s ease-out forwards",
            }}
          />
        )}

        {/* Pacman SVG */}
        {phase !== "exploding" && (
          <svg
            key={gen}
            viewBox="0 0 100 100"
            width={64}
            height={64}
            className="overflow-visible"
            style={{
              transform: isNorm
                ? `scale(${scale.toFixed(3)}) translate(${shakeX.toFixed(1)}px, ${shakeY.toFixed(1)}px)`
                : "scale(1)",
              transformOrigin: "center center",
              filter: glowPx > 0
                ? `drop-shadow(0 0 ${glowPx}px ${YELLOW}) drop-shadow(0 0 ${glowPx * 2}px rgba(255,244,196,0.4))`
                : "none",
              animation: isSpawn
                ? `pacman-spawn ${SPAWN_MS}ms cubic-bezier(0.34,1.56,0.64,1) forwards`
                : "none",
              cursor: "default",
            }}
          >
            <path
              d={makePacmanPath(isNorm ? mouth : 28)}
              fill={YELLOW}
            />
          </svg>
        )}
      </div>

      <span
        className="font-label text-[11px] tracking-[0.28em] uppercase"
        style={{ color: "rgba(203,212,218,0.55)" }}
      >
        Based in Toronto
      </span>
    </div>
  );
}
