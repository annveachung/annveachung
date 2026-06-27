"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-all ${
        active
          ? "bg-accent-turquoise/15 text-primary border border-accent-turquoise/30"
          : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 border border-transparent"
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </Link>
  );
}
