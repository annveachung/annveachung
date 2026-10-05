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

      {/* Heading as real HTML (same classes as every other section) laid over
          the canvas. Offsets match the space SkillsField leaves at the top:
          24px on phones (compact layout), 96px from md up. */}
      <div className="pointer-events-none absolute inset-x-0 top-6 md:top-24 z-20">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="section-label">Arsenal</span>
          <h2 className="section-title">What I Work With</h2>
          <p className="section-sub">The tools and technologies I build with.</p>
        </div>
      </div>
    </section>
  );
}
