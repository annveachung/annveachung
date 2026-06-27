"use client";

import { useActionState } from "react";
import { changePassword, type AccountState } from "@/lib/actions/account";
import { PageHeader } from "@/components/admin/PageHeader";
import { SubmitButton, Card } from "@/components/admin/ui";

export default function AccountPage() {
  const [state, formAction] = useActionState<AccountState, FormData>(
    changePassword,
    null,
  );

  return (
    <div>
      <PageHeader title="Account" subtitle="Change your admin password." />
      <Card>
        <form action={formAction} className="flex flex-col gap-4 max-w-[28rem]">
          <PasswordField label="Current password" name="currentPassword" />
          <PasswordField label="New password (min 8 chars)" name="newPassword" />
          <PasswordField label="Confirm new password" name="confirmPassword" />

          {state && (
            <p
              className={`text-sm rounded-lg px-4 py-2 border ${
                state.ok
                  ? "text-secondary bg-accent-turquoise/10 border-accent-turquoise/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}
            >
              {state.message}
            </p>
          )}

          <div className="mt-1">
            <SubmitButton>Update password</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        {label}
      </span>
      <input
        name={name}
        type="password"
        required
        autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors"
      />
    </label>
  );
}
