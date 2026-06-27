import { Field, TextArea, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";

type ModuleItem = {
  id: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  tags: string[];
  order: number;
};

type Action = (formData: FormData) => Promise<void>;

export function ModuleSection({
  items,
  createAction,
  updateAction,
  deleteAction,
  iconHint,
}: {
  items: ModuleItem[];
  createAction: Action;
  updateAction: Action;
  deleteAction: Action;
  iconHint: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <form action={updateAction} className="grid md:grid-cols-2 gap-4">
            <input type="hidden" name="id" value={item.id} />
            <Field label="Icon (Material Symbol)" name="icon" defaultValue={item.icon} />
            <Field label="Badge" name="badge" defaultValue={item.badge} required={false} />
            <div className="md:col-span-2">
              <Field label="Title" name="title" defaultValue={item.title} />
            </div>
            <div className="md:col-span-2">
              <TextArea label="Description" name="description" defaultValue={item.description} />
            </div>
            <Field
              label="Tags (comma-separated)"
              name="tags"
              defaultValue={item.tags.join(", ")}
              required={false}
            />
            <Field label="Order" name="order" type="number" defaultValue={item.order} />
            <div className="md:col-span-2 flex gap-3">
              <SubmitButton variant="ghost">Update</SubmitButton>
            </div>
          </form>
          <form action={deleteAction} className="mt-2">
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton />
          </form>
        </Card>
      ))}

      <Card>
        <form action={createAction} className="grid md:grid-cols-2 gap-4">
          <Field label="Icon (Material Symbol)" name="icon" placeholder={iconHint} />
          <Field label="Badge" name="badge" placeholder="Class of 2024" required={false} />
          <div className="md:col-span-2">
            <Field label="Title" name="title" placeholder="Institution / Role" />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Description" name="description" />
          </div>
          <Field label="Tags (comma-separated)" name="tags" required={false} />
          <Field label="Order" name="order" type="number" defaultValue={items.length} />
          <div className="md:col-span-2">
            <SubmitButton>Add entry</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
