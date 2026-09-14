"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";
import { A11Y_EVENT, prefersReduced } from "@/lib/a11y";
import { DESKTOP_QUERY, panelScroller } from "@/lib/scroller";
import { BG_EVENT, D, E, INTRO, STAGGER, type AttractDetail } from "@/lib/motion";

/**
 * The whole motion layer, in one client component mounted once in the shell.
 *
 * Why one component instead of a hook per section: every section on this
 * site is a Server Component, and the moment motion lives inside them they
 * all become client components and the panel ships as one big bundle. This
 * way the pages stay server-rendered and opt in with attributes:
 *
 *   data-reveal         — rises and fades in when it enters the viewport
 *   data-reveal-group   — its direct children do, staggered
 *   data-reveal-depth   — (on a group) the children also scale up
 *   data-split          — a heading whose lines rise through a mask
 *   data-tilt-card      — tilts and lifts toward the pointer
 *   data-tilt-icon      — (inside a tilt card) turns while it is hovered
 *   data-magnetic       — pulled a few px toward the cursor
 *   #process-spine      — the /services line, drawn as the panel scrolls
 *   data-flow           — a diagram whose [data-flow-path] connectors carry
 *                         travelling dots, pulsing the node each reaches
 *
 * It also runs the page transitions and talks to the Archipelago
 * background through window events (BG_EVENT in lib/motion.ts): scatter as
 * a page leaves, gather as the next arrives, attract toward the card or
 * button under the pointer.
 *
 * Division of labour (lib/motion.ts): GSAP owns all of this. Nothing else
 * animates these properties — which is why a bento card tilts on its inner
 * link while the reveal moves its <li>.
 *
 * Smooth scroll is Lenis rather than ScrollSmoother, deliberately —
 * ScrollSmoother transforms the content element, which makes `position:
 * fixed` children fix to the content rather than the viewport. The
 * Archipelago canvas is a fixed child.
 *
 * Reduced motion is a branch, not an absence: every animated element is set
 * to its END state (the spine fully drawn, every heading and card visible),
 * and the pointer effects and transitions do not run at all.
 */

// No ScrollTrigger (R9b, 2026-09-14): nothing here creates a trigger — the
// reveals use IntersectionObserver and the spine its own scroll listener —
// so its update/refresh calls did nothing, while the plugin was the largest
// part of this chunk to parse and evaluate. Re-add it only with a real
// trigger, and scroller: panelScroller().
gsap.registerPlugin(SplitText, DrawSVGPlugin, MotionPathPlugin);

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function bg(name: string, detail: AttractDetail = null) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function PageMotion() {
  const pathname = usePathname();
  const router = useRouter();

  // The accessibility panel can switch reduced motion on mid-visit. Bumping
  // this re-runs the effects below, which read prefersReduced() — the OS
  // setting OR the panel, whichever asks.
  //
  // It also bumps when the window crosses the desktop breakpoint, because
  // that changes which element scrolls: the panel above lg, the window
  // below it (lib/scroller.ts).
  const [a11yTick, setA11yTick] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const lastPath = useRef<string | null>(null);
  const failsafe = useRef(0);

  useEffect(() => {
    const bump = () => setA11yTick((n) => n + 1);
    const desktop = window.matchMedia(DESKTOP_QUERY);
    window.addEventListener(A11Y_EVENT, bump);
    desktop.addEventListener("change", bump);
    return () => {
      window.removeEventListener(A11Y_EVENT, bump);
      desktop.removeEventListener("change", bump);
    };
  }, []);

  useEffect(() => {
    if (prefersReduced()) return;

    // Desktop: smooth the panel, which is where the content scrolls. Its
    // single child is the content element Lenis needs. Below lg: the window.
    const panel = panelScroller();
    const lenis = new Lenis({
      lerp: 0.1,
      ...(panel
        ? {
            wrapper: panel,
            content: panel.firstElementChild ?? panel,
            eventsTarget: panel,
          }
        : {}),
    });
    lenisRef.current = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [a11yTick]);

  // ── Per page: reveals, split headings, the spine ────────────────────
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const reduce =
          (ctx.conditions as { reduce: boolean }).reduce || prefersReduced();

        const lines = gsap.utils.toArray<HTMLElement>(".hero-line");
        const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");
        const heads = gsap.utils.toArray<HTMLElement>("[data-split]");
        const spine = document.querySelector<SVGPathElement>("#process-spine");

        if (reduce) {
          // The end state, set directly. No scrub, no trigger, nothing left
          // waiting for a scroll event that a reduced-motion user may never
          // generate the same way.
          gsap.set([...lines, ...reveals], { opacity: 1, y: 0 });
          groups.forEach((g) =>
            gsap.set(Array.from(g.children), { opacity: 1, y: 0, scale: 1 }),
          );
          if (spine) gsap.set(spine, { drawSVG: "100%" });
          return;
        }

        // Hero — one timeline, on load. The copy is already painted; this
        // only lifts it, so a slow device that never runs it still reads.
        if (lines.length) {
          gsap.from(lines, {
            yPercent: 108,
            duration: D.base,
            ease: E,
            stagger: STAGGER.loose,
            // Wait out what is left of the boot intro (INTRO in lib/motion.ts,
            // timed from navigation start), so the lines rise as the overlay
            // fades — not a fixed 1.2s from hydration, which on a slow phone
            // hid the headline long after the intro had ended.
            delay: document.documentElement.classList.contains("is-intro")
              ? Math.max(0, INTRO.out - performance.now()) / 1000
              : 0,
          });
        }

        // Headings — each line rises out of its own mask. autoSplit re-cuts
        // the lines when fonts load or the width changes; onSplit returns
        // the tween so SplitText can restart it cleanly.
        const splits = heads.map((el) =>
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: D.base,
                ease: E,
                stagger: STAGGER.base,
                delay: 0.15,
              }),
          }),
        );

        // The /services process line draws as the page scrolls: 0% when the
        // list's top reaches 85% of the window, 100% when its bottom reaches
        // 90%. Measured from the list's own box on every scroll (capture
        // phase, so the panel's scroll counts as well as the window's) —
        // a ScrollTrigger on the Lenis-driven panel did not track reliably.
        let offSpine: (() => void) | null = null;
        if (spine) {
          const list = spine.closest("ol") ?? spine;
          gsap.set(spine, { drawSVG: "0%" });
          let frame = 0;
          const update = () => {
            frame = 0;
            const r = list.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = gsap.utils.clamp(
              0,
              1,
              (vh * 0.85 - r.top) / Math.max(r.height - vh * 0.05, 1),
            );
            gsap.to(spine, {
              drawSVG: `${p * 100}%`,
              duration: 0.5,
              ease: "power1.out",
              overwrite: true,
            });
          };
          const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
          };
          document.addEventListener("scroll", onScroll, {
            capture: true,
            passive: true,
          });
          update();
          offSpine = () => {
            document.removeEventListener("scroll", onScroll, { capture: true });
            cancelAnimationFrame(frame);
          };
        }

        // Reveals run on IntersectionObserver, not ScrollTrigger. It fires
        // at once for anything already on screen, it works the same whether
        // the window or the panel scrolls, and it works on the pinned home
        // page — where nothing can scroll a ScrollTrigger into range, which
        // left the bento stuck at opacity 0. The failsafe reveals anything
        // still waiting after 2.5s: no content may ever stay hidden.
        const pending = new Set<Element>();
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (en.isIntersecting) play(en.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px" },
        );

        function play(el: Element) {
          if (!pending.has(el)) return;
          pending.delete(el);
          io.unobserve(el);
          const group = el.hasAttribute("data-reveal-group");
          const depth = el.hasAttribute("data-reveal-depth");
          gsap.to(group ? Array.from(el.children) : el, {
            opacity: 1,
            y: 0,
            ...(depth ? { scale: 1 } : {}),
            duration: depth ? D.slow : D.base,
            ease: E,
            stagger: group ? STAGGER.base : 0,
            overwrite: true,
          });
        }

        reveals.forEach((el) => {
          gsap.set(el, { opacity: 0, y: 18 });
          pending.add(el);
          io.observe(el);
        });
        groups.forEach((g) => {
          const depth = g.hasAttribute("data-reveal-depth");
          gsap.set(Array.from(g.children), {
            opacity: 0,
            y: depth ? 34 : 22,
            ...(depth ? { scale: 0.94 } : {}),
          });
          pending.add(g);
          io.observe(g);
        });

        const reveal = window.setTimeout(
          () => Array.from(pending).forEach(play),
          2500,
        );

        return () => {
          io.disconnect();
          window.clearTimeout(reveal);
          splits.forEach((s) => s.revert());
          offSpine?.();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, [pathname, a11yTick]);

  // Spotlight — after Aceternity's Card Spotlight, re-tokenized.
  //
  // The registry version wraps each card in a client component, tracks the
  // pointer with `motion` values and mounts a react-three-fiber canvas on
  // hover. Here it is one delegated listener for the whole document writing
  // two CSS variables; the highlight itself is a radial gradient in
  // design/tokens.css under `[data-spotlight]`. Cards stay Server Components
  // and opt in with the attribute. Pointer-only by design — on touch there
  // is no hover to reward.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    function onMove(e: PointerEvent) {
      const card = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-spotlight]",
      );
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  // ── Pointer feel: card tilt, icon turn, magnetic buttons, attract ────
  // One delegated listener. A tilt card leans up to 4° toward the pointer
  // and lifts 4px, its icon tile turns; a magnetic button follows the
  // cursor up to 8px and springs back; whichever is under the pointer
  // tells the background to lean toward it. Fine pointers only, never
  // under reduced motion — the end state is the flat, still card.
  useEffect(() => {
    if (prefersReduced()) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;

    type Quick = ReturnType<typeof gsap.quickTo>;
    type Tilt = { rx: Quick; ry: Quick; y: Quick };
    const tilts = new WeakMap<HTMLElement, Tilt>();
    let card: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    let attracted: HTMLElement | null = null;
    const clamp8 = gsap.utils.clamp(-8, 8);

    function tiltOf(el: HTMLElement): Tilt {
      let t = tilts.get(el);
      if (!t) {
        gsap.set(el, { transformPerspective: 900 });
        t = {
          rx: gsap.quickTo(el, "rotationX", { duration: D.fast, ease: E }),
          ry: gsap.quickTo(el, "rotationY", { duration: D.fast, ease: E }),
          y: gsap.quickTo(el, "y", { duration: D.fast, ease: E }),
        };
        tilts.set(el, t);
      }
      return t;
    }
    function turnIcon(el: HTMLElement, on: boolean) {
      const icon = el.querySelector("[data-tilt-icon]");
      if (!icon) return;
      gsap.to(icon, {
        scale: on ? 1.08 : 1,
        rotation: on ? -6 : 0,
        duration: D.fast,
        ease: E,
        overwrite: "auto",
      });
    }
    function releaseCard() {
      if (!card) return;
      const t = tiltOf(card);
      t.rx(0);
      t.ry(0);
      t.y(0);
      turnIcon(card, false);
      card = null;
    }
    function releaseMagnet() {
      if (!magnet) return;
      gsap.to(magnet, {
        x: 0,
        y: 0,
        duration: D.slow,
        ease: "elastic.out(1, 0.45)",
        overwrite: "auto",
      });
      magnet = null;
    }
    function attract(el: HTMLElement | null) {
      if (el === attracted) return;
      attracted = el;
      if (!el) {
        bg(BG_EVENT.attract, null);
        return;
      }
      const r = el.getBoundingClientRect();
      bg(BG_EVENT.attract, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }

    function onMove(e: PointerEvent) {
      const target = e.target as Element | null;
      const c = target?.closest<HTMLElement>("[data-tilt-card]") ?? null;
      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;

      if (c !== card) {
        releaseCard();
        if (c) {
          card = c;
          turnIcon(c, true);
        }
      }
      if (card) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const t = tiltOf(card);
        t.ry(x * 8);
        t.rx(-y * 8);
        t.y(-4);
      }

      if (m !== magnet) {
        releaseMagnet();
        magnet = m;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        gsap.to(magnet, {
          x: clamp8((e.clientX - (r.left + r.width / 2)) * 0.3),
          y: clamp8((e.clientY - (r.top + r.height / 2)) * 0.3),
          duration: D.fast,
          ease: E,
          overwrite: "auto",
        });
      }

      attract(magnet ?? card);
    }
    function onOut(e: PointerEvent) {
      if (e.relatedTarget) return;
      releaseCard();
      releaseMagnet();
      attract(null);
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      releaseCard();
      releaseMagnet();
      attract(null);
    };
  }, [a11yTick]);

  // ── Flow diagrams: dots travel the connectors ───────────────────────
  // For each `[data-flow]` (the /services update flow): a glowing dot per
  // `[data-flow-path]`, started at the path's `data-flow-order`, carried
  // along it with MotionPath, and a pulse on the node it reaches
  // (`data-flow-to` → `[data-flow-node]`). One looping timeline per
  // diagram, played only while the diagram is on screen. Under reduced
  // motion nothing is added: the diagram is still and complete.
  useEffect(() => {
    if (prefersReduced()) return;
    const flows = gsap.utils.toArray<HTMLElement>("[data-flow]");
    if (!flows.length) return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const STEP = 0.9;
    const added: SVGCircleElement[] = [];
    const timelines: gsap.core.Timeline[] = [];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const i = flows.indexOf(en.target as HTMLElement);
        if (i >= 0) {
          if (en.isIntersecting) timelines[i]?.play();
          else timelines[i]?.pause();
        }
      });
    });

    flows.forEach((flow, fi) => {
      const svg = flow.querySelector("svg");
      const paths = Array.from(
        flow.querySelectorAll<SVGPathElement>("[data-flow-path]"),
      );
      if (!svg || !paths.length) return;

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
      paths.forEach((path) => {
        const at = Number(path.dataset.flowOrder ?? 0) * STEP;
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("r", "5");
        dot.style.fill = "var(--accent)";
        dot.style.filter = "drop-shadow(0 0 5px var(--accent))";
        dot.style.opacity = "0";
        svg.appendChild(dot);
        added.push(dot);

        tl.to(dot, { opacity: 1, duration: 0.15 }, at)
          .to(
            dot,
            {
              duration: STEP,
              ease: "power1.inOut",
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            },
            at,
          )
          .to(dot, { opacity: 0, duration: 0.15 }, at + STEP - 0.1);

        const node = flow.querySelector(
          `[data-flow-node="${path.dataset.flowTo}"]`,
        );
        if (node) {
          tl.to(
            node,
            { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.out" },
            at + STEP - 0.05,
          );
        }
      });
      timelines[fi] = tl;
      io.observe(flow);
    });

    return () => {
      io.disconnect();
      timelines.forEach((t) => t?.kill());
      added.forEach((d) => d.remove());
      flows.forEach((f) =>
        gsap.set(f.querySelectorAll("[data-flow-node]"), { clearProps: "transform" }),
      );
    };
  }, [pathname, a11yTick]);

  // Portrait tilt — the rail's cutout avatar (`[data-tilt]`) leans toward
  // the pointer while it is anywhere over the rail. Only the stage rotates;
  // the glow and the figure sit at different depths inside it (design/
  // tokens.css, `.portrait`), so they slide against each other. Mouse and
  // trackpad only, and never under reduced motion — the end state there is
  // the flat portrait, which is also what every other device gets.
  useEffect(() => {
    if (prefersReduced()) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;

    const host = document.querySelector<HTMLElement>("[data-tilt]");
    const stage = host?.querySelector<HTMLElement>(".portrait__stage");
    if (!host || !stage) return;
    const area = host.closest<HTMLElement>("aside") ?? host;

    const MAX = 7; // degrees
    const rx = gsap.quickTo(stage, "rotationX", { duration: D.base, ease: E });
    const ry = gsap.quickTo(stage, "rotationY", { duration: D.base, ease: E });
    const clamp = gsap.utils.clamp(-1, 1);

    function onMove(e: PointerEvent) {
      const r = host!.getBoundingClientRect();
      const a = area.getBoundingClientRect();
      const x = clamp((e.clientX - (r.left + r.width / 2)) / (a.width / 2));
      const y = clamp((e.clientY - (r.top + r.height / 2)) / (a.width / 2));
      ry(x * MAX);
      rx(-y * MAX);
    }
    function onLeave() {
      rx(0);
      ry(0);
    }

    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      gsap.set(stage, { clearProps: "transform" });
    };
  }, [a11yTick]);

  // ── Page transitions: leave ──────────────────────────────────────────
  // Capture phase, so this runs before next/link's own handler; that
  // handler returns early on `defaultPrevented` (next/dist/client/app-dir/
  // link.js), so preventing here hands navigation to us. The page fades up
  // and out while the background loosens, then the router moves on. Left
  // to the browser: other origins, new tabs and modifier clicks, downloads,
  // files (/cv.pdf) and same-page links (#hash). A failsafe restores the
  // page if navigation never lands.
  useEffect(() => {
    if (prefersReduced()) return;

    const route = (p: string) =>
      (p.slice(BASE.length) || "/").replace(/\/+$/, "") || "/";

    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download"))
        return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (BASE && !url.pathname.startsWith(BASE)) return;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return;
      if (route(url.pathname) === route(window.location.pathname)) return;

      const main = document.getElementById("main");
      if (!main) return;

      e.preventDefault();
      bg(BG_EVENT.scatter);
      const to = (url.pathname.slice(BASE.length) || "/") + url.search + url.hash;
      // Dim, not blank: on a slow connection the next page can take a few
      // seconds, and a dimmed page reads as "loading" where a blank one
      // reads as broken.
      gsap.to(main, {
        opacity: 0.2,
        y: -12,
        duration: D.fast * 0.6,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => router.push(to),
      });

      window.clearTimeout(failsafe.current);
      failsafe.current = window.setTimeout(() => {
        gsap.to(main, { opacity: 1, y: 0, duration: D.fast, overwrite: true });
        bg(BG_EVENT.gather);
      }, 4000);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(failsafe.current);
    };
  }, [a11yTick, router]);

  // ── Page transitions: arrive ─────────────────────────────────────────
  // Every route change after the first: the background resolves again and
  // the new page rises in. clearProps leaves no transform on <main>, so
  // fixed children (the work viewer) stay fixed to the viewport.
  useEffect(() => {
    window.clearTimeout(failsafe.current);
    // Skip the first path, and the second run React's dev StrictMode makes
    // of the same one: only a real change of route animates.
    if (lastPath.current === null || lastPath.current === pathname) {
      lastPath.current = pathname;
      return;
    }
    lastPath.current = pathname;
    bg(BG_EVENT.gather);
    const main = document.getElementById("main");
    if (!main) return;
    if (prefersReduced()) {
      gsap.set(main, { clearProps: "opacity,transform" });
      return;
    }
    gsap.fromTo(
      main,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: D.base,
        ease: E,
        overwrite: true,
        clearProps: "opacity,transform",
      },
    );
  }, [pathname]);

  // Route changes. Next resets the WINDOW's scroll on navigation, but on
  // desktop the panel is what scrolls — without this, every new page would
  // open wherever the last one was left. A #hash (e.g. /about#hire from
  // "Hire me") scrolls to its target instead of the top.
  useEffect(() => {
    const panel = panelScroller();
    if (!panel) return;

    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash ? document.getElementById(hash) : null;
    const lenis = lenisRef.current;

    if (target) {
      if (lenis) lenis.scrollTo(target, { immediate: true, offset: -24 });
      else target.scrollIntoView();
    } else if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      panel.scrollTo({ top: 0 });
    }
  }, [pathname]);

  return null;
}