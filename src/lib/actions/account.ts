"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type AccountState = { ok: boolean; message: string } | null;

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await auth();
  const username = session?.user?.name;
  if (!username) return { ok: false, message: "Unauthorized." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return { ok: false, message: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { ok: false, message: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.adminUser.update({ where: { username }, data: { passwordHash } });

  return { ok: true, message: "Password updated successfully." };
}
