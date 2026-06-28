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
      <nav className="navbar-frosted mt-5 mx-auto w-fit flex items-center gap-8 px-6 py-3 rounded-full">
        <span className="font-headline text-[17px] font-semibold text-primary tracking-tight">
          {settings.brandName}
        </span>
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="font-label text-[11px] tracking-[0.08em] uppercase text-on-surface-variant/80 hover:text-on-surface transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
        <a
          href={settings.ctaHref}
          className="navbar-cta font-label text-[11px] tracking-[0.08em] uppercase px-5 py-1.5 rounded-full active:scale-95 transition-all duration-150"
        >
          {settings.ctaLabel}
        </a>
      </nav>
    </header>
  );
}
