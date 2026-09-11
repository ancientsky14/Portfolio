import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { METHOD } from "@/lib/services";

/**
 * The method row — an intro card and the three phases, joined by dashed
 * connectors, after the reference's "Brewed Method". The phases summarise
 * the four confirmed steps further down the page (#process); every line is
 * in lib/services.ts with its receipt.
 *
 * Server Component. Reveal and tilt come from page-motion.tsx.
 */
export function Method() {
  return (
    <div className="grid gap-3 rounded-lg border border-line bg-surface p-3 shadow-soft sm:p-4 lg:grid-cols-4">
      <div className="flex flex-col justify-center rounded-md bg-accent-soft/40 p-5 sm:p-6">
        <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
          How I work
        </p>
        <p className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-text">
          Scope. Build.
          <span className="block text-text-2">Keep running.</span>
        </p>
        <p className="mt-3 text-sm text-text-2">
          Three phases, in order. The four steps behind them are further down.
        </p>
        <Link
          href="#process"
          className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent"
        >
          The full process
          <ArrowDown size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      <ol data-reveal-group className="contents">
        {METHOD.map((m, i) => {
          const Icon = m.icon;
          return (
            <li key={m.n} className="relative">
              <div
                data-tilt-card
                className="relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface-2 p-5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-2 select-none font-display text-4xl font-extrabold leading-none text-line"
                >
                  {m.n}
                </span>
                <span
                  data-tilt-icon
                  className="grid size-11 place-items-center rounded-md bg-accent-soft text-accent"
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-text">
                  {m.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-2">
                  {m.line}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {m.chips.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-text-2"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              {i < METHOD.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-12 z-10 hidden w-3 items-center lg:flex"
                >
                  <span className="h-px w-full border-t border-dashed border-accent" />
                  <span className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-accent" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}