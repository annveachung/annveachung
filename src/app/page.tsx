import { getSiteData } from "@/lib/data";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { SkillTree } from "@/components/sections/SkillTree";
import { Skills } from "@/components/sections/Skills";
import { GlobalMap } from "@/components/sections/GlobalMap";
import { VisualLogs } from "@/components/sections/VisualLogs";
import { Connect } from "@/components/sections/Connect";
import { Footer } from "@/components/sections/Footer";

export default async function Home() {
  const data = await getSiteData();

  return (
    <div className="bg-background min-h-screen">
      <Navbar settings={data.settings} navLinks={data.navLinks} />
      <main>
        <Hero settings={data.settings} />
        <div aria-hidden className="h-24 bg-gradient-to-b from-background to-surface-variant" />
        <SkillTree nodes={data.treeNodes} />
        <div aria-hidden className="h-24 bg-gradient-to-b from-surface-variant to-surface-deep" />
        <Skills nodes={data.treeNodes} />
        <div aria-hidden className="h-24 bg-gradient-to-b from-surface-deep to-midnight" />
        <GlobalMap
          settings={data.settings}
          visitedCountries={data.visitedCountries}
        />
        <div aria-hidden className="h-24 bg-gradient-to-b from-midnight to-surface-variant" />
        <VisualLogs gallery={data.gallery} />
        <div aria-hidden className="h-24 bg-gradient-to-b from-surface-variant to-surface-deep" />
        <Connect settings={data.settings} socialLinks={data.socialLinks} />
      </main>
    </div>
  );
}
