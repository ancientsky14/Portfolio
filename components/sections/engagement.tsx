import { confirmedSteps } from "@/lib/engagement";
import { Container } from "@/components/site/container";

/**
 * How I work — from first call to the updates after.
 *
 * The section that wins the work: how a project runs, from a signed scope
 * to the updates after launch, told as one developer doing all of it.
 * No ownership or payment terms here (Jan, 2026-09-11).
 *
 * The spine SVG here is drawn in full and static. Phase 4 attaches DrawSVG
 * to `#process-spine` and scrubs `stroke-dashoffset` to scroll — with the
 * reduced-motion branch resetting it to fully drawn, which is exactly the
 * state this file ships.
 *
 * What renders is gated by `confirmed` in lib/engagement.ts. All five steps
 * were confirmed by Jan on 2026-09-11, so the spine renders; with fewer than
 * two confirmed it falls back to a single commitment card.
 *
 * Server Component. No motion — Phase 4 owns that.
 */

export function Engagement() {
  const steps = confirmedSteps();
  const hasSpine = steps.length >= 2;

  return (
    <section id="process" className="border-b border-line py-16 sm:py-24">
      <Container width="wide">
        <p className="font-mono text-2xs uppercase tracking-widest text-text-3">
          How I work
        </p>

        <h2 data-split className="mt-8 max-w-2xl text-2xl font-semibold">
          From first call to the updates after.
        </h2>

        <p className="mt-5 max-w-prose text-text-2">
          One developer from scope to support: you watch it get built, your
          team gets trained, and I stay on for the updates.
        </p>

        {hasSpine ? (
          <ol className="relative mt-14 flex flex-col gap-12 pl-14 sm:pl-20">
            <svg
              className="pointer-events-none absolute left-4 top-2 h-[calc(100%-1rem)] w-px sm:left-7"
              viewBox="0 0 1 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                id="process-spine"
                d="M0.5 0 V100"
                fill="none"
                stroke="var(--line-2)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {steps.map((s) => (
              <li key={s.n} data-reveal className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-14 top-1.5 flex size-8 items-center justify-center rounded-full border border-line-2 bg-ground font-mono text-2xs tabular-nums text-text-3 sm:-left-20"
                >
                  {String(s.n).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 max-w-prose text-text-2">{s.body}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-12 flex flex-col gap-8">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-md border border-line bg-surface p-7 sm:p-10"
              >
                <p className="font-mono text-2xs uppercase tracking-widest text-accent">
                  The commitment
                </p>
                <h3 className="mt-4 max-w-xl text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-prose text-lg text-text-2">{s.body}</p>
              </div>
            ))}

          </div>
        )}
      </Container>
    </section>
  );
}
