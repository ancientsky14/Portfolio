"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  Layers,
  MonitorSmartphone,
  MousePointerClick,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolIcon } from "@/components/icons/tool-icon";

/**
 * The work gallery — after the reference's Projects page: filter pills, a
 * framed grid of project cards, and "click a card to open it" into a
 * full-screen viewer.
 *
 * The viewer:
 *   · opens over everything (portal), springs in, locks the page scroll —
 *     on desktop that means the panel (`data-fixed`), below lg the window
 *   · closes on Escape, on the close button, or on a backdrop click, and
 *     returns focus to the card that opened it
 *   · ← / → and the Prev / Next buttons move between projects; on touch a
 *     horizontal swipe does the same
 *   · traps Tab inside itself while open
 *   · `data-lenis-prevent` stops smooth scroll from moving the page behind
 *
 * Screenshots come from public/work/<slug>/ via lib/shots.ts. There are none
 * yet, so both the card and the viewer show a composed title panel instead
 * of an empty browser frame. Nothing here claims more than the frontmatter.
 */

export type GalleryItem = {
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  client: string;
  sector?: string;
  role?: string;
  year?: number;
  platform?: string;
  status?: string;
  version?: string;
  stack: string[];
  metrics: { label: string; value: string | number }[];
  shots: string[];
};

const PLATFORM_ICON: Record<string, LucideIcon> = {
  Desktop: MonitorSmartphone,
  Web: CodeXml,
  Platform: Layers,
};

/** "Next.js 16" → "Next.js", so a versioned stack entry finds its mark. */
const bare = (s: string) => s.replace(/\s+\d+(\.\d+)*$/, "");

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Badges({ it }: { it: GalleryItem }) {
  const live = it.status ? !/develop/i.test(it.status) : false;
  const Icon = it.platform ? PLATFORM_ICON[it.platform] : null;
  const pill =
    "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-text";
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {it.platform && Icon ? (
        <li className={pill}>
          <Icon size={13} strokeWidth={1.75} aria-hidden="true" className="text-accent" />
          {it.platform}
        </li>
      ) : null}
      {it.status ? (
        <li className={pill}>
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", live ? "bg-ok" : "bg-line-2")}
          />
          {it.status}
        </li>
      ) : null}
      {it.version ? (
        <li className={cn(pill, "font-mono")}>v{it.version}</li>
      ) : null}
    </ul>
  );
}

/** The no-screenshot state: a composed panel, never an empty frame. */
function TitlePanel({ it, large }: { it: GalleryItem; large?: boolean }) {
  const Icon = it.platform ? PLATFORM_ICON[it.platform] : Layers;
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-md bg-text text-ground",
        large ? "min-h-72 p-7 sm:p-10" : "min-h-36 p-5",
      )}
    >
      <Icon
        size={large ? 28 : 20}
        strokeWidth={1.5}
        aria-hidden="true"
        className="opacity-70"
      />
      <div>
        <p
          className={cn(
            "font-display font-bold tracking-tight",
            large ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {it.title}
        </p>
        <ul aria-hidden="true" className="mt-4 flex flex-wrap gap-3 opacity-80">
          {it.stack.slice(0, large ? 6 : 4).map((s) => (
            <li key={s}>
              <ToolIcon name={bare(s)} size={large ? 18 : 15} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A screenshot inside a browser-window frame. */
function Framed({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface-2 shadow-soft">
      <div aria-hidden="true" className="flex gap-1.5 px-3 py-2">
        <span className="size-2 rounded-full bg-line-2" />
        <span className="size-2 rounded-full bg-line-2" />
        <span className="size-2 rounded-full bg-line-2" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full" />
    </div>
  );
}

function Viewer({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const it = items[index];
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const swipeX = useRef<number | null>(null);
  const [shot, setShot] = useState(0);

  const go = useCallback(
    (d: number) => {
      setShot(0);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  // Lock whatever scrolls: the panel on desktop, the window below lg.
  useEffect(() => {
    const html = document.documentElement;
    const panel = document.getElementById("panel");
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    panel?.setAttribute("data-fixed", "true");
    closeBtn.current?.focus();
    return () => {
      html.style.overflow = prev;
      panel?.removeAttribute("data-fixed");
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "Tab" && dialog.current) {
        const f = Array.from(
          dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const titleId = `viewer-${it.slug}`;
  const prevItem = items[(index - 1 + items.length) % items.length];
  const nextItem = items[(index + 1) % items.length];

  return createPortal(
    <div
      data-lenis-prevent
      className="gallery-modal fixed inset-0 z-[70] grid place-items-center bg-text/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="gallery-modal__stage relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") swipeX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeX.current === null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* bar */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-line-2" />
              <span className="size-2.5 rounded-full bg-line-2" />
              <span className="size-2.5 rounded-full bg-line-2" />
            </span>
            <span className="font-mono text-2xs uppercase tracking-widest tabular-nums text-text-3">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
          </div>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border border-line text-text-2 transition-transform duration-300 ease-(--ease-out) hover:rotate-90 hover:border-accent hover:text-text"
          >
            <X size={17} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* body */}
        <div className="grid min-h-0 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
          <div className="min-w-0">
            {it.shots.length ? (
              <>
                <Framed
                  src={it.shots[shot]}
                  alt={`${it.title} — screenshot ${shot + 1} of ${it.shots.length}`}
                />
                {it.shots.length > 1 ? (
                  <div className="mt-3 flex justify-center gap-2">
                    {it.shots.map((s, i) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setShot(i)}
                        aria-label={`Screenshot ${i + 1}`}
                        aria-pressed={shot === i}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          shot === i ? "w-6 bg-accent" : "w-2 bg-line-2",
                        )}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <TitlePanel it={it} large />
            )}
          </div>

          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-2xl font-bold tracking-tight">
              {it.title}
            </h2>
            {it.subtitle ? (
              <p className="mt-1 text-text-2">{it.subtitle}</p>
            ) : null}
            <div className="mt-4">
              <Badges it={it} />
            </div>
            {it.summary ? (
              <p className="mt-5 text-sm leading-relaxed text-text-2">
                {it.summary}
              </p>
            ) : null}

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 text-sm">
              <div className="col-span-2">
                <dt className="font-mono text-2xs uppercase tracking-widest text-text-3">
                  Client
                </dt>
                <dd className="mt-1 text-text">{it.client}</dd>
              </div>
              {it.role ? (
                <div className="col-span-2">
                  <dt className="font-mono text-2xs uppercase tracking-widest text-text-3">
                    Role
                  </dt>
                  <dd className="mt-1 text-text">{it.role}</dd>
                </div>
              ) : null}
              {it.year ? (
                <div>
                  <dt className="font-mono text-2xs uppercase tracking-widest text-text-3">
                    Year
                  </dt>
                  <dd className="mt-1 tabular-nums text-text">{it.year}</dd>
                </div>
              ) : null}
              {it.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="font-mono text-2xs uppercase tracking-widest text-text-3">
                    {m.label}
                  </dt>
                  <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-text">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-5 flex flex-wrap gap-1.5">
              {it.stack.map((s) => (
                <li
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pl-2 pr-2.5 font-mono text-2xs text-text-2"
                >
                  <ToolIcon name={bare(s)} size={11} />
                  {s}
                </li>
              ))}
            </ul>

            <Link
              href={`/work/${it.slug}`}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-text py-2.5 pl-5 pr-4 text-sm font-semibold text-ground transition-opacity hover:opacity-90"
            >
              Read the full case study
              <ArrowUpRight
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-300 ease-(--ease-out) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* prev / next */}
        {items.length > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-text-2 transition-colors hover:text-text"
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
              <span className="truncate">{prevItem.title}</span>
            </button>
            <p className="hidden font-mono text-2xs uppercase tracking-widest text-text-3 sm:block">
              ← → to browse · Esc to close
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-text-2 transition-colors hover:text-text"
            >
              <span className="truncate">{nextItem.title}</span>
              <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function WorkGallery({ items }: { items: GalleryItem[] }) {
  const platforms = [
    "All",
    ...Array.from(
      new Set(items.map((i) => i.platform).filter((p): p is string => !!p)),
    ),
  ];
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const opener = useRef<number | null>(null);

  const shown =
    filter === "All" ? items : items.filter((i) => i.platform === filter);

  const close = useCallback(() => setOpen(null), []);

  // Give focus back to the card that opened the viewer.
  useEffect(() => {
    if (open === null && opener.current !== null) {
      cards.current[opener.current]?.focus();
      opener.current = null;
    }
  }, [open]);

  return (
    <>
      <div
        role="group"
        aria-label="Filter by platform"
        className="flex flex-wrap gap-2"
      >
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={filter === p}
            onClick={() => {
              setFilter(p);
              setOpen(null);
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === p
                ? "border-text bg-text text-ground"
                : "border-line bg-surface text-text-2 hover:border-accent hover:text-text",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="frame relative mt-8 p-3 pt-6 sm:p-4 sm:pt-7">
        <p
          aria-hidden="true"
          className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 font-mono text-2xs font-semibold uppercase tracking-widest text-text shadow-soft"
        >
          <MousePointerClick size={13} strokeWidth={2} className="text-accent" />
          Click a card to open it
        </p>

        <ul
          data-reveal-group
          data-reveal-depth
          className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((it, i) => {
            const Icon = it.platform ? PLATFORM_ICON[it.platform] : Layers;
            return (
              <li
                key={it.slug}
                className={i === 0 ? "md:col-span-2" : undefined}
              >
                <button
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  type="button"
                  data-spotlight
                  data-tilt-card
                  aria-haspopup="dialog"
                  onClick={() => {
                    opener.current = i;
                    setOpen(i);
                  }}
                  className="group flex h-full w-full flex-col rounded-lg border border-line bg-surface p-5 text-left shadow-soft transition-colors hover:border-accent sm:p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span data-tilt-icon className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-ink">
                        <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="font-display text-base font-bold uppercase tracking-wider text-text transition-colors group-hover:text-accent">
                        {it.title}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0 text-text-3 transition-all duration-300 ease-(--ease-out) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>

                  {it.subtitle ? (
                    <span className="mt-3 block text-sm leading-relaxed text-text-2">
                      {it.subtitle}
                    </span>
                  ) : null}

                  <span className="mt-4 block">
                    <Badges it={it} />
                  </span>

                  <span className="mt-5 block flex-1">
                    {it.shots[0] ? (
                      <Framed src={it.shots[0]} alt="" />
                    ) : (
                      <TitlePanel it={it} />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {open !== null && shown[open] ? (
        <Viewer
          items={shown}
          index={open}
          onIndex={(i) => setOpen(i)}
          onClose={close}
        />
      ) : null}
    </>
  );
}
