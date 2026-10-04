import { headers } from "next/headers";
import { getSiteData } from "@/lib/data";
import { fadeGradient } from "@/lib/fade";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { SkillTree } from "@/components/sections/SkillTree";
import { Skills } from "@/components/sections/Skills";
import { GlobalMap } from "@/components/sections/GlobalMap";
import { VisualLogs } from "@/components/sections/VisualLogs";
import { Connect } from "@/components/sections/Connect";
import { Footer } from "@/components/sections/Footer";

// This page reads live data from the database, so render it per request
// instead of prerendering at build time (no DB is reachable during CI build).
export const dynamic = "force-dynamic";

// Eased gradient strip between two sections (smoothstep stops — no visible
// start/end edge even over a short distance). See lib/fade.ts.
function Fade({ h, from, to }: { h: string; from: string; to: string }) {
  return <div aria-hidden className={h} style={{ background: fadeGradient(from, to) }} />;
}

// Phones get a plain LINEAR strip (the colour change fills the whole height, so
// even a short strip reads as a gradient); desktop keeps the eased one. A null
// phoneH means the neighbouring section already blends into the colour itself.
function FadeSplit({ phoneH, deskH, from, to }: { phoneH: string | null; deskH: string; from: string; to: string }) {
  return (
    <>
      {phoneH && (
        <div aria-hidden className={`md:hidden ${phoneH}`} style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }} />
      )}
      <div aria-hidden className={`hidden md:block ${deskH}`} style={{ background: fadeGradient(from, to) }} />
    </>
  );
}

export default async function Home() {
  const data = await getSiteData();
  // Phones get a static, lightweight hero (decided server-side so the markup
  // itself is cheap — no reliance on CSS media queries or client JS).
  const ua = (await headers()).get("user-agent") ?? "";
  const phone = /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua);

  return (
    <div className="bg-background min-h-screen">
      <Navbar settings={data.settings} navLinks={data.navLinks} />
      <main>
        <Hero settings={data.settings} phone={phone} />
        <Fade h="h-16 md:h-24" from="#0d1518" to="#232b2e" />
        <SkillTree nodes={data.treeNodes} />
        <Fade h="h-16 md:h-24" from="#232b2e" to="#141b1f" />
        <Skills nodes={data.treeNodes} />
        <FadeSplit phoneH={null} deskH="h-40" from="#141b1f" to="#232b2e" />
        <GlobalMap
          settings={data.settings}
          visitedCountries={data.visitedCountries}
        />
        <FadeSplit phoneH="h-16" deskH="h-40" from="#232b2e" to="#141b1f" />
        <VisualLogs gallery={data.gallery} />
        <Fade h="h-14 md:h-20" from="#141b1f" to="#232b2e" />
        <Connect settings={data.settings} socialLinks={data.socialLinks} />
      </main>
    </div>
  );
}
