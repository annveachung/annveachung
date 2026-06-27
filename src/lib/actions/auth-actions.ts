"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/admin/welcome",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid username or password.";
    }
    // Re-throw redirect (NEXT_REDIRECT) and any other control-flow errors.
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
