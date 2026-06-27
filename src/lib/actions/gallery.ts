"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";

const gallerySchema = z.object({
  url: z.string().min(1),
  caption: z.string().default(""),
  order: z.coerce.number().int().default(0),
});

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function createGalleryImage(formData: FormData) {
  await requireAuth();
  await prisma.galleryImage.create({
    data: gallerySchema.parse(Object.fromEntries(formData)),
  });
  revalidate();
}

export async function updateGalleryImage(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  await prisma.galleryImage.update({
    where: { id },
    data: gallerySchema.parse(Object.fromEntries(formData)),
  });
  revalidate();
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAuth();
  await prisma.galleryImage.delete({ where: { id: String(formData.get("id")) } });
  revalidate();
}
