import type { Metadata } from "next";
import { getAllWork, displayClient, realMetrics } from "@/lib/content";
import { shotsFor } from "@/lib/shots";
import { liveLinks } from "@/lib/live";
import { WorkGallery, type GalleryItem } from "@/components/work/work-gallery";
import { DotPattern } from "@/components/ui/dot-pattern";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Software I have designed, built and shipped — a desktop app, web platforms and an open-source platform.",
};

/**
 * Work — after the reference's Projects page: filter pills, a framed grid,
 * and "click a card to open it" into a full-screen viewer
 * (components/work/work-gallery.tsx).
 *
 * The data is resolved here, on the server, at build time: client names go
 * through displayClient() and metrics through realMetrics(), so the client
 * component receives only what is allowed to be shown. The MDX body is not
 * passed down — the viewer links to /work/<slug> for that.
 */

export default function WorkIndex() {
  const items: GalleryItem[] = getAllWork().map((w) => ({
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle,
    summary: w.summary,
    client: displayClient(w),
    sector: w.sector,
    role: w.role,
    year: w.year,
    platform: w.platform,
    status: w.status,
    version: w.version,
    stack: w.stack ?? [],
    metrics: realMetrics(w).map((m) => ({
      label: m.label,
      value: m.value as string | number,
    })),
    shots: shotsFor(w.slug),
    // Cleared links only, staff/admin hosts already dropped (lib/live.ts).
    live: liveLinks(w).map((l) => ({
      label: l.label,
      href: l.href,
      kind: l.kind,
    })),
  }));

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <DotPattern id="work-dots" />

        <p className="font-mono text-2xs uppercase tracking-widest text-accent">
          Work
        </p>
        <h1 data-split className="mt-6 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Four products, built end to end.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-text-2">
          A desktop app, two web platforms and an open-source platform. Open a
          card for the details, or read the full case study behind it.
        </p>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <WorkGallery items={items} />
      </section>
    </>
  );
}
