import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Public_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { Rail } from "@/components/shell/rail";
import { MobileBar } from "@/components/shell/mobile-bar";
import { PanelFooter } from "@/components/shell/panel-footer";
import { PageMotion } from "@/components/motion/page-motion";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { SITE } from "@/lib/site";
import { avatarSrc } from "@/lib/avatar";
import { A11yPanel } from "@/components/shell/a11y-panel";
import { TabBar } from "@/components/shell/tab-bar";
import { BootIntro } from "@/components/motion/boot-intro";
import { Archipelago } from "@/components/hero/archipelago";
import { GoatCounter } from "@/components/analytics/goatcounter";
import "./globals.css";

/* The three faces from the design direction. The CSS variable names here
   are the ones design/tokens.css maps into --font-display / --font-sans /
   --font-mono — rename in both places or neither. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Jan Luigi Rivera — Full-stack product developer",
    template: "%s · Jan Luigi Rivera",
  },
  description: `${SITE.line} ${SITE.sub}`,
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "Jan Luigi Rivera",
  },
};

/**
 * Theme boot. Runs before first paint so a returning dark-theme visitor
 * never sees a flash of the light ground.
 *
 * Light is the default: with no stored preference this sets nothing, which
 * is deliberate — the site is light-first and only respects `prefers-color-
 * scheme: dark` as a starting guess, not as a lock.
 */
const THEME_BOOT = `
try{
  var d = document.documentElement;
  var t = localStorage.getItem('theme');
  if(!t && window.matchMedia('(prefers-color-scheme: dark)').matches) t='dark';
  if(t==='dark') d.classList.add('dark');
  var a = JSON.parse(localStorage.getItem('a11y') || 'null');
  if(a){
    if(a.text===1) d.classList.add('a11y-text-1');
    if(a.text===2) d.classList.add('a11y-text-2');
    if(a.contrast) d.classList.add('a11y-contrast');
    if(a.reduceMotion) d.classList.add('a11y-reduce-motion');
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || (a && a.reduceMotion);
  if(!reduce && !sessionStorage.getItem('booted')){
    sessionStorage.setItem('booted','1');
    d.classList.add('is-intro');
    setTimeout(function(){ d.classList.remove('is-intro','is-intro-out'); }, 3000);
  }
}catch(e){}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} min-h-dvh bg-ground text-text antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>

        <PageMotion />
        {/* Visit counting for the rail's count — renders nothing until
            SITE.goatcounter is set (lib/site.ts). */}
        <GoatCounter />
        <ScrollProgress />
        <A11yPanel />
        <BootIntro />
        <TabBar />

        {/* The site-wide background — the Archipelago point cloud, mounted
            once so it survives route changes. Fixed, full-window, behind the
            shell (the shell paints no background of its own), and never
            takes a pointer event: the canvas reads the pointer from the
            window. The gate inside decides whether it mounts at all. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
        >
          <Archipelago />
        </div>

        {/* The shell, after the reference: on desktop the page itself never
            scrolls — the rail and the panel are two independent scroll
            areas side by side, the rail with no visible scrollbar, the
            panel with a thin one. Below lg it is an ordinary page that
            scrolls with the window, under the sticky mobile bar.

            Everything that listens to scroll asks lib/scroller.ts which
            element that is. The panel holds a single child on purpose:
            Lenis needs a wrapper (the panel) and one content element. */}
        <div className="flex min-h-dvh flex-col lg:h-dvh lg:min-h-0 lg:flex-row lg:overflow-hidden">
          <MobileBar />
          <Rail avatarSrc={avatarSrc()} />

          <div
            id="panel"
            className="panel-scroller flex min-w-0 flex-1 flex-col"
          >
            {/* pb clears the mobile tab bar; the rail needs none. */}
            <div className="flex flex-1 flex-col pb-24 lg:pb-0">
              {/* A flex column so a page can fill the panel's height —
                  the home page's `.home-fit` does, on wide screens. */}
              <main id="main" className="flex flex-1 flex-col">
                {children}
              </main>
              <PanelFooter />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
