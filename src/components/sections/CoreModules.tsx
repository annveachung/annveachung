import type { SiteData } from "@/lib/data";

type Module = {
  id: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  tags: string[];
};

function ModuleCard({ module }: { module: Module }) {
  return (
    <div className="glass p-12 rounded-[32px] group hover:border-accent-turquoise/50 transition-all shadow-xl">
      <div className="flex justify-between items-start mb-8">
        <span className="material-symbols-outlined text-accent-turquoise text-5xl">
          {module.icon}
        </span>
        {module.badge && (
          <span className="text-[11px] font-label text-on-surface-variant tracking-widest uppercase">
            {module.badge}
          </span>
        )}
      </div>
      <h3 className="font-headline text-[32px] leading-[40px] text-primary mb-4">
        {module.title}
      </h3>
      <p className="text-on-surface-variant mb-6 leading-relaxed">
        {module.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {module.tags.map((tag) => (
          <span
            key={tag}
            className="bg-accent-turquoise/10 text-secondary border border-accent-turquoise/20 px-3 py-1 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CoreModules({
  experiences,
  education,
}: {
  experiences: SiteData["experiences"];
  education: SiteData["education"];
}) {
  // Education renders first (left), then experience — matching the Stitch layout.
  const modules: Module[] = [...education, ...experiences];
  if (modules.length === 0) return null;

  return (
    <section id="experience" className="w-full bg-charcoal py-xl mb-xl scroll-mt-32">
      <div className="max-w-7xl mx-auto px-margin-desktop grid md:grid-cols-2 gap-6">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </section>
  );
}
