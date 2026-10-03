import * as si from "simple-icons";

// Resolve a skill's title to a Simple Icons SVG path (24x24 viewBox), or null
// when no brand icon exists (the orb then falls back to a generated monogram).
// Server-only: importing the whole icon set must not reach the client bundle.

const norm = (s: string) =>
  s.toLowerCase().replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/\./g, "dot").replace(/[^a-z0-9]/g, "");

// Titles that don't normalise to a Simple Icons name.
const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  react: "react",
  reactjs: "react",
  next: "nextdotjs",
  nextjs: "nextdotjs",
  vue: "vuedotjs",
  vuejs: "vuedotjs",
  postgres: "postgresql",
  mongo: "mongodb",
  tailwind: "tailwindcss",
  html: "html5",
  css: "css",
  css3: "css",
  golang: "go",
  cpp: "cplusplus",
  csharp: "csharp",
  k8s: "kubernetes",
  gcp: "googlecloud",
  threejs: "threedotjs",
  d3: "d3dotjs",
  express: "express",
  expressjs: "express",
  ml: "scikitlearn",
};

type Icon = { title: string; slug: string; path: string };
let index: Map<string, Icon> | null = null;

function build() {
  const m = new Map<string, Icon>();
  for (const v of Object.values(si) as Icon[]) {
    if (v && typeof v === "object" && "path" in v && "slug" in v) {
      m.set(norm(v.title), v);
      m.set(v.slug, v);
    }
  }
  return m;
}

export function skillIconPath(title: string): string | null {
  index ??= build();
  const key = norm(title);
  const hit = index.get(key) ?? index.get(ALIASES[key] ?? "");
  return hit?.path ?? null;
}
