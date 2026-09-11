"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { BG_EVENT } from "@/lib/motion";

/**
 * "Watch it assemble" — replays the Archipelago's resolve on demand.
 *
 * It sends the same two window events the page transitions send (BG_EVENT
 * in lib/motion.ts): scatter, then gather once the field has loosened. It
 * imports nothing from the canvas, so `three` stays out of this bundle.
 *
 * Shown only while the canvas is actually mounted: archipelago-canvas.tsx
 * sets `data-archipelago="live"` on <html>, and `.bg-live-only` in
 * design/tokens.css keeps this hidden otherwise. Under reduced motion,
 * without WebGL or on Save-Data there is no canvas, so there is no button —
 * a control that does nothing is worse than none.
 */

const HOLD_MS = 1200;

export function BgReplay() {
  const [busy, setBusy] = useState(false);
  const timer = useRef(0);

  function replay() {
    if (busy) return;
    setBusy(true);
    window.dispatchEvent(new CustomEvent(BG_EVENT.scatter, { detail: null }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(BG_EVENT.gather, { detail: null }));
      setBusy(false);
    }, HOLD_MS);
  }

  return (
    <button
      type="button"
      onClick={replay}
      disabled={busy}
      data-magnetic
      className="bg-live-only items-center gap-2 rounded-full bg-text py-2.5 pl-4 pr-5 text-sm font-semibold text-ground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      <RotateCcw
        size={15}
        strokeWidth={2}
        aria-hidden="true"
        className={busy ? "animate-spin [animation-direction:reverse]" : ""}
      />
      {busy ? "Assembling…" : "Watch it assemble"}
    </button>
  );
}
