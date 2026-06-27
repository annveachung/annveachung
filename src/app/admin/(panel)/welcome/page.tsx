import { getSiteSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/lib/actions/settings";
import {
  createNavLink,
  updateNavLink,
  deleteNavLink,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  createGreeting,
  updateGreeting,
  deleteGreeting,
} from "@/lib/actions/links";
import { PageHeader, SectionTitle } from "@/components/admin/PageHeader";
import { Field, TextArea, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";

export default async function WelcomePage() {
  const [settings, navLinks, socialLinks, greetings] = await Promise.all([
    getSiteSettings(),
    prisma.navLink.findMany({ orderBy: { order: "asc" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    prisma.greeting.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Welcome & Hero"
        subtitle="Brand name, hero copy, call-to-action and footer."
      />

      {/* Site settings */}
      <Card>
        <form action={updateSettings} className="grid md:grid-cols-2 gap-4">
          <Field label="Brand name" name="brandName" defaultValue={settings.brandName} />
          <Field label="Hero title" name="heroTitle" defaultValue={settings.heroTitle} />
          <div className="md:col-span-2">
            <TextArea
              label="Hero subtitle"
              name="heroSubtitle"
              defaultValue={settings.heroSubtitle}
            />
          </div>
          <Field label="CTA label" name="ctaLabel" defaultValue={settings.ctaLabel} />
          <Field label="CTA link" name="ctaHref" defaultValue={settings.ctaHref} />
          <Field
            label="Footer tagline"
            name="footerTagline"
            defaultValue={settings.footerTagline}
          />
          {/* Map meta is also edited on the Global Map page; keep hidden defaults
              so this form doesn't wipe them. */}
          <input type="hidden" name="mapTitle" defaultValue={settings.mapTitle} />
          <input type="hidden" name="mapSubtitle" defaultValue={settings.mapSubtitle} />
          <input type="hidden" name="mapFocus" defaultValue={settings.mapFocus} />
          <input type="hidden" name="mapLatency" defaultValue={settings.mapLatency} />
          <div className="md:col-span-2">
            <SubmitButton>Save hero settings</SubmitButton>
          </div>
        </form>
      </Card>

      {/* Nav links */}
      <SectionTitle>Navigation links</SectionTitle>
      <div className="flex flex-col gap-3">
        {navLinks.map((link) => (
          <Card key={link.id}>
            <div className="flex items-end gap-3 flex-wrap">
              <form action={updateNavLink} className="flex items-end gap-3 flex-wrap flex-1">
                <input type="hidden" name="id" value={link.id} />
                <Field label="Label" name="label" defaultValue={link.label} />
                <Field label="Link" name="href" defaultValue={link.href} />
                <Field label="Order" name="order" type="number" defaultValue={link.order} />
                <SubmitButton variant="ghost">Update</SubmitButton>
              </form>
              <form action={deleteNavLink}>
                <input type="hidden" name="id" value={link.id} />
                <DeleteButton />
              </form>
            </div>
          </Card>
        ))}
        <Card>
          <form action={createNavLink} className="flex items-end gap-3 flex-wrap">
            <Field label="Label" name="label" placeholder="Experience" />
            <Field label="Link" name="href" placeholder="#experience" />
            <Field label="Order" name="order" type="number" defaultValue={navLinks.length} />
            <SubmitButton>Add nav link</SubmitButton>
          </form>
        </Card>
      </div>

      {/* Social links */}
      <SectionTitle>Footer / social links</SectionTitle>
      <div className="flex flex-col gap-3">
        {socialLinks.map((link) => (
          <Card key={link.id}>
            <div className="flex items-end gap-3 flex-wrap">
              <form action={updateSocialLink} className="flex items-end gap-3 flex-wrap flex-1">
                <input type="hidden" name="id" value={link.id} />
                <Field label="Label" name="label" defaultValue={link.label} />
                <Field label="Link" name="href" defaultValue={link.href} />
                <Field label="Order" name="order" type="number" defaultValue={link.order} />
                <SubmitButton variant="ghost">Update</SubmitButton>
              </form>
              <form action={deleteSocialLink}>
                <input type="hidden" name="id" value={link.id} />
                <DeleteButton />
              </form>
            </div>
          </Card>
        ))}
        <Card>
          <form action={createSocialLink} className="flex items-end gap-3 flex-wrap">
            <Field label="Label" name="label" placeholder="LinkedIn" />
            <Field label="Link" name="href" placeholder="https://…" />
            <Field label="Order" name="order" type="number" defaultValue={socialLinks.length} />
            <SubmitButton>Add social link</SubmitButton>
          </form>
        </Card>
      </div>

      {/* Greetings */}
      <SectionTitle>Greeting marquee</SectionTitle>
      <div className="flex flex-col gap-3">
        {greetings.map((g) => (
          <Card key={g.id}>
            <div className="flex items-end gap-3 flex-wrap">
              <form action={updateGreeting} className="flex items-end gap-3 flex-wrap flex-1">
                <input type="hidden" name="id" value={g.id} />
                <Field label="Text" name="text" defaultValue={g.text} />
                <Field label="Order" name="order" type="number" defaultValue={g.order} />
                <SubmitButton variant="ghost">Update</SubmitButton>
              </form>
              <form action={deleteGreeting}>
                <input type="hidden" name="id" value={g.id} />
                <DeleteButton />
              </form>
            </div>
          </Card>
        ))}
        <Card>
          <form action={createGreeting} className="flex items-end gap-3 flex-wrap">
            <Field label="Text" name="text" placeholder="Hello" />
            <Field label="Order" name="order" type="number" defaultValue={greetings.length} />
            <SubmitButton>Add greeting</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
