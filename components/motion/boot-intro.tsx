"use client";

import { useEffect } from "react";
import { SITE } from "@/lib/site";

/**
 * Boot intro — after the reference: on the first visit of a session, a
 * short overlay plays before the site settles in. Three island nodes pop,
 * the cables between them draw, the name rises out of its mask, and then
 * the overlay fades while the rail slides in from the left and the home
 * sections rise.
 *
 * Jan asked for this knowing it trades against the build plan's rule that
 * motion never delays the message. The costs are kept small on purpose:
 *
 *   · first visit per browser session only (sessionStorage "booted")
 *   · ~1.6s end to end; the overlay is `pointer-events: none`, so nothing
 *     underneath is blocked
 *   · never under reduced motion — the OS setting or the site's own panel
 *   · the decision and a 3s failsafe live in the boot script in
 *     app/layout.tsx, which runs before paint: no flash of the site before
 *     the overlay, and no way for a failed bundle to leave it stuck
 *
 * The overlay markup is server-rendered and hidden by CSS unless
 * `html.is-intro` is set, so it is already on screen at first paint. All
 * styling lives in design/tokens.css under "Boot intro".
 */

const OUT_AT = 1150; // overlay starts fading
const DONE_AT = 1650; // classes removed, site fully revealed

export function BootIntro() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("is-intro")) return;

    const out = window.setTimeout(() => html.classList.add("is-intro-out"), OUT_AT);
    const done = window.setTimeout(
      () => html.classList.remove("is-intro", "is-intro-out"),
      DONE_AT,
    );
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
    };
  }, []);

  const words = SITE.name.split(" ");

  return (
    <div aria-hidden="true" className="boot">
      <div className="boot__center">
        <svg viewBox="0 0 120 64" className="boot__mark">
          <path className="boot__cable" d="M22 40 C 40 12, 52 12, 62 26" />
          <path className="boot__cable boot__cable--2" d="M62 26 C 74 44, 86 46, 98 30" />
          <circle className="boot__node" cx="22" cy="40" r="7" />
          <circle className="boot__node boot__node--2" cx="62" cy="26" r="9" />
          <circle className="boot__node boot__node--3 boot__node--sand" cx="98" cy="30" r="5.5" />
        </svg>

        <p className="boot__name">
          {words.map((w, i) => (
            <span key={w} className="boot__word">
              <span
                className="boot__word-in"
                style={{ animationDelay: `${0.32 + i * 0.08}s` }}
              >
                {w}
              </span>
            </span>
          ))}
        </p>
        <p className="boot__role">{SITE.role}</p>
      </div>
    </div>
  );
}
