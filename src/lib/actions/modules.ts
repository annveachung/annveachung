"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";

const moduleSchema = z.object({
  icon: z.string().min(1),
  badge: z.string().default(""),
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  order: z.coerce.number().int().default(0),
});

function parse(formData: FormData) {
  return moduleSchema.parse(Object.fromEntries(formData));
}

function revalidate(adminPath: string) {
  revalidatePath("/");
  revalidatePath(adminPath);
}

// --- Experience ---------------------------------------------------------

export async function createExperience(formData: FormData) {
  await requireAuth();
  await prisma.experience.create({ data: parse(formData) });
  revalidate("/admin/experience");
}

export async function updateExperience(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  await prisma.experience.update({ where: { id }, data: parse(formData) });
  revalidate("/admin/experience");
}

export async function deleteExperience(formData: FormData) {
  await requireAuth();
  await prisma.experience.delete({ where: { id: String(formData.get("id")) } });
  revalidate("/admin/experience");
}

// --- Education ----------------------------------------------------------

export async function createEducation(formData: FormData) {
  await requireAuth();
  await prisma.education.create({ data: parse(formData) });
  revalidate("/admin/education");
}

export async function updateEducation(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  await prisma.education.update({ where: { id }, data: parse(formData) });
  revalidate("/admin/education");
}

export async function deleteEducation(formData: FormData) {
  await requireAuth();
  await prisma.education.delete({ where: { id: String(formData.get("id")) } });
  revalidate("/admin/education");
}
