import Link from "next/link";
import { Check } from "lucide-react";
import { SERVICES, type Service } from "@/lib/services";
import { ToolIcon } from "@/components/icons/tool-icon";

/**
 * "What I can do for you" — five cards, after the reference: the tools in
 * their own colours, a count, a title, one line, a badge and three checks.
 * Each check is backed by the case study the card links to (receipts in
 * lib/services.ts). Maintenance has no single case study, so it is the one
 * card that does not link.
 *
 * Server Component. Reveal, tilt and the background's lean come from
 * page-motion.tsx (data-reveal-group, data-tilt-card).
 */

function Body({ s, i }: { s: Service; i: number }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface p-1 shadow-soft">
          {s.tools.map((t) => (
            <span
              key={t}
              title={t}
              className="grid size-8 place-items-center rounded-sm bg-surface-2"
            >
              <ToolIcon name={t} size={17} brand />
            </span>
          ))}
        </span>
        <span className="font-mono text-2xs font-semibold tabular-nums text-accent">
          {String(i + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-5 font-display text-base font-bold uppercase tracking-wider text-text transition-colors group-hover:text-accent">
        {s.title}
      </h3>
      <p className="mt-1.5 text-sm text-text-2">{s.line}</p>

      <span className="mt-4 inline-flex w-fit rounded-full border border-line bg-accent-soft px-3 py-1 font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
        {s.badge}
      </span>

      <ul className="mt-4 flex flex-col gap-2">
        {s.checks.map((c) => (
          <li key={c} className="flex gap-2 text-sm text-text">
            <Check
              size={15}
              strokeWidth={2.25}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            />
            {c}
          </li>
        ))}
      </ul>
    </>
  );
}

const CARD =
  "group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-soft transition-colors hover:border-accent";

export function ServiceCards() {
  return (
    <div className="mt-10 sm:mt-12">
      <h2 className="text-center font-display text-xl font-bold tracking-tight text-text">
        What I can do for you.{" "}
        <span className="font-sans text-base font-normal text-text-2">
          Pick one or stack a few.
        </span>
      </h2>

      <ul
        data-reveal-group
        className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
      >
        {SERVICES.map((s, i) => (
          <li key={s.name}>
            {s.href ? (
              <Link href={s.href} data-spotlight data-tilt-card className={CARD}>
                <Body s={s} i={i} />
              </Link>
            ) : (
              <div data-spotlight data-tilt-card className={CARD}>
                <Body s={s} i={i} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}