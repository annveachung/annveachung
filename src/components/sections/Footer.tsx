import type { SiteData } from "@/lib/data";

export function Footer({
  settings,
  socialLinks,
}: {
  settings: SiteData["settings"];
  socialLinks: SiteData["socialLinks"];
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-charcoal border-t border-outline-variant/30 py-xl mt-xl">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="font-headline text-primary text-2xl font-bold">
            {settings.brandName}
          </span>
          <p className="text-sm text-on-surface-variant">
            © {year} {settings.brandName} — {settings.footerTagline}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="text-on-surface-variant hover:text-accent-turquoise transition-colors font-label text-xs"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
