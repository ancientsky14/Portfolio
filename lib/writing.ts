/**
 * Writing index.
 *
 * Empty on purpose, same reasoning as `lib/lab.ts`. Phase R6 replaces this
 * module with an MDX reader over `content/writing/` — the shape below is the
 * frontmatter that reader will produce, so `app/writing/page.tsx` does not
 * change when the source does.
 *
 * The build plan's argument for writing: two good posts on building
 * government systems in the Philippines will outrank every generic dev blog
 * in that niche. Posts bring the traffic; the portfolio converts it.
 */

export type Post = {
  slug: string;
  title: string;
  /** One line. The argument, not a teaser. */
  excerpt: string;
  /** ISO date — formatted at render, never pre-formatted here. */
  date: string;
  readingMinutes?: number;
};

export const POSTS: Post[] = [];
