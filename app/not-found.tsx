import Link from "next/link";
import { Compass } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";

/**
 * 404. On GitHub Pages this is also what a mistyped path or a stale link
 * lands on, so it offers the three places a visitor was most likely trying
 * to reach rather than only "home".
 */

const WAYS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "The work" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70dvh] flex-col justify-center overflow-hidden px-5 py-24 sm:px-8 lg:px-12">
      <DotPattern id="notfound-dots" />

      <span className="grid size-12 place-items-center rounded-md border border-glass-line bg-accent-soft text-accent">
        <Compass size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>

      <p className="mt-8 font-mono text-2xs uppercase tracking-widest text-text-3">
        404
      </p>
      <h1 data-split className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight">
        That page isn&rsquo;t here.
      </h1>
      <p className="mt-4 max-w-xl text-text-2">
        It may have moved, or it may never have existed. One of these is
        probably what you were after.
      </p>

      <ul className="mt-8 flex flex-wrap gap-3">
        {WAYS.map((w, i) => (
          <li key={w.href}>
            <Link
              href={w.href}
              className={
                i === 0
                  ? "inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
                  : "inline-block rounded-full border border-line-2 px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent"
              }
            >
              {w.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
