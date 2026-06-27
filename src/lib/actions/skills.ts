"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";

const skillSchema = z.object({
  icon: z.string().min(1),
  label: z.string().min(1),
  order: z.coerce.number().int().default(0),
});

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function createSkill(formData: FormData) {
  await requireAuth();
  await prisma.skill.create({ data: skillSchema.parse(Object.fromEntries(formData)) });
  revalidate();
}

export async function updateSkill(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  await prisma.skill.update({
    where: { id },
    data: skillSchema.parse(Object.fromEntries(formData)),
  });
  revalidate();
}

export async function deleteSkill(formData: FormData) {
  await requireAuth();
  await prisma.skill.delete({ where: { id: String(formData.get("id")) } });
  revalidate();
}
