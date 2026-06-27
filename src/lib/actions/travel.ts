"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";
import { countryName } from "@/lib/countries";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/map");
}

const addSchema = z.object({
  code: z.string().min(1),
});

// Add a visited country. `name` is derived from the code via the canonical
// country list so it always matches the map's feature labels.
export async function addVisitedCountry(formData: FormData) {
  await requireAuth();
  const { code } = addSchema.parse(Object.fromEntries(formData));

  const count = await prisma.visitedCountry.count();
  await prisma.visitedCountry.upsert({
    where: { code },
    update: {},
    create: { code, name: countryName(code), order: count },
  });
  revalidate();
}

export async function removeVisitedCountry(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  await prisma.visitedCountry.delete({ where: { id } });
  revalidate();
}
