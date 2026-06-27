import { prisma } from "@/lib/prisma";
import {
  createEducation,
  updateEducation,
  deleteEducation,
} from "@/lib/actions/modules";
import { PageHeader } from "@/components/admin/PageHeader";
import { ModuleSection } from "@/components/admin/ModuleSection";

export default async function EducationPage() {
  const items = await prisma.education.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <PageHeader
        title="Education"
        subtitle="Academic background shown alongside experience."
      />
      <ModuleSection
        items={items}
        createAction={createEducation}
        updateAction={updateEducation}
        deleteAction={deleteEducation}
        iconHint="compost"
      />
    </div>
  );
}
