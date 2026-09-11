import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Lab entries — experiments, and notes on how the systems were built.
 *
 * Read from content/lab/*.mdx, the same way lib/content.ts reads the case
 * studies. The lab is the personal-brand half of the site and it only works
 * if the entries are real, so every entry here is built from its own repo
 * and names its proof (`proof`, `source`). A lab populated with invented
 * studies is worse than no lab.
 *
 * Bodies carry the case studies' publishing gate: `bodyReviewed: true` in
 * the frontmatter, set by Jan after reading the rendered note, or the body
 * does not ship (bodyVisibility() in lib/mdx.ts). The card, the summary
 * and the proof render either way.
 *
 * Chosen by Jan on 2026-09-11: the Archipelago, the eBudget release
 * pipeline and SENTRO's tenant isolation. The Miraverde demo was left out.
 */

export type LabKind = "Experiment" | "Note" | "Open source";

export type LabFact = { value: string; label: string };

export type LabMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  kind: LabKind;
  year: number;
  /** Two or three sentences. What it is and why it exists. */
  blurb: string;
  /** Names from lib/stack.ts, drawn by ToolIcon. */
  stack?: string[];
  /** Only ever a public link. A private repo gets no source link. */
  source?: { label: string; href: string };
  /** One line: where the claim can be checked. */
  proof?: string;
  /** The featured entry's spec tiles — each read from its code. */
  facts?: LabFact[];
  featured?: boolean;
  order?: number;
  /** Jan has read the rendered note. Until then the body does not ship. */
  bodyReviewed?: boolean;
};

export type LabDoc = LabMeta & { body: string };

const LAB_DIR = path.join(process.cwd(), "content", "lab");

export function getAllLab(): LabDoc[] {
  if (!fs.existsSync(LAB_DIR)) return [];
  return fs
    .readdirSync(LAB_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(LAB_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const meta = data as LabMeta;
      return {
        ...meta,
        slug: meta.slug ?? file.replace(/\.mdx?$/, "").replace(/^\d+-/, ""),
        body: content,
      };
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getLab(slug: string): LabDoc | undefined {
  return getAllLab().find((e) => e.slug === slug);
}

export function getLabSlugs(): string[] {
  return getAllLab().map((e) => e.slug);
}

/**
 * On the bench — write-ups that exist as real work but not yet as notes.
 * Each says what it is waiting on, rather than standing in as a placeholder
 * card. Promote one to content/lab/ only when it is written.
 */
export type Queued = { title: string; kind: LabKind; status: string };

export const QUEUED: Queued[] = [
  {
    title: "Moving a live Next.js app from Vercel to Cloudflare Workers",
    kind: "Note",
    status: "Waiting on hosting numbers", // PHASE-1.md, open question 3
  },
  {
    title: "Moving a live desktop app from SQLite to Postgres",
    kind: "Note",
    status: "Drafting", // eBudget, migrated 2026-08-30
  },
];
