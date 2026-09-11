"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { A11Y_EVENT, prefersReduced } from "@/lib/a11y";

/**
 * The gate in front of the WebGL background (mounted in app/layout.tsx).
 *
 * `three` never enters the main bundle: the canvas is a `dynamic(..., { ssr:
 * false })` import that is not even requested until this component decides
 * the visitor should have it. Everything the page needs to be read and used
 * has already painted by then.
 *
 * It does not mount when:
 *   · the visitor asked for reduced motion
 *   · the browser has no WebGL context to give
 *   · Save-Data is on, or the connection reports 2g/slow-2g
 *   · the device reports under 4GB of memory
 *
 * That list is written for the buyers this site is for: mid-range Android,
 * mobile data, often outside Metro Manila. The still poster underneath is
 * not an apology — it is the default, and the canvas is the enhancement.
 */

const ArchipelagoCanvas = dynamic(() => import("./archipelago-canvas"), {
  ssr: false,
});

type Connection = {
  saveData?: boolean;
  effectiveType?: string;
};

function shouldMount(): boolean {
  // The OS setting or the site's own accessibility panel.
  if (prefersReduced()) return false;

  const nav = navigator as Navigator & {
    connection?: Connection;
    deviceMemory?: number;
  };

  if (nav.connection?.saveData) return false;
  if (
    nav.connection?.effectiveType &&
    ["slow-2g", "2g"].includes(nav.connection.effectiveType)
  )
    return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Release the probe context immediately rather than waiting for GC —
    // browsers cap the number of live contexts and the real one comes next.
    (gl as WebGLRenderingContext)
      .getExtension("WEBGL_lose_context")
      ?.loseContext();
  } catch {
    return false;
  }

  return true;
}

export function Archipelago() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    // requestIdleCallback where it exists: the canvas waits until the main
    // thread has finished with the things the reader actually needs.
    const start = () => setMount(shouldMount());
    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }
    ).requestIdleCallback;

    if (ric) {
      // The timeout: on a page that never idles (continuous animation) the
      // callback would otherwise wait indefinitely.
      const id = ric(start, { timeout: 1500 });
      return () => {
        (
          window as Window & { cancelIdleCallback?: (h: number) => void }
        ).cancelIdleCallback?.(id);
      };
    }

    const t = window.setTimeout(start, 400);
    return () => window.clearTimeout(t);
  }, []);

  // The accessibility panel can turn reduced motion on mid-visit; drop the
  // canvas at once rather than waiting for the next navigation.
  useEffect(() => {
    const onChange = () => {
      if (prefersReduced()) setMount(false);
    };
    window.addEventListener(A11Y_EVENT, onChange);
    return () => window.removeEventListener(A11Y_EVENT, onChange);
  }, []);

  if (!mount) return null;
  return <ArchipelagoCanvas />;
}
