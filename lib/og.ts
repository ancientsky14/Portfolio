import type { Metadata } from "next";
import { getWorkSlugs } from "@/lib/content";
import { getLabSlugs } from "@/lib/lab";
import { SITE } from "@/lib/site";

/**
 * Share cards — the image a link shows when it is pasted into Messenger,
 * Viber, LinkedIn or Facebook.
 *
 * Rendered by app/og/[card]/route.tsx at build time into real files:
 * out/og/site.png, out/og/work-<slug>.png, out/og/lab-<slug>.png.
 *
 * Why not the `opengraph-image.tsx` file convention (the first plan): a
 * static export writes those as extensionless files (out/opengraph-image),
 * which GitHub Pages serves as application/octet-stream, and Facebook's
 * crawler rejects an og:image with that content type. The convention under
 * app/work/[slug]/ also cannot receive `slug` in a static export. A
 * force-static GET route whose param ends in `.png` gives the file its
 * extension — and so its content type.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Every card the build renders, as the route's `[card]` segment. */
export function ogCardIds(): string[] {
  return [
    "site",
    ...getWorkSlugs().map((s) => `work-${s}`),
    ...getLabSlugs().map((s) => `lab-${s}`),
  ];
}

/** The card's URL, relative to metadataBase (SITE.url, /portfolio included). */
export function ogImageUrl(id: string): string {
  return `/og/${id}.png`;
}

/**
 * `openGraph` for a page with its own card.
 *
 * Next replaces a parent's `openGraph` rather than merging into it, so a
 * page that sets its image has to repeat the site-wide fields — they live
 * here once. Pages without a card of their own set nothing and inherit the
 * site card from app/layout.tsx.
 *
 * No title or description: Next fills og:title, og:description and the
 * twitter:* tags from each page's own `title` and `description` when this
 * object leaves them out. Set them here and every page inheriting the site
 * card would share the home page's.
 */
export function openGraphFor(
  id: string,
  alt: string,
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: "en_PH",
    siteName: SITE.name,
    images: [{ url: ogImageUrl(id), ...OG_SIZE, alt, type: "image/png" }],
  };
}
