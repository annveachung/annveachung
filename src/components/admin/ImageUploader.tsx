"use client";

import { useState } from "react";

export function ImageUploader({
  name = "url",
  defaultValue = "",
  label = "Image",
  required = true,
}: {
  name?: string;
  defaultValue?: string;
  label?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        {label}
      </span>
      <div className="flex items-center gap-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="preview"
            className="w-28 h-16 object-cover rounded-lg border border-outline-variant/40"
          />
        ) : (
          <div className="w-28 h-16 rounded-lg border border-dashed border-outline-variant/40 flex items-center justify-center text-on-surface-variant/50">
            <span className="material-symbols-outlined">image</span>
          </div>
        )}
        <label className="cursor-pointer text-sm text-secondary border border-accent-turquoise/40 px-4 py-2 rounded-full hover:bg-accent-turquoise/10 transition-all">
          {uploading ? "Uploading…" : "Upload / replace"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {/* Submitted with the form; can also be pasted manually. */}
      <input
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="/uploads/… or https://…"
        required={required}
        className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors"
      />
    </div>
  );
}
