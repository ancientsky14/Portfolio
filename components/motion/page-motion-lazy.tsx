"use client";

import dynamic from "next/dynamic";

/**
 * PageMotion, loaded after hydration instead of in the first-load bundle.
 *
 * It renders nothing — it only wires GSAP, its plugins and Lenis to the
 * server-rendered page — so none of that (~70KB gzip) has to arrive before
 * the page is usable. R9 (2026-09-14) measured first-load JS at ~218KB gzip
 * against the 200KB budget with it inline. The copy is already painted from
 * the HTML, so the only change a visitor can see is animations starting a
 * moment later.
 *
 * `ssr: false` is only allowed in a Client Component, hence this file.
 */
export const PageMotionLazy = dynamic(
  () => import("./page-motion").then((m) => m.PageMotion),
  { ssr: false },
);
