"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

/**
 * "1,234 visits" beside the handle in the rail, after the reference shell.
 *
 * Read from GoatCounter's public total (components/analytics/goatcounter.tsx
 * does the counting): unique visitors, bots filtered. The number is real or
 * it is not shown — until it arrives, and whenever it cannot (no code set,
 * the setting off, a blocker, offline), this renders nothing and the line
 * reads just "@ancientsky14". It replaced the role on that line at Jan's
 * request (2026-09-13). Never a placeholder figure.
 *
 * GoatCounter caches the total for up to four hours, so it moves a few times
 * a day. It is read once per visit and kept for 30 minutes in sessionStorage,
 * so moving between pages never refetches it.
 */

const KEY = "visit-count";
const FRESH_MS = 30 * 60 * 1000;

/** Renders " · 1,234 visits" (separator included), or nothing. */
export function VisitCount() {
  const code = SITE.goatcounter;
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    try {
      const cached = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as
        | { value: string; at: number }
        | null;
      if (cached && Date.now() - cached.at < FRESH_MS) {
        setCount(cached.value);
        return;
      }
    } catch {
      // Storage blocked or unreadable — fetch instead.
    }

    const ctrl = new AbortController();
    fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`, {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { count?: string }) => {
        // `count` arrives pre-formatted ("1,234" or "1 234"): keep the digits.
        // A missing count is not zero — show nothing rather than "0".
        const digits = String(j.count ?? "").replace(/\D/g, "");
        if (!digits) return;
        const value = Number(digits).toLocaleString("en-PH");
        setCount(value);
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
        } catch {
          // Not cached this time; nothing else depends on it.
        }
      })
      .catch(() => {});

    return () => ctrl.abort();
  }, [code]);

  if (count === null) return null;
  return (
    <>
      {" · "}
      <span className="font-semibold text-text-2">
        {count} visit{count === "1" ? "" : "s"}
      </span>
    </>
  );
}
