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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
