/**
 * Site-level constants that appear in more than one place.
 *
 * Anything still a placeholder is marked NEEDS. None of these should reach
 * production unresolved — the previous portfolio shipped with
 * `jan.rivera@email.com` on it, which is the specific failure this file
 * exists to prevent.
 */

export const SITE = {
  name: "Jan Luigi Rivera",

  /**
   * Absolute site URL, no trailing slash. Drives metadataBase, the sitemap
   * and robots.txt. The Pages workflow sets it to
   * https://ancientsky14.github.io/Portfolio.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),

  /** The positioning line. Single source — hero and metadata both read it. */
  // Deliberately not "systems that keep working offline": SENTRO's sync
  // engine is unbuilt, and eBudget no longer works offline since its
  // Postgres move (Jan, 2026-09-11).
  line: "I design and build software products — web apps, desktop apps, and multi-site platforms.",

  sub: "From the database to the installer, and the updates after.",

  /**
   * Confirmed by Jan, 2026-09-11. A domain address (hello@<domain>) can
   * replace it once a domain is picked — see content/positioning.md.
   */
  email: "janluigirivera@gmail.com",

  /**
   * Covers both audiences the site is for — clients and employers.
   * Confirmed by Jan, 2026-09-11.
   */
  availability: "Open to projects and full-time roles",

  /** The one-line role under the name in the rail. */
  role: "Full-stack developer",

  /** Design credit, in the rail and the page footer. Plain text, never a
   *  link — Jan asked on 2026-09-13 that the reference site is not linked
   *  from the page. */
  credit: "© Kenneth Villar",

  /**
   * The live visit counter — the portfolio-visits Cloudflare Worker in
   * workers/visits/, no trailing slash. Drives the count beside the handle in
   * the rail (components/shell/visit-count.tsx). Replaced GoatCounter, whose
   * public total lagged up to four hours (Jan, 2026-09-13).
   *
   * Deployed by Jan to his own Cloudflare account, 2026-09-13. Set to null to
   * switch counting and the count off; the rail then shows just the handle.
   */
  visitsApi: "https://portfolio-visits.ancientsky14.workers.dev" as string | null,
} as const;
