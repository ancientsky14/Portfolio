import { getAllWork, displayClient } from "@/lib/content";
import { Container } from "@/components/site/container";

/**
 * Built for — who each project was for, as cards in a frame.
 *
 * Each card is labelled "Client" (or "Own product") and the year: no
 * sector labels here (Jan, 2026-09-11 — lead as a developer, not a
 * government niche). Names go through displayClient(), so any client
 * still `clientCleared: false` stays anonymous with no code change.
 *
 * The cards sit on a solid surface inside a frame, so the background point
 * cloud never runs through the text.
 *
 * Server Component. Reveal comes from page-motion.tsx.
 */
export function ProofStrip() {
  const work = getAllWork();

  return (
    <section className="border-b border-line py-14 sm:py-16">
      <Container width="wide">
        <div className="frame p-3 sm:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-2 pb-4 pt-1">
            <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
              Built for
            </p>
            <p className="text-sm text-text-2">
              Named with each client&rsquo;s permission. Yours would be too.
            </p>
          </div>

          <ul
            data-reveal-group
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {work.map((w) => {
              const own = w.client === "Own product";
              return (
                <li
                  key={w.slug}
                  className="flex flex-col rounded-lg border border-line bg-surface p-5 shadow-soft"
                >
                  <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
                    {own ? "Own product" : "Client"}
                    {w.year ? (
                      <span className="tabular-nums text-text-3"> · {w.year}</span>
                    ) : null}
                  </p>

                  <p className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-text">
                    {own ? w.title : displayClient(w)}
                  </p>
                  {!own ? (
                    <p className="mt-1 text-sm font-semibold text-accent">
                      {w.title}
                    </p>
                  ) : null}

                  {w.subtitle ? (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-2">
                      {w.subtitle}
                    </p>
                  ) : null}

                  {w.stack?.length ? (
                    <p className="mt-4 font-mono text-2xs text-text-3">
                      {w.stack.slice(0, 3).join(" · ")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}