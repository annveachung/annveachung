import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe NextAuth instance (no DB provider) used purely to read/verify the
// JWT session cookie and enforce the `authorized` callback for /admin routes.
// (Next.js 16 renamed the "middleware" convention to "proxy".)
export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
