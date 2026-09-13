"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

/**
 * GoatCounter — the visit count behind the rail's "1,234 visits".
 *
 * GitHub Pages runs no server, so the count lives with GoatCounter (Jan's
 * choice, 2026-09-13): free, no cookies, no personal data, bots filtered.
 * Mounted once in app/layout.tsx.
 *
 *   · Nothing loads while SITE.goatcounter is null — no script, no request.
 *   · count.js counts the first page load itself. Pages after that change
 *     without a reload (next/link), so each route change is counted here.
 *   · count.js ignores localhost by default, so dev visits never count.
 *   · afterInteractive: it never competes with the page's first paint.
 */

type GoatCounterApi = {
  count?: (vars: { path?: string; title?: string }) => void;
};

export function GoatCounter() {
  const code = SITE.goatcounter;
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!code) return;
    // The initial load is count.js's own; only later navigations are ours.
    if (first.current) {
      first.current = false;
      return;
    }
    const gc = (window as Window & { goatcounter?: GoatCounterApi }).goatcounter;
    gc?.count?.({
      path: window.location.pathname + window.location.search,
      title: document.title,
    });
  }, [pathname, code]);

  if (!code) return null;

  return (
    <Script
      data-goatcounter={`https://${code}.goatcounter.com/count`}
      src="https://gc.zgo.at/count.js"
      strategy="afterInteractive"
    />
  );
}
