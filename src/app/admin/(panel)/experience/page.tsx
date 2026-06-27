import { prisma } from "@/lib/prisma";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/actions/modules";
import { PageHeader } from "@/components/admin/PageHeader";
import { ModuleSection } from "@/components/admin/ModuleSection";

export default async function ExperiencePage() {
  const items = await prisma.experience.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <PageHeader
        title="Experience"
        subtitle="Core module cards highlighting your work and research."
      />
      <ModuleSection
        items={items}
        createAction={createExperience}
        updateAction={updateExperience}
        deleteAction={deleteExperience}
        iconHint="terminal"
      />
    </div>
  );
}
