import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma / bcrypt imports here so it can be used by
// middleware (which runs on the edge runtime). The Credentials provider that
// touches the database lives in auth.ts (Node runtime).
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnLogin = pathname.startsWith("/admin/login");
      const isOnAdmin = pathname.startsWith("/admin");

      // Already-authenticated users hitting the login page go to the panel.
      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin/welcome", request.nextUrl));
        }
        return true;
      }

      // Everything else under /admin requires a session.
      if (isOnAdmin) return isLoggedIn;

      return true;
    },
  },
} satisfies NextAuthConfig;
