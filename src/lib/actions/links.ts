"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/guard";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/welcome");
}

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  order: z.coerce.number().int().default(0),
});

// --- Nav links ----------------------------------------------------------

export async function createNavLink(formData: FormData) {
  await requireAuth();
  const data = linkSchema.parse(Object.fromEntries(formData));
  await prisma.navLink.create({ data });
  revalidate();
}

export async function updateNavLink(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  const data = linkSchema.parse(Object.fromEntries(formData));
  await prisma.navLink.update({ where: { id }, data });
  revalidate();
}

export async function deleteNavLink(formData: FormData) {
  await requireAuth();
  await prisma.navLink.delete({ where: { id: String(formData.get("id")) } });
  revalidate();
}

// --- Social links -------------------------------------------------------

export async function createSocialLink(formData: FormData) {
  await requireAuth();
  const data = linkSchema.parse(Object.fromEntries(formData));
  await prisma.socialLink.create({ data });
  revalidate();
}

export async function updateSocialLink(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  const data = linkSchema.parse(Object.fromEntries(formData));
  await prisma.socialLink.update({ where: { id }, data });
  revalidate();
}

export async function deleteSocialLink(formData: FormData) {
  await requireAuth();
  await prisma.socialLink.delete({ where: { id: String(formData.get("id")) } });
  revalidate();
}

// --- Greetings ----------------------------------------------------------

const greetingSchema = z.object({
  text: z.string().min(1),
  order: z.coerce.number().int().default(0),
});

export async function createGreeting(formData: FormData) {
  await requireAuth();
  const data = greetingSchema.parse(Object.fromEntries(formData));
  await prisma.greeting.create({ data });
  revalidate();
}

export async function updateGreeting(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  const data = greetingSchema.parse(Object.fromEntries(formData));
  await prisma.greeting.update({ where: { id }, data });
  revalidate();
}

export async function deleteGreeting(formData: FormData) {
  await requireAuth();
  await prisma.greeting.delete({ where: { id: String(formData.get("id")) } });
  revalidate();
}
