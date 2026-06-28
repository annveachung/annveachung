import type { SiteData } from "@/lib/data";
import { SkillsField } from "@/components/sections/SkillsField";

type Node = SiteData["treeNodes"][number];

export function Skills({ nodes }: { nodes: Node[] }) {
  const skills = nodes
    .filter((n) => n.category === "skill")
    .sort((a, b) => a.order - b.order);

  if (skills.length === 0) return null;

  return (
    <section
      id="toolkit"
      className="skills-section relative w-full overflow-hidden scroll-mt-20"
    >
      <div className="skills-section-aurora pointer-events-none absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-margin-desktop pt-16 pb-2">
        <span className="font-label text-[11px] tracking-[0.3em] uppercase text-secondary">
          Toolkit
        </span>
        <h2 className="font-headline font-bold text-[40px] leading-tight text-primary mt-2">
          Skill Field
        </h2>
        <p className="text-on-surface-variant max-w-[36rem] mt-2 text-sm">
          Drag any node to rearrange — the field responds.
        </p>
      </div>

      <div className="relative z-10 w-full">
        <SkillsField skills={skills} />
      </div>
    </section>
  );
}
