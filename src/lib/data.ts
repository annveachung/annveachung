import { prisma } from "@/lib/prisma";

// Ensures the singleton SiteSettings row always exists.
export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: 1 } });
}

export async function getSiteData() {
  const [
    settings,
    navLinks,
    socialLinks,
    greetings,
    experiences,
    education,
    treeNodes,
    visitedCountries,
    gallery,
  ] = await Promise.all([
    getSiteSettings(),
    prisma.navLink.findMany({ orderBy: { order: "asc" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    prisma.greeting.findMany({ orderBy: { order: "asc" } }),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ orderBy: { order: "asc" } }),
    prisma.skillTreeNode.findMany({ orderBy: { order: "asc" } }),
    prisma.visitedCountry.findMany({ orderBy: { order: "asc" } }),
    prisma.galleryImage.findMany({ orderBy: { order: "asc" } }),
  ]);

  return {
    settings,
    navLinks,
    socialLinks,
    greetings,
    experiences,
    education,
    treeNodes,
    visitedCountries,
    gallery,
  };
}

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;
