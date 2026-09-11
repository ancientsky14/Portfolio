"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReduced } from "@/lib/a11y";

/**
 * Cursor ring — after the reference: a ring that trails the pointer, grows
 * over anything clickable, and shows a label ("Open") over elements that
 * carry `data-cursor="…"`.
 *
 * "Smooth Cursor" is on this project's kill list; Jan asked for the
 * reference's ring anyway (2026-09-11). It is written here rather than
 * installed, and kept honest:
 *
 *   · the native cursor is never hidden — the ring is an accent, not a
 *     replacement, so precision and accessibility are untouched
 *   · fine pointers only: on touch it never mounts
 *   · under reduced motion it follows instantly instead of trailing
 *   · it hides when the pointer leaves the window
 *
 * Position is GSAP (`quickTo`, transform only); size and label are CSS
 * transitions keyed off `data-state`, in design/tokens.css.
 */

export function CursorRing() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ring.current;
    const lab = label.current;
    if (!el || !lab) return;

    el.hidden = false;
    el.dataset.state = "gone";

    const dur = prefersReduced() ? 0 : 0.35;
    const x = gsap.quickTo(el, "x", { duration: dur, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: dur, ease: "power3.out" });

    function move(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      if (el!.dataset.state === "gone") el!.dataset.state = "";
      x(e.clientX);
      y(e.clientY);
    }

    function over(e: PointerEvent) {
      const t = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button'], input, textarea, select, label",
      );
      const text = t?.dataset.cursor ?? "";
      lab!.textContent = text;
      el!.dataset.state = !t ? "" : text ? "label" : "hover";
    }

    function hide() {
      el!.dataset.state = "gone";
    }

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);

    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", hide);
      el.hidden = true;
    };
  }, []);

  return (
    <div ref={ring} hidden aria-hidden="true" className="cursor-ring">
      <span ref={label} className="cursor-ring__label" />
    </div>
  );
}
