import { prisma } from "@/lib/prisma";
import { createSkill, updateSkill, deleteSkill } from "@/lib/actions/skills";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <PageHeader
        title="Skills"
        subtitle="Nodes around the Skill Architecture core (first 4 are placed radially)."
      />
      <div className="flex flex-col gap-3">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <div className="flex items-end gap-3 flex-wrap">
              <form action={updateSkill} className="flex items-end gap-3 flex-wrap flex-1">
                <input type="hidden" name="id" value={skill.id} />
                <Field label="Icon (Material Symbol)" name="icon" defaultValue={skill.icon} />
                <Field label="Label" name="label" defaultValue={skill.label} />
                <Field label="Order" name="order" type="number" defaultValue={skill.order} />
                <SubmitButton variant="ghost">Update</SubmitButton>
              </form>
              <form action={deleteSkill}>
                <input type="hidden" name="id" value={skill.id} />
                <DeleteButton />
              </form>
            </div>
          </Card>
        ))}
        <Card>
          <form action={createSkill} className="flex items-end gap-3 flex-wrap">
            <Field label="Icon (Material Symbol)" name="icon" placeholder="design_services" />
            <Field label="Label" name="label" placeholder="UI/UX Design" />
            <Field label="Order" name="order" type="number" defaultValue={skills.length} />
            <SubmitButton>Add skill</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
