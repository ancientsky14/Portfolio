import { getAllWork, displayClient } from "@/lib/content";
import { Container } from "@/components/site/container";

/**
 * 05 · Coverage — "has he worked outside Metro Manila?"
 *
 * The build plan assigned Magic UI's Dotted Map with pins, plus Number
 * Tickers. Both are deferred, for two different reasons:
 *
 *   · The map needs Philippine geometry, and Phase 5 already samples a
 *     simplified PH GeoJSON for the Archipelago hero. Shipping a second,
 *     unrelated source of the same coastline now guarantees the two
 *     disagree. The map lands in Phase 5, off the same data.
 *   · The tickers need numbers. Every count that belongs here — residents
 *     served, documents tracked, barangays covered — is currently `null` in
 *     content/work/*.mdx. A ticker counting up to an invented figure is the
 *     single fastest way to lose a government buyer.
 *
 * So this section makes the argument in words, which it can do truthfully
 * today, and gains the map and the counters when the material exists.
 *
 * Server Component. No motion — Phase 4 owns that.
 */

export function Coverage() {
  const work = getAllWork();

  return (
    <section className="border-b border-line py-16 sm:py-24">
      <Container width="wide">
        <p className="font-mono text-2xs uppercase tracking-widest text-text-3">
          Coverage
        </p>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <h2 className="max-w-xl text-2xl font-semibold">
              Everything I have shipped runs outside Metro Manila.
            </h2>

            <p className="mt-5 max-w-prose text-text-2">
              That is not a disclaimer. It is the reason the systems are built
              the way they are. A records system for a provincial office is
              designed against a different set of facts than one for a Makati
              startup: the connection drops, the hardware at the counter is
              older than the staff using it, and the budget is a line item that
              was approved a year ago and cannot move.
            </p>

            <p className="mt-4 max-w-prose text-text-2">
              So the pages stay light, the system keeps working through an
              outage and reconciles afterwards, and the hosting is sized to a
              bill the office can actually carry in year three. A vendor who
              has only built for Metro Manila bandwidth finds this out during
              the pilot. I designed for it from the first commit.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-2xs uppercase tracking-widest text-text-3">
              Where the work runs
            </h3>

            <ul className="mt-5 divide-y divide-line border-y border-line">
              {work.map((w, i) => (
                <li key={w.slug} className="flex gap-5 py-5">
                  <span className="font-mono text-2xs tabular-nums text-text-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {displayClient(w)}
                    </p>
                    <p className="mt-1 font-mono text-2xs uppercase tracking-widest text-text-3">
                      {w.sector}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs text-text-3">
              Both institutional engagements are in Region 1. Names appear here
              the day each office clears them in writing.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
