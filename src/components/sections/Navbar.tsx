"use client";

import { useState } from "react";
import type { SiteData } from "@/lib/data";

export function Navbar({
  settings,
  navLinks,
}: {
  settings: SiteData["settings"];
  navLinks: SiteData["navLinks"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center w-full px-margin-mobile md:px-0">
      <nav className="navbar-frosted glass-sweep mt-5 mx-auto w-full md:w-fit flex items-center justify-between md:justify-start gap-8 px-6 py-3 rounded-full">
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
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden flex flex-col items-center justify-center gap-[5px] w-6 h-6 shrink-0"
        >
          <span
            className={`block h-[1.5px] w-5 bg-primary transition-transform duration-200 ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-primary transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-primary transition-transform duration-200 ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {open && (
        <div className="navbar-frosted md:hidden mt-2 w-full flex flex-col items-stretch gap-1 px-4 py-3 rounded-2xl">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setOpen(false)}
              className="nav-link font-label text-[11px] tracking-[0.08em] uppercase text-center py-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
