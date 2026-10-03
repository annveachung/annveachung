import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build (server.js + traced node_modules) so the
  // CI runner can build once and rsync a small bundle to the server, which
  // runs it with `node server.js` — no build step on the 1 GB box.
  output: "standalone",
  // Force the Prisma query engine into the traced output; file tracing
  // sometimes misses the native .so.node binary.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*"],
  },
  // Let phones on the local network (http://<LAN-ip>:3000) load the dev
  // server's JS. Without this Next 16 blocks those requests, the page never
  // hydrates, and every client-rendered section (timeline cards, Arsenal
  // canvas, map) stays blank. Dev-only; has no effect on production.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
