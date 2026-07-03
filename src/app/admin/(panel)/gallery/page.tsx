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
        subtitle="Photos shown in the looping gallery marquee. Upload 16:9 (landscape) photos or paste URLs — each is displayed at 16:9 and cover-cropped to fill. Caption is shown as the location a pacman announces on hover."
      />

      <div className="flex flex-col gap-4">
        {images.map((img) => (
          <Card key={img.id}>
            <form action={updateGalleryImage} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={img.id} />
              <ImageUploader
                name="url"
                label="Photo (16:9)"
                previewClassName="w-48 aspect-video"
                defaultValue={img.url}
              />
              <div className="flex items-end gap-3 flex-wrap">
                <Field
                  label="Location"
                  name="caption"
                  defaultValue={img.caption}
                  required={false}
                  placeholder="Kyoto, Japan"
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
            <ImageUploader name="url" label="Photo (16:9)" previewClassName="w-48 aspect-video" />
            <div className="flex items-end gap-3 flex-wrap">
              <Field label="Location" name="caption" required={false} placeholder="Kyoto, Japan" />
              <Field label="Order" name="order" type="number" defaultValue={images.length} />
              <SubmitButton>Add image</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
