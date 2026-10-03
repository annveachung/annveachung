import type { SiteData } from "@/lib/data";
import { skillIcons } from "@/lib/skillIcons";
import { SkillsField } from "@/components/sections/SkillsField";

type Node = SiteData["treeNodes"][number];

export function Skills({ nodes }: { nodes: Node[] }) {
  const sorted = nodes
    .filter((n) => n.category === "skill")
    .sort((a, b) => a.order - b.order);
  const glyphs = skillIcons(sorted.map((n) => n.title));
  const skills = sorted.map((n, i) => ({ ...n, glyph: glyphs[i] }));

  if (skills.length === 0) return null;

  return (
    <section
      id="toolkit"
      className="skills-section relative w-full overflow-hidden scroll-mt-20"
    >
      <div className="skills-section-aurora pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full">
        <SkillsField skills={skills} />
      </div>
    </section>
  );
}
