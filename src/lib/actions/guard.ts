import { auth } from "@/lib/auth";

// Every mutating server action / API route calls this so that, even if the
// middleware is bypassed, writes are still rejected without a valid session.
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
