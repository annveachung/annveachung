import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { SidebarLink } from "@/components/admin/SidebarLink";

const NAV = [
  { href: "/admin/welcome", icon: "home", label: "Welcome & Hero" },
  { href: "/admin/skills", icon: "account_tree", label: "Skill Tree" },
  { href: "/admin/map", icon: "public", label: "Global Map" },
  { href: "/admin/gallery", icon: "photo_library", label: "Visual Logs" },
  { href: "/admin/account", icon: "lock", label: "Account" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="nocturnal-gradient min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-outline-variant/30 bg-charcoal/40 backdrop-blur-xl flex flex-col p-5 sticky top-0 h-screen">
        <div className="mb-8">
          <span className="font-headline font-bold text-xl text-primary">
            Coastal Admin
          </span>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Signed in as {session.user.name}
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="border-t border-outline-variant/30 pt-3 mt-3 flex flex-col gap-1">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            View site
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 max-w-5xl">{children}</main>
    </div>
  );
}
