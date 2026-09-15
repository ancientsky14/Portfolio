"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PALETTE_EVENT, type SearchEntry } from "@/lib/search";

/**
 * Opens the command palette — Ctrl+K / ⌘K anywhere, or a search button
 * (components/shell/search-button.tsx) through PALETTE_EVENT.
 *
 * Only this listener is in the first-load bundle. The palette itself is
 * fetched the first time it opens: R9b measured the page's startup as the
 * site's slowest part, so nothing a visitor has not asked for loads with it.
 * Mounted once in app/layout.tsx inside <Optional>, with the index built at
 * build time (lib/search-index.ts).
 */

const CommandPalette = dynamic(() => import("./command-palette"), { ssr: false });

export function SearchLauncher({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, show);
    };
  }, [open]);

  if (!open) return null;
  return (
    <CommandPalette
      entries={entries}
      onClose={() => {
        setOpen(false);
        // Back to whatever had focus — the search button, or the page.
        opener.current?.focus?.();
      }}
    />
  );
}
