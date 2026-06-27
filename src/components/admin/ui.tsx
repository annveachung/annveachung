"use client";

import { useFormStatus } from "react-dom";

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors resize-y"
      />
    </label>
  );
}

export function SubmitButton({
  children = "Save",
  variant = "primary",
}: {
  children?: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();
  const base =
    "px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-accent-turquoise text-on-secondary hover:shadow-lg hover:shadow-accent-turquoise/30"
      : "border border-accent-turquoise/40 text-secondary hover:bg-accent-turquoise/10";
  return (
    <button type="submit" disabled={pending} className={`${base} ${styles}`}>
      {pending ? "Saving…" : children}
    </button>
  );
}

export function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-2 rounded-full text-sm font-medium text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-60"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 border border-outline-variant/30">
      {children}
    </div>
  );
}
