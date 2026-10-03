import * as si from "simple-icons";
import * as lucide from "lucide";

// Resolve a skill's title to an SVG path (24x24 viewBox): a Simple Icons brand
// logo (filled) when one exists, otherwise a generic Lucide icon (stroked)
// picked by keyword, otherwise a default glyph.
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

export type SkillIcon = { path: string; stroke: boolean };

// Keyword -> Lucide icon. First match wins, so order matters.
const GENERIC: [RegExp, string][] = [
  [/\b(ai|ml|machine|neural|intelligen|llm|learning model|data science)/, "Brain"],
  [/system|architect|network|integrat/, "Network"],
  [/motion|animat|interaction|transition/, "Wind"],
  [/ux|ui\b|design|figma|prototyp|visual|graphic|brand|illustrat|creative/, "Palette"],
  [/front|web|html|css|react|browser/, "Code"],
  [/back|server|api|node/, "Server"],
  [/data|sql|analytic/, "Database"],
  [/cloud|devops|deploy|infra|aws|azure/, "Cloud"],
  [/mobile|ios|android|app\b/, "Smartphone"],
  [/test|qa|quality/, "FlaskConical"],
  [/secur|crypto|privacy/, "Shield"],
  [/research|science|study/, "Microscope"],
  [/product|project|manage|agile|lead|strategy/, "Kanban"],
  [/cod|program|develop|engineer|script/, "Terminal"],
  [/hardware|embedded|robot|electr/, "Cpu"],
];

type Node = [string, Record<string, string | number>];
function nodeToPath(tag: string, a: Record<string, string | number>): string {
  const n = (k: string) => Number(a[k] ?? 0);
  switch (tag) {
    case "path": return String(a.d);
    case "line": return `M${n("x1")} ${n("y1")}L${n("x2")} ${n("y2")}`;
    case "polyline": return `M${a.points}`;
    case "polygon": return `M${a.points}Z`;
    case "circle": { const r = n("r"); return `M${n("cx") - r} ${n("cy")}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; }
    case "ellipse": { const rx = n("rx"), ry = n("ry"); return `M${n("cx") - rx} ${n("cy")}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`; }
    case "rect": {
      const x = n("x"), y = n("y"), w = n("width"), h = n("height"), r = Math.min(n("rx"), w / 2, h / 2);
      return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
    }
    default: return "";
  }
}
function lucidePath(name: string): string {
  const nodes = (lucide as unknown as Record<string, Node[]>)[name] ?? (lucide as unknown as Record<string, Node[]>).Sparkles;
  return nodes.map(([t, a]) => nodeToPath(t, a)).join("");
}

// Pool of generic icons for skills with neither a brand logo nor a keyword hit.
const POOL = [
  "Sparkles", "Hexagon", "Layers", "Blocks", "Boxes", "Workflow", "Compass", "Rocket",
  "Lightbulb", "Puzzle", "Atom", "Gem", "Zap", "Orbit", "Wrench", "Cog", "Telescope",
  "Anchor", "Feather", "Flame", "Leaf", "Star", "Shapes", "Component", "Waypoints",
  "Infinity", "Hammer", "Magnet", "Crown", "Key", "Target", "Triangle", "Diamond",
  "Pyramid", "Mountain", "Sun", "Moon", "Snowflake", "Dna",
];

function hashStr(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Resolve icons for a whole list of skills at once so that skills without a
// brand logo never share the same generic icon (until the pool runs out).
export function skillIcons(titles: string[]): SkillIcon[] {
  index ??= build();
  const used = new Set<string>();
  return titles.map((title) => {
    const hit = index!.get(norm(title)) ?? index!.get(ALIASES[norm(title)] ?? "");
    if (hit) return { path: hit.path, stroke: false };

    const t = title.toLowerCase();
    const start = hashStr(title) % POOL.length;
    const candidates = [
      ...GENERIC.filter(([re]) => re.test(t)).map(([, name]) => name),
      ...POOL.map((_, k) => POOL[(start + k) % POOL.length]),
    ];
    const name = candidates.find((c) => !used.has(c)) ?? candidates[0];
    used.add(name);
    return { path: lucidePath(name), stroke: true };
  });
}
