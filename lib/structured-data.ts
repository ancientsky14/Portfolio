import type { WorkDoc } from "@/lib/content";
import type { LabDoc } from "@/lib/lab";
import { liveLinks } from "@/lib/live";
import { ogImageUrl } from "@/lib/og";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

/**
 * Search-engine data (JSON-LD) — schema.org descriptions of Jan, the case
 * studies and the lab notes, rendered by components/site/json-ld.tsx.
 *
 * The rule is the site's: only facts already on the page. No ratings, no
 * reviews, no prices, and a client or a live link only through the gates
 * that decide whether the page shows them (displayClient, liveLinks).
 *
 * Case studies are `CreativeWork`, not `SoftwareApplication`. Google's
 * Software App rich result *requires* `offers.price` and a rating or review;
 * without them the Rich Results Test reports the item as invalid, and the
 * site cannot truthfully supply either — no reviews exist, and payment terms
 * are never stated (CLAUDE.md). A case study is a written work about a
 * project, which is what `CreativeWork` says.
 */

export type JsonLd = Record<string, unknown>;

/** Absolute URL of a site path, trailing slash as the export serves it. */
function pageUrl(route: string): string {
  return `${SITE.url}${route}/`;
}

const PERSON_ID = `${SITE.url}/#person`;

/** A reference to the Person in app/layout.tsx, named so it stands alone. */
const AUTHOR = { "@type": "Person", "@id": PERSON_ID, name: SITE.name };

export function personLd(avatar: string | null): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    url: pageUrl(""),
    email: SITE.email,
    jobTitle: SITE.role,
    // avatarSrc() already carries the basePath, so resolve it against the
    // origin rather than appending it to SITE.url.
    ...(avatar ? { image: new URL(avatar, SITE.url).href } : {}),
    sameAs: SOCIALS.map((s) => s.href),
    // "Built in the Philippines" (footer), "Based in the Philippines" (About).
    address: { "@type": "PostalAddress", addressCountry: "PH" },
  };
}

export function caseStudyLd(w: WorkDoc): JsonLd {
  const live = liveLinks(w)[0];
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: w.title,
    ...(w.fullName ? { alternateName: w.fullName } : {}),
    ...(w.subtitle ? { headline: w.subtitle } : {}),
    ...(w.summary ? { description: w.summary } : {}),
    url: pageUrl(`/work/${w.slug}`),
    image: `${SITE.url}${ogImageUrl(`work-${w.slug}`)}`,
    author: AUTHOR,
    ...(w.year ? { dateCreated: String(w.year) } : {}),
    ...(w.stack?.length ? { keywords: w.stack.join(", ") } : {}),
    // What the case study is about: the system itself, linked only when
    // liveLinks() has cleared it for the page.
    about: {
      "@type": "Thing",
      name: w.fullName ?? w.title,
      ...(live ? { url: live.href } : {}),
    },
  };
}

export function labNoteLd(e: LabDoc): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: e.title,
    ...(e.subtitle ? { alternativeHeadline: e.subtitle } : {}),
    description: e.blurb,
    url: pageUrl(`/lab/${e.slug}`),
    image: `${SITE.url}${ogImageUrl(`lab-${e.slug}`)}`,
    author: AUTHOR,
    inLanguage: "en",
    ...(e.stack?.length ? { keywords: e.stack.join(", ") } : {}),
  };
}

/**
 * JSON for a <script type="application/ld+json">. JSON.stringify does not
 * escape `<`, so a `</script>` inside any string would end the tag early —
 * the escape Next's JSON-LD guide recommends.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
