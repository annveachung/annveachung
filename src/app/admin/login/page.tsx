"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/lib/actions/auth-actions";

function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent-turquoise text-on-secondary font-bold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-accent-turquoise/30 active:scale-95 transition-all disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Enter the Shoreline"}
    </button>
  );
}

export default function LoginPage() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);

  return (
    <div className="nocturnal-gradient min-h-screen flex items-center justify-center px-margin-mobile">
      <div className="glass glow-turquoise w-full max-w-[28rem] p-10 rounded-[32px]">
        <div className="mb-8 text-center">
          <span className="material-symbols-outlined text-accent-turquoise text-5xl">
            token
          </span>
          <h1 className="font-headline font-bold text-3xl text-primary mt-3">
            Admin Access
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Sign in to manage Annvea&apos;s Coastal Space.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-label text-[11px] tracking-[0.1em] uppercase text-on-surface-variant">
              Username
            </span>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label text-[11px] tracking-[0.1em] uppercase text-on-surface-variant">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors"
            />
          </label>

          {errorMessage && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {errorMessage}
            </p>
          )}

          <div className="mt-2">
            <SignInButton />
          </div>
        </form>
      </div>
    </div>
  );
}
