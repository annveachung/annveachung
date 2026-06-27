import { getSiteData } from "@/lib/data";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { CoreModules } from "@/components/sections/CoreModules";
import { SkillArchitecture } from "@/components/sections/SkillArchitecture";
import { GlobalMap } from "@/components/sections/GlobalMap";
import { VisualLogs } from "@/components/sections/VisualLogs";
import { Footer } from "@/components/sections/Footer";

export default async function Home() {
  const data = await getSiteData();

  return (
    <div className="nocturnal-gradient min-h-screen">
      <Navbar settings={data.settings} navLinks={data.navLinks} />
      <main>
        <Hero settings={data.settings} />
        <CoreModules experiences={data.experiences} education={data.education} />
        <SkillArchitecture skills={data.skills} />
        <GlobalMap
          settings={data.settings}
          visitedCountries={data.visitedCountries}
        />
        <VisualLogs gallery={data.gallery} />
      </main>
      <Footer settings={data.settings} socialLinks={data.socialLinks} />
    </div>
  );
}
