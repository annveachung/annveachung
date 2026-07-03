import { prisma } from "@/lib/prisma";
import {
  createTreeNode,
  updateTreeNode,
  deleteTreeNode,
} from "@/lib/actions/skilltree";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";
import { SkillNodeFields } from "@/components/admin/SkillNodeFields";

type Node = {
  id: string;
  title: string;
  category: string;
  status: string;
  city: string;
  organization: string;
  icon: string;
  parents: string[];
  order: number;
};

function ParentPicker({ all, self, selected }: { all: Node[]; self?: string; selected: string[] }) {
  const options = all.filter((n) => n.id !== self);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        Parents (connect back toward root)
      </span>
      <div className="flex flex-wrap gap-2">
        {options.length === 0 && (
          <span className="text-xs text-on-surface-variant/60">
            No other nodes yet — leave empty for a root node.
          </span>
        )}
        {options.map((o) => (
          <label
            key={o.id}
            className="flex items-center gap-1.5 text-xs bg-midnight/50 border border-outline-variant/30 rounded-full px-3 py-1 cursor-pointer hover:border-accent-turquoise/40"
          >
            <input
              type="checkbox"
              name="parents"
              value={o.id}
              defaultChecked={selected.includes(o.id)}
              className="accent-[var(--color-accent-turquoise)]"
            />
            {o.title}
          </label>
        ))}
      </div>
    </div>
  );
}

export default async function SkillTreePage() {
  const nodes: Node[] = await prisma.skillTreeNode.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Skill Tree"
        subtitle="Education, experience and skill nodes for the living-CV graph. For education & experience, Title is the role/degree; City and Institution/Company fill the card's other two lines. Skill nodes use Title and an uploaded icon (all icons render at the same size). Connect each node to its parent(s) to grow the tree."
      />

      <div className="flex flex-col gap-4">
        {nodes.map((n) => (
          <Card key={n.id}>
            <form action={updateTreeNode} className="grid md:grid-cols-2 gap-4">
              <input type="hidden" name="id" value={n.id} />
              <Field label="Title (role / degree)" name="title" defaultValue={n.title} />
              <Field label="City" name="city" defaultValue={n.city} required={false} />
              <SkillNodeFields category={n.category} status={n.status} icon={n.icon} />
              <Field label="Institution / Company" name="organization" defaultValue={n.organization} required={false} />
              <Field label="Order" name="order" type="number" defaultValue={n.order} />
              <div className="md:col-span-2">
                <ParentPicker all={nodes} self={n.id} selected={n.parents} />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <SubmitButton variant="ghost">Update</SubmitButton>
              </div>
            </form>
            <form action={deleteTreeNode} className="mt-2">
              <input type="hidden" name="id" value={n.id} />
              <DeleteButton />
            </form>
          </Card>
        ))}

        <Card>
          <form action={createTreeNode} className="grid md:grid-cols-2 gap-4">
            <Field label="Title (role / degree)" name="title" placeholder="Honours BSc, Computer Science" />
            <Field label="City" name="city" placeholder="Toronto, Canada" required={false} />
            <SkillNodeFields />
            <Field label="Institution / Company" name="organization" placeholder="University of Toronto" required={false} />
            <Field label="Order" name="order" type="number" defaultValue={nodes.length} />
            <div className="md:col-span-2">
              <ParentPicker all={nodes} selected={[]} />
            </div>
            <div className="md:col-span-2">
              <SubmitButton>Add node</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
