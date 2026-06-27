import type { SiteData } from "@/lib/data";

export function Navbar({
  settings,
  navLinks,
}: {
  settings: SiteData["settings"];
  navLinks: SiteData["navLinks"];
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
      <nav className="bg-charcoal/80 backdrop-blur-xl rounded-full mt-6 mx-auto w-fit px-6 py-3 border border-accent-turquoise/20 shadow-[0px_4px_30px_rgba(0,0,0,0.3)] flex items-center gap-8">
        <span className="font-headline text-2xl font-bold text-primary mr-4">
          {settings.brandName}
        </span>
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={link.href}
              className={`font-label text-[11px] tracking-[0.1em] uppercase transition-all hover:text-accent-turquoise ${
                i === 0
                  ? "text-primary font-bold border-b-2 border-accent-turquoise pb-1"
                  : "text-on-surface-variant font-medium"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a
          href={settings.ctaHref}
          className="bg-accent-turquoise text-on-secondary font-bold px-6 py-1.5 rounded-full hover:shadow-lg hover:shadow-accent-turquoise/30 active:scale-95 transition-all text-xs"
        >
          {settings.ctaLabel}
        </a>
      </nav>
    </header>
  );
}
