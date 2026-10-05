import { headers } from "next/headers";
import { getSiteData } from "@/lib/data";
import { SECTIONS, sectionVars } from "@/lib/sections";
import { SectionFade } from "@/components/sections/SectionFade";
import { RevealOnScroll } from "@/components/RevealOnScroll";
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

export default async function Home() {
  const data = await getSiteData();
  // Phones get a static, lightweight hero (decided server-side so the markup
  // itself is cheap — no reliance on CSS media queries or client JS).
  const ua = (await headers()).get("user-agent") ?? "";
  const phone = /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua);

  return (
    <div className="min-h-screen" style={{ ...sectionVars(), background: SECTIONS.hero } as React.CSSProperties}>
      <Navbar settings={data.settings} navLinks={data.navLinks} />
      <main>
        <Hero settings={data.settings} phone={phone} />
        <SectionFade from="hero" to="progression" />
        <SkillTree nodes={data.treeNodes} />
        <SectionFade from="progression" to="arsenal" />
        <Skills nodes={data.treeNodes} />
        <SectionFade from="arsenal" to="whereabouts" />
        <GlobalMap
          settings={data.settings}
          visitedCountries={data.visitedCountries}
        />
        <SectionFade from="whereabouts" to="gallery" />
        <VisualLogs gallery={data.gallery} />
        <SectionFade from="gallery" to="network" />
        <Connect settings={data.settings} socialLinks={data.socialLinks} />
      </main>
      <RevealOnScroll />
    </div>
  );
}
