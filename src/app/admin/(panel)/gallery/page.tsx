import { prisma } from "@/lib/prisma";
import {
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "@/lib/actions/gallery";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="Visual Logs"
        subtitle="Images shown in the looping gallery marquee. Upload files or paste URLs."
      />

      <div className="flex flex-col gap-4">
        {images.map((img) => (
          <Card key={img.id}>
            <form action={updateGalleryImage} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={img.id} />
              <ImageUploader name="url" defaultValue={img.url} />
              <div className="flex items-end gap-3 flex-wrap">
                <Field
                  label="Caption"
                  name="caption"
                  defaultValue={img.caption}
                  required={false}
                />
                <Field label="Order" name="order" type="number" defaultValue={img.order} />
                <SubmitButton variant="ghost">Update</SubmitButton>
              </div>
            </form>
            <form action={deleteGalleryImage} className="mt-2">
              <input type="hidden" name="id" value={img.id} />
              <DeleteButton />
            </form>
          </Card>
        ))}

        <Card>
          <form action={createGalleryImage} className="flex flex-col gap-3">
            <ImageUploader name="url" />
            <div className="flex items-end gap-3 flex-wrap">
              <Field label="Caption" name="caption" required={false} placeholder="Visual Log" />
              <Field label="Order" name="order" type="number" defaultValue={images.length} />
              <SubmitButton>Add image</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
