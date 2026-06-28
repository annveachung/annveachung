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
      <nav className="navbar-frosted glass-sweep mt-5 mx-auto w-fit flex items-center gap-8 px-6 py-3 rounded-full">
        <span className="font-headline text-[17px] font-semibold text-primary tracking-tight">
          {settings.brandName}
        </span>
        <div className="hidden md:flex gap-1 items-center">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="nav-link font-label text-[11px] tracking-[0.08em] uppercase"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
