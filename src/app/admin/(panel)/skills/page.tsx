import { prisma } from "@/lib/prisma";
import {
  createTreeNode,
  updateTreeNode,
  deleteTreeNode,
} from "@/lib/actions/skilltree";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field, TextArea, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";

type Node = {
  id: string;
  title: string;
  category: string;
  status: string;
  period: string;
  description: string;
  parents: string[];
  order: number;
};

const CATEGORIES = ["education", "experience", "skill"];
const STATUSES = ["completed", "learning", "planned"];

function Select({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? options[0]}
        className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

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
        subtitle="Education, experience and skill nodes for the living-CV graph. Connect each node to its parent(s) to grow the tree."
      />

      <div className="flex flex-col gap-4">
        {nodes.map((n) => (
          <Card key={n.id}>
            <form action={updateTreeNode} className="grid md:grid-cols-2 gap-4">
              <input type="hidden" name="id" value={n.id} />
              <Field label="Title" name="title" defaultValue={n.title} />
              <Field label="Period" name="period" defaultValue={n.period} required={false} />
              <Select label="Category" name="category" value={n.category} options={CATEGORIES} />
              <Select label="Status" name="status" value={n.status} options={STATUSES} />
              <div className="md:col-span-2">
                <TextArea
                  label="Description (1–2 lines)"
                  name="description"
                  defaultValue={n.description}
                  required={false}
                  rows={2}
                />
              </div>
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
            <Field label="Title" name="title" placeholder="University of Toronto" />
            <Field label="Period" name="period" placeholder="2018 – 2022" required={false} />
            <Select label="Category" name="category" options={CATEGORIES} />
            <Select label="Status" name="status" options={STATUSES} />
            <div className="md:col-span-2">
              <TextArea
                label="Description (1–2 lines)"
                name="description"
                required={false}
                rows={2}
              />
            </div>
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
