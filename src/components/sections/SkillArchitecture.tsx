import type { SiteData } from "@/lib/data";

// Fixed positions around the central core, matching the Stitch layout
// (top-left, bottom-right, left, right). Extra skills wrap back around.
const POSITIONS = [
  "top-0 left-1/4 flex-col items-center",
  "bottom-0 right-1/4 flex-col items-center",
  "left-0 top-1/2 -translate-y-1/2 flex-row items-center",
  "right-0 top-1/2 -translate-y-1/2 flex-row items-center",
];

function SkillNode({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="glass p-6 rounded-2xl border border-accent-turquoise/30 hover:scale-110 transition-transform cursor-pointer shadow-lg">
      <span className="material-symbols-outlined text-primary block">{icon}</span>
      <p className="font-label text-[11px] tracking-[0.1em] uppercase text-primary mt-2">
        {label}
      </p>
    </div>
  );
}

export function SkillArchitecture({ skills }: { skills: SiteData["skills"] }) {
  if (skills.length === 0) return null;

  return (
    <section
      id="skills"
      className="relative max-w-7xl mx-auto px-margin-desktop mb-xl flex flex-col items-center scroll-mt-32"
    >
      <h2 className="text-center font-label text-[11px] text-on-surface-variant mb-16 tracking-[0.3em] uppercase">
        Skill Architecture
      </h2>
      <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center">
        {/* Center core */}
        <div className="z-10 w-32 h-32 glass rounded-full flex items-center justify-center border border-accent-turquoise glow-turquoise relative">
          <div className="absolute inset-0 rounded-full border-2 border-accent-turquoise/30 animate-ping" />
          <span className="material-symbols-outlined text-accent-turquoise text-5xl floating-icon">
            token
          </span>
        </div>

        {skills.slice(0, 4).map((skill, i) => {
          const pos = POSITIONS[i % POSITIONS.length];
          const isVertical = i < 2;
          const connector = isVertical ? (
            <div className="h-24 w-px bg-gradient-to-t from-accent-turquoise/40 to-transparent" />
          ) : (
            <div className="w-32 h-px bg-gradient-to-l from-accent-turquoise/40 to-transparent" />
          );
          // For bottom/right nodes the connector comes first (toward the core).
          const connectorFirst = i === 1 || i === 3;
          return (
            <div key={skill.id} className={`absolute flex gap-4 ${pos}`}>
              {connectorFirst && connector}
              <SkillNode icon={skill.icon} label={skill.label} />
              {!connectorFirst && connector}
            </div>
          );
        })}
      </div>
    </section>
  );
}
