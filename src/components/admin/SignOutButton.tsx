"use client";

import { logout } from "@/lib/actions/auth-actions";

export function SignOutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
        Sign out
      </button>
    </form>
  );
}
