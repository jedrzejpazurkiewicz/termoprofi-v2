import Hero from "@/components/sections/Hero";
import BridgeStat from "@/components/sections/BridgeStat";
import EdgeApproach from "@/components/sections/EdgeApproach";
import Discovery from "@/components/sections/Discovery";
import WhyItMatters from "@/components/sections/WhyItMatters";
import SelfCheck from "@/components/sections/SelfCheck";
// UseCases ("Realizacje") tymczasowo zdjęte z głównej strony — trafi na osobną
// zakładkę. Komponent zostaje: src/components/sections/UseCases.tsx
import TrustedBy from "@/components/sections/TrustedBy";
import GlazingExploded from "@/components/sections/GlazingExploded";
import Fibertherm from "@/components/sections/Fibertherm";
import Products from "@/components/sections/Products";
import Owner from "@/components/sections/Owner";
import Contact from "@/components/sections/Contact";

/**
 * Home — the one-pager composition root (Server Component).
 *
 * The three opening sections (Hero → Discovery → WhyItMatters) are wrapped in a
 * single `[data-spine]` element. The spine ScrollTrigger in SmoothScrollProvider
 * measures exactly this element top→bottom and writes its 0..1 progress to
 * `scroll.progress`, which the 3D SceneController reads each frame to drive the
 * termo-reveal (emerge → rotate → heat). Everything after the spine is ordinary
 * scrolling content over the now-revealed glass unit.
 */
export default function Home() {
  return (
    <>
      <div data-spine>
        <Hero />
        <BridgeStat />
        <EdgeApproach />
        <Discovery />
        <WhyItMatters />
      </div>
      <SelfCheck />
      {/* "Realizacje" (UseCases) przeniesione na osobną zakładkę. */}
      <TrustedBy />
      <GlazingExploded />
      <Fibertherm />
      <Products />
      <Owner />
      <Contact />
    </>
  );
}
