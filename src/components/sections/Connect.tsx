import type { SiteData } from "@/lib/data";

export function Connect({
  settings,
  socialLinks,
}: {
  settings: SiteData["settings"];
  socialLinks: SiteData["socialLinks"];
}) {
  return (
    <section id="contact" className="glass-sweep bg-surface-variant w-full pt-5 pb-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-label text-[11px] tracking-[0.3em] uppercase text-secondary">
            Network
          </span>
          <h2 className="font-headline font-bold text-2xl text-primary mt-2">Ping Me</h2>
          <p className="text-on-surface-variant text-sm">Low effort. High approval rate.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-full px-6 py-2 font-label text-xs tracking-[0.12em] uppercase text-on-surface border border-outline-variant/30 hover:border-accent-turquoise/60 hover:text-secondary transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
