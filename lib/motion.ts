/**
 * The motion signature. One easing, three durations.
 *
 * Kept in sync by hand with --ease-out in design/tokens.css. When a
 * component installed from Magic UI, Aceternity or 21st.dev arrives with
 * its own duration or easing, override it with these rather than letting
 * a fourth timing into the site.
 *
 * Division of labour (build plan §08):
 *   GSAP owns  — scroll-scrubbed timelines, pinning, the hero sequence,
 *                SplitText, DrawSVG, Flip.
 *   motion owns — whatever ships inside a library component: hover and
 *                mount states. Leave those alone.
 *   Never both  — two systems animating the same property on the same
 *                element is the bug you will spend a day finding. If you
 *                need to GSAP a library component, wrap it in a plain div
 *                and animate the wrapper.
 */

/** Durations, in seconds (GSAP's unit). */
export const D = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
} as const;

/** GSAP easing. Equivalent to cubic-bezier(.16, 1, .3, 1). */
export const E = "expo.out";
export const E_INOUT = "power2.inOut";

/** Stagger presets, so lists across the site share a rhythm. */
export const STAGGER = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
} as const;

/**
 * Window events the motion layer (components/motion/page-motion.tsx) sends
 * to the Archipelago background (components/hero/archipelago-canvas.tsx),
 * so neither imports the other and the background can be absent.
 *
 *   scatter — a page is leaving: the field loosens.
 *   gather  — the new page is in: the field resolves again.
 *   attract — `detail` is the centre, in client px, of the card or button
 *             under the pointer (the islands lean toward it), or null.
 */
export const BG_EVENT = {
  scatter: "bg:scatter",
  gather: "bg:gather",
  attract: "bg:attract",
} as const;

export type AttractDetail = { x: number; y: number } | null;

/**
 * Boot intro timing, in ms from navigation start (components/motion/boot-intro.tsx).
 * The inline boot script in app/layout.tsx runs both timers, so the content
 * is revealed at INTRO.done on any device. They used to start at hydration,
 * which on a throttled phone kept the page hidden up to 3s (R9, 2026-09-14).
 */
export const INTRO = {
  out: 1150, // overlay starts fading
  done: 1650, // classes removed, site fully revealed
} as const;