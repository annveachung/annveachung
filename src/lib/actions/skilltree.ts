"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

const nodeSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["education", "experience", "skill"]),
  status: z.enum(["completed", "learning", "planned"]),
  city: z.string().default(""),
  organization: z.string().default(""),
  parents: z.array(z.string()).default([]),
  order: z.coerce.number().int().default(0),
});

// `parents` is submitted as repeated checkbox fields → read via getAll.
function parse(formData: FormData) {
  return nodeSchema.parse({
    ...Object.fromEntries(formData),
    parents: formData.getAll("parents").map(String).filter(Boolean),
  });
}

export async function createTreeNode(formData: FormData) {
  await requireAuth();
  await prisma.skillTreeNode.create({ data: parse(formData) });
  revalidate();
}

export async function updateTreeNode(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  await prisma.skillTreeNode.update({ where: { id }, data: parse(formData) });
  revalidate();
}

export async function deleteTreeNode(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  // Detach this node from any children that reference it as a parent.
  const children = await prisma.skillTreeNode.findMany({
    where: { parents: { has: id } },
  });
  await Promise.all(
    children.map((c) =>
      prisma.skillTreeNode.update({
        where: { id: c.id },
        data: { parents: c.parents.filter((p) => p !== id) },
      }),
    ),
  );
  await prisma.skillTreeNode.delete({ where: { id } });
  revalidate();
}
