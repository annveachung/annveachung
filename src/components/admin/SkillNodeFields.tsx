"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";

const CATEGORIES = ["education", "experience", "skill"];
const STATUSES = ["completed", "learning", "planned"];

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

// Category + Status selects, plus an icon uploader that only appears when the
// category is "skill". The icon fills the skill orb on the public site.
export function SkillNodeFields({
  category = "education",
  status = "completed",
  icon = "",
}: {
  category?: string;
  status?: string;
  icon?: string;
}) {
  const [cat, setCat] = useState(category);
  const [stat, setStat] = useState(status);

  return (
    <>
      <SelectField label="Category" name="category" value={cat} onChange={setCat} options={CATEGORIES} />
      <SelectField label="Status" name="status" value={stat} onChange={setStat} options={STATUSES} />
      {cat === "skill" && (
        <div className="md:col-span-2">
          <ImageUploader name="icon" label="Skill icon" defaultValue={icon} required={false} />
        </div>
      )}
    </>
  );
}
