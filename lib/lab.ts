/**
 * Lab entries — experiments, interaction studies, open source.
 *
 * Empty on purpose. The lab is the personal-brand half of the site and it
 * only works if the entries are real; a lab populated with invented studies
 * is worse than no lab, because the one reader who clicks through finds
 * nothing behind it.
 *
 * `app/lab/page.tsx` shows an honest empty state while this array is empty,
 * and lists real entries once there are any.
 *
 * Candidates Jan already has, once he confirms what is publishable:
 *   · the BarangayOS → SENTRO re-architecture (verify the upstream licence
 *     and author first — PHASE-1.md, question 4)
 *   · the Vercel → Cloudflare Workers migration, with before/after hosting
 *     numbers (PHASE-1.md, question 3)
 *   · the offline-first sync model, as a standalone note
 */

export type LabEntry = {
  slug: string;
  title: string;
  /** One line, plain. What it is and why it exists. */
  blurb: string;
  /** "Note" | "Experiment" | "Open source" — free text, kept short. */
  kind: string;
  year: number;
  href?: string;
  repo?: string;
};

export const LAB: LabEntry[] = [];
