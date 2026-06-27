import { getSiteSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/lib/actions/settings";
import { addVisitedCountry, removeVisitedCountry } from "@/lib/actions/travel";
import { COUNTRIES } from "@/lib/countries";
import { PageHeader, SectionTitle } from "@/components/admin/PageHeader";
import { Field, TextArea, SubmitButton, DeleteButton, Card } from "@/components/admin/ui";

export default async function MapPage() {
  const [settings, visited] = await Promise.all([
    getSiteSettings(),
    prisma.visitedCountry.findMany({ orderBy: { order: "asc" } }),
  ]);

  const visitedCodes = new Set(visited.map((v) => v.code));
  const available = COUNTRIES.filter((c) => !visitedCodes.has(c.code));

  return (
    <div>
      <PageHeader
        title="visited.json"
        subtitle="The heading and the countries illuminated on your interactive world map."
      />

      {/* Map meta */}
      <Card>
        <form action={updateSettings} className="grid md:grid-cols-2 gap-4">
          {/* Other settings kept as hidden so this form doesn't wipe them. */}
          <input type="hidden" name="brandName" defaultValue={settings.brandName} />
          <input type="hidden" name="heroTitle" defaultValue={settings.heroTitle} />
          <input type="hidden" name="heroSubtitle" defaultValue={settings.heroSubtitle} />
          <input type="hidden" name="ctaLabel" defaultValue={settings.ctaLabel} />
          <input type="hidden" name="ctaHref" defaultValue={settings.ctaHref} />
          <input type="hidden" name="footerTagline" defaultValue={settings.footerTagline} />
          <input type="hidden" name="mapFocus" defaultValue={settings.mapFocus} />
          <input type="hidden" name="mapLatency" defaultValue={settings.mapLatency} />

          <div className="md:col-span-2">
            <Field label="Map title" name="mapTitle" defaultValue={settings.mapTitle} />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Map subtitle"
              name="mapSubtitle"
              defaultValue={settings.mapSubtitle}
            />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Save map settings</SubmitButton>
          </div>
        </form>
      </Card>

      {/* Add a visited country */}
      <SectionTitle>Visited countries ({visited.length})</SectionTitle>
      <Card>
        <form action={addVisitedCountry} className="flex items-end gap-3 flex-wrap">
          <label className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
            <span className="font-label text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
              Add country
            </span>
            <select
              name="code"
              required
              defaultValue=""
              className="bg-midnight/60 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-accent-turquoise focus:outline-none transition-colors"
            >
              <option value="" disabled>
                Select a country…
              </option>
              {available.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>Add</SubmitButton>
        </form>
      </Card>

      {/* Visited list */}
      <div className="flex flex-wrap gap-2 mt-4">
        {visited.length === 0 && (
          <p className="text-sm text-on-surface-variant/70">
            No countries yet — add one above.
          </p>
        )}
        {visited.map((v) => (
          <form
            key={v.id}
            action={removeVisitedCountry}
            className="glass rounded-full pl-4 pr-2 py-1.5 border border-accent-turquoise/20 flex items-center gap-2"
          >
            <input type="hidden" name="id" value={v.id} />
            <span className="text-sm text-primary">{v.name}</span>
            <button
              type="submit"
              aria-label={`Remove ${v.name}`}
              className="w-5 h-5 rounded-full flex items-center justify-center text-on-surface-variant hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
