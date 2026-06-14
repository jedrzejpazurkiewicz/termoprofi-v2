import Hero from "@/components/sections/Hero";
import Discovery from "@/components/sections/Discovery";
import WhyItMatters from "@/components/sections/WhyItMatters";
import UseCases from "@/components/sections/UseCases";
import TrustedBy from "@/components/sections/TrustedBy";
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
        <Discovery />
        <WhyItMatters />
      </div>
      <UseCases />
      <TrustedBy />
      <Fibertherm />
      <Products />
      <Owner />
      <Contact />
    </>
  );
}
