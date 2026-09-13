"use client";

import { useEffect, useRef, useState } from "react";
import { A11Y_EVENT, prefersReduced } from "@/lib/a11y";

/**
 * A case-study screen recording — muted, looping, inline.
 *
 * It plays only while at least a quarter of it is on screen, and never:
 *   · under reduced motion (the OS setting or the site's panel)
 *   · with Save-Data on, or on a 2g connection
 * In those cases the video source is never even attached, so nothing
 * downloads: the poster is the whole preview. `preload="none"` keeps it
 * out of the LCP budget on every device.
 */

type Connection = { saveData?: boolean; effectiveType?: string };

function mayPlay(): boolean {
  if (prefersReduced()) return false;
  const c = (navigator as Navigator & { connection?: Connection }).connection;
  if (c?.saveData) return false;
  if (c?.effectiveType && ["slow-2g", "2g"].includes(c.effectiveType))
    return false;
  return true;
}

export function LoopVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const update = () => setAllowed(mayPlay());
    update();
    window.addEventListener(A11Y_EVENT, update);
    return () => window.removeEventListener(A11Y_EVENT, update);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!allowed) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);

    // A hidden tab keeps decoding in some browsers. Stop, and pick up again
    // on return — the page behind this one is already busy (Lenis, GSAP and
    // the background canvas), and decode competes with all three.
    const onVisibility = () => {
      if (document.hidden) v.pause();
      else if (allowed) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [allowed]);

  return (
    <video
      ref={ref}
      src={allowed ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="none"
      aria-label={label}
      className="size-full object-cover object-top"
    />
  );
}
