"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchEntries, type SearchEntry, type SearchGroup } from "@/lib/search";

/**
 * The command palette (Phase 4). Loaded on first open by
 * components/shell/search-launcher.tsx — never in first-load JS.
 *
 * One text field over ~30 entries, grouped. The field is an ARIA combobox
 * that owns a listbox, so a screen reader hears the highlighted result as
 * the arrow keys move it while typing continues — the pattern in the
 * WAI-ARIA Authoring Practices. Keys: ↑/↓ move, Enter opens, Esc closes.
 * Tab stays in the field: the dialog has nothing else to reach.
 *
 * Like the work viewer (components/work/work-gallery.tsx): a portal over
 * everything, the scroller locked — the panel on desktop, the window below
 * lg — `data-lenis-prevent` on the list, focus returned on close (by the
 * launcher). Motion is the backdrop fade the viewer uses; under reduced
 * motion the global rule in design/tokens.css makes it instant.
 */

const GROUPS: SearchGroup[] = ["Pages", "Work", "Lab", "Services", "Actions"];

export default function CommandPalette({
  entries,
  onClose,
}: {
  entries: SearchEntry[];
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const uid = useId();

  const results = useMemo(() => searchEntries(entries, query), [entries, query]);
  // With a query, the best match leads regardless of group; without one,
  // the site's own order, grouped.
  const grouped = useMemo(
    () =>
      query.trim()
        ? [{ group: null as SearchGroup | null, items: results }]
        : GROUPS.map((g) => ({ group: g, items: results.filter((r) => r.group === g) })).filter(
            (g) => g.items.length,
          ),
    [results, query],
  );
  const flat = grouped.flatMap((g) => g.items);
  const optionId = (e: SearchEntry) => `${uid}-${e.id}`.replace(/[^\w-]/g, "_");

  // Lock whatever scrolls, focus the field.
  useEffect(() => {
    const html = document.documentElement;
    const panel = document.getElementById("panel");
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    panel?.setAttribute("data-fixed", "true");
    input.current?.focus();
    return () => {
      html.style.overflow = prev;
      panel?.removeAttribute("data-fixed");
    };
  }, []);

  // Keep the highlighted option in view.
  useEffect(() => {
    const el = flat[active] && document.getElementById(optionId(flat[active]));
    el?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, query]);

  function go(e: SearchEntry | undefined) {
    if (!e) return;
    onClose();
    if (e.external) {
      if (e.href.startsWith("https://")) window.open(e.href, "_blank", "noopener,noreferrer");
      else window.location.href = e.href;
      return;
    }
    const current = pathname.replace(/\/$/, "") || "/";
    if (e.href !== current) router.push(e.href);
  }

  function onKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!flat.length) return;
      const d = ev.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + d + flat.length) % flat.length);
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      go(flat[active]);
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      onClose();
    } else if (ev.key === "Tab") {
      ev.preventDefault();
    }
  }

  let index = -1;

  return createPortal(
    <div
      className="gallery-modal fixed inset-0 z-80 flex items-start justify-center bg-text/60 px-3 pt-16 backdrop-blur-sm sm:px-6 sm:pt-24"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-text-3" />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-autocomplete="list"
            aria-activedescendant={flat[active] ? optionId(flat[active]) : undefined}
            aria-label="Search pages, work, lab notes and services"
            placeholder="Search pages, work, notes…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            className="h-14 w-full bg-transparent text-base text-text placeholder:text-text-3 focus:shadow-none"
          />
          <kbd className="hidden shrink-0 rounded-sm border border-line px-1.5 py-0.5 font-mono text-2xs text-text-3 sm:block">
            Esc
          </kbd>
        </div>

        <div
          id={`${uid}-list`}
          role="listbox"
          aria-label="Results"
          data-lenis-prevent
          className="overflow-y-auto overscroll-contain p-2"
        >
          {grouped.map(({ group, items }) => (
            <div key={group ?? "results"} role="group" aria-label={group ?? "Best matches"}>
              {group ? (
                <p
                  aria-hidden="true"
                  className="px-3 pb-1 pt-3 font-mono text-2xs uppercase tracking-widest text-text-3"
                >
                  {group}
                </p>
              ) : null}
              {items.map((e) => {
                index += 1;
                const i = index;
                const on = i === active;
                return (
                  <div
                    key={e.id}
                    id={optionId(e)}
                    role="option"
                    aria-selected={on}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(e)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5",
                      on ? "bg-accent-soft text-text" : "text-text-2",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text">
                        {e.title}
                        {!group ? (
                          <span className="ml-2 font-mono text-2xs font-normal uppercase tracking-widest text-text-3">
                            {e.group}
                          </span>
                        ) : null}
                      </span>
                      {e.hint ? (
                        // text-3 on the highlighted row is 4.04:1 in dark
                        // (accent-soft) — under AA. text-2 there instead.
                        <span
                          className={cn(
                            "block truncate text-xs",
                            on ? "text-text-2" : "text-text-3",
                          )}
                        >
                          {e.hint}
                        </span>
                      ) : null}
                    </span>
                    {e.external ? (
                      <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-text-3" />
                    ) : on ? (
                      <CornerDownLeft size={15} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          {!flat.length ? (
            <p className="px-3 py-6 text-center text-sm text-text-3">
              Nothing matches “{query.trim()}”.
            </p>
          ) : null}
        </div>

        <p aria-live="polite" className="sr-only">
          {query.trim() ? `${flat.length} result${flat.length === 1 ? "" : "s"}` : ""}
        </p>
      </div>
    </div>,
    document.body,
  );
}
