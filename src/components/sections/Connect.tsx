import type { SiteData } from "@/lib/data";

export function Connect({
  settings,
  socialLinks,
}: {
  settings: SiteData["settings"];
  socialLinks: SiteData["socialLinks"];
}) {
  return (
    <section id="contact" className="bg-surface-deep w-full py-[120px] scroll-mt-20">
      <div className="max-w-3xl mx-auto px-margin-desktop text-center">
        <h2 className="font-headline font-bold text-[56px] leading-[64px] text-primary mb-4">
          {settings.ctaLabel}
        </h2>
        <p className="text-on-surface-variant text-lg mb-16 max-w-xl mx-auto leading-relaxed">
          Whether it&apos;s a project, a collaboration, or just a good conversation — I&apos;m always reachable.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-full px-8 py-3 font-label text-sm tracking-[0.12em] uppercase text-on-surface border border-outline-variant/30 hover:border-accent-turquoise/60 hover:text-secondary transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
