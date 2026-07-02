"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteData } from "@/lib/data";

type Node = SiteData["treeNodes"][number];

// --- Sine wave path generation ----------------------------------------
const CX = 40;       // horizontal centre of the 80-px spine column
const SINE_A = 10;   // amplitude in px
const SINE_WL = 88;  // wavelength in px

function sinePath(totalH: number) {
  const step = 2;
  const pts: string[] = [`${CX},0`];
  for (let y = step; y <= totalH; y += step) {
    const x = CX + SINE_A * Math.sin((2 * Math.PI * y) / SINE_WL);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")}`;
}

// --- Sub-components --------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const base = "inline-block font-label text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 rounded border";
  const styles: Record<string, string> = {
    completed: "bg-primary/15 text-primary border-primary/40",
    learning: "bg-secondary/15 text-secondary border-secondary/40",
    planned: "text-on-surface-variant border-outline/30 border-dashed",
  };
  return (
    <span className={`${base} ${styles[status] ?? styles.completed}`}>
      {status}
    </span>
  );
}

function TimelineCard({
  node,
  side,
  delay,
}: {
  node: Node;
  side: "left" | "right";
  delay: number;
}) {
  const isLeft = side === "left";
  const borderColor = isLeft
    ? "border-primary/35 hover:border-primary/65"
    : "border-secondary/35 hover:border-secondary/65";
  const topAccent = isLeft ? "bg-primary" : "bg-secondary";
  const connectorBg = isLeft ? "bg-primary/25" : "bg-secondary/25";
  const hoverGlow = isLeft
    ? "hover:shadow-[0_0_20px_rgba(255,239,192,0.15)]"
    : "hover:shadow-[0_0_20px_rgba(143,224,220,0.15)]";

  const card = (
    <div
      className={`timeline-card timeline-card--${side} relative flex-1 bg-charcoal/70 backdrop-blur-md border ${borderColor} ${hoverGlow} rounded-md cursor-pointer transition-all duration-300`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className={`timeline-accent ${topAccent} h-[3px] rounded-t-md opacity-60`} />
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          {/* Row 1 — role / degree */}
          <p className="font-headline font-bold text-sm text-primary leading-snug flex-1">
            {node.title}
          </p>
          <StatusBadge status={node.status} />
        </div>
        {/* Row 2 — city */}
        {node.city && (
          <p className="font-label text-[10px] tracking-[0.15em] text-secondary mb-1">
            {node.city}
          </p>
        )}
        {/* Row 3 — institution / company */}
        {node.organization && (
          <p className="text-on-surface-variant text-xs leading-relaxed">
            {node.organization}
          </p>
        )}
      </div>
    </div>
  );

  const connector = (
    <div className={`${connectorBg} h-px w-5 flex-shrink-0 self-center`} />
  );

  return (
    <div className="flex items-stretch">
      {isLeft ? (
        <>
          {card}
          {connector}
        </>
      ) : (
        <>
          {connector}
          {card}
        </>
      )}
    </div>
  );
}

// --- Main component --------------------------------------------------

export function SkillTree({ nodes }: { nodes: Node[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [springH, setSpringH] = useState(0);

  const eduNodes = nodes
    .filter((n) => n.category === "education")
    .sort((a, b) => a.order - b.order);
  const expNodes = nodes
    .filter((n) => n.category === "experience")
    .sort((a, b) => a.order - b.order);


  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSpringH(el.getBoundingClientRect().height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const STAGGER = 0.12;

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={`skilltree relative w-full overflow-hidden scroll-mt-20 ${inView ? "in-view" : ""}`}
    >
      <div className="skilltree-aurora pointer-events-none absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-margin-desktop pt-16 pb-10">
        <span className="font-label text-[11px] tracking-[0.3em] uppercase text-secondary">
          Progression
        </span>
        <h2 className="font-headline font-bold text-[40px] leading-tight text-primary mt-2">
          Where I've Been, What I've Done
        </h2>
        <p className="text-on-surface-variant max-w-[36rem] mt-2">
          An evolving path of education, experience, and everything in between.
        </p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-margin-desktop pb-20">
        {/* Column labels */}
        <div className="grid grid-cols-[1fr_80px_1fr] mb-5">
          <div className="text-right pr-5">
            <span className="font-label text-[10px] tracking-[0.25em] uppercase text-primary/50">
              Education
            </span>
          </div>
          <div />
          <div className="pl-5">
            <span className="font-label text-[10px] tracking-[0.25em] uppercase text-secondary/50">
              Experience
            </span>
          </div>
        </div>

        {/* Three-column layout */}
        <div
          ref={containerRef}
          className="grid grid-cols-[1fr_80px_1fr] gap-y-4"
        >
          {/* Education column */}
          <div className="flex flex-col gap-4">
            {eduNodes.map((n, i) => (
              <TimelineCard
                key={n.id}
                node={n}
                side="left"
                delay={i * STAGGER}
              />
            ))}
          </div>

          {/* Spring spine */}
          <div className="relative flex justify-center">
            {springH > 0 && (
              <svg
                width={80}
                height={springH}
                viewBox={`0 0 80 ${springH}`}
                className="overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="springGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffefc0" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#8fe0dc" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ffefc0" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <g className="spring-group">
                  <path
                    className="spring-path"
                    d={sinePath(springH)}
                    pathLength={1}
                  />
                </g>
              </svg>
            )}
          </div>

          {/* Experience column */}
          <div className="flex flex-col gap-4">
            {expNodes.map((n, i) => (
              <TimelineCard
                key={n.id}
                node={n}
                side="right"
                delay={i * STAGGER + 0.06}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
