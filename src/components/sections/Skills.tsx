"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteData } from "@/lib/data";

type Node = SiteData["treeNodes"][number];

const STATUS_STYLES: Record<string, string> = {
  completed:
    "border-secondary/45 text-secondary/90 bg-secondary/8 hover:border-secondary/80 hover:bg-secondary/15 hover:text-secondary",
  learning:
    "border-primary/45 text-primary/90 bg-primary/8 hover:border-primary/80 hover:bg-primary/15 hover:text-primary",
  planned:
    "border-outline/35 text-on-surface-variant/70 bg-transparent hover:border-outline/60 hover:text-on-surface-variant",
};

export function Skills({ nodes }: { nodes: Node[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const skills = nodes
    .filter((n) => n.category === "skill")
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

  if (skills.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="nodes"
      className={`skills-section relative w-full overflow-hidden scroll-mt-20 ${inView ? "in-view" : ""}`}
    >
      <div className="skills-section-aurora pointer-events-none absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-margin-desktop pt-16 pb-10">
        <span className="font-label text-[11px] tracking-[0.3em] uppercase text-secondary">
          Toolkit
        </span>
        <h2 className="font-headline font-bold text-[40px] leading-tight text-primary mt-2">
          Skills
        </h2>
        <p className="text-on-surface-variant max-w-[36rem] mt-2">
          Technologies, tools, and disciplines — from mastered to in-progress.
        </p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-margin-desktop pb-20">
        <div className="flex flex-wrap gap-3">
          {skills.map((n, i) => (
            <div
              key={n.id}
              className={`skill-chip skill-chip--${n.status} group relative font-label text-[11px] tracking-[0.15em] uppercase px-4 py-2 rounded border transition-all duration-300 cursor-default ${STATUS_STYLES[n.status] ?? STATUS_STYLES.completed}`}
              style={{ transitionDelay: `${i * 0.04}s` }}
              title={n.description ?? undefined}
            >
              {n.title}
              {n.period && (
                <span className="ml-2 opacity-50 normal-case tracking-normal font-body text-[9px]">
                  {n.period}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
