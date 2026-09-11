import { Hero } from "@/components/home/hero";
import { ToolsMarquee } from "@/components/home/tools-marquee";
import { Bento } from "@/components/home/bento";

/**
 * Home — the pitch, in one screen and a scroll.
 *
 * The v1 landing was a ten-section scroll essay. The redesign follows the
 * reference shell instead: a rail that never leaves, and a panel that opens
 * with a headline, a tools row, and a grid of doors into the rest of the
 * site. The long-form arguments did not disappear — they moved to the pages
 * that own them (`/work`, `/services`, `/about`), where a buyer who wants
 * them can read them without a casual visitor having to scroll past them.
 *
 * Zero scroll animation still. Phase R4 adds Lenis + GSAP over this markup;
 * Phase R5 mounts the Archipelago canvas into the hero's slot.
 */

export default function Home() {
  // `.home-fit` (design/tokens.css): from 1100px wide the whole home page
  // fits the window and the panel stops scrolling, as on the reference.
  return (
    <div className="home-fit">
      <Hero />
      <ToolsMarquee />
      <Bento />
    </div>
  );
}
