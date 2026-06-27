"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";

const settingsSchema = z.object({
  brandName: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  mapTitle: z.string().min(1),
  mapSubtitle: z.string().min(1),
  mapFocus: z.string().min(1),
  mapLatency: z.string().min(1),
  footerTagline: z.string().min(1),
});

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/welcome");
  revalidatePath("/admin/map");
}

export async function updateSettings(formData: FormData) {
  await requireAuth();
  const data = settingsSchema.parse(Object.fromEntries(formData));
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidate();
}
