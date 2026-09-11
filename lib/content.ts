import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Metric = {
  label: string;
  /** null means "we do not have this number yet". Never fill it with a guess. */
  value: string | number | null;
};

export type WorkMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  /** The real client name. Only rendered when clientCleared is true. */
  client: string;
  /** Written permission to name the client publicly. */
  clientCleared: boolean;
  /** What we say instead, until permission exists. */
  clientAnonymous?: string;
  sector?: string;
  year?: number;
  role?: string;
  stack?: string[];
  repo?: string;
  repoPublic?: boolean;
  featured?: boolean;
  order?: number;
  summary?: string;
  metrics?: Metric[];
  /**
   * Jan has read the rendered body and corrected every INFERRED line.
   * Until this is true the body never ships in a production build — see
   * bodyVisibility() in lib/mdx.ts.
   */
  bodyReviewed?: boolean;
  /** What kind of thing was built — shown as a badge. */
  platform?: "Web" | "Desktop" | "Platform";
  /** Plain-language state: "In use", "In production", "In development". */
  status?: string;
  /** Current release, for things that ship versions. */
  version?: string;
};

export type WorkDoc = WorkMeta & { body: string };

const WORK_DIR = path.join(process.cwd(), "content", "work");

/**
 * The permission gate, handled structurally.
 *
 * Build-plan §09: never publish a client name without written permission.
 * Routing every render through this function means the gate is one boolean
 * per file rather than a manual find-and-replace across the site later.
 */
export function displayClient(m: WorkMeta): string {
  if (m.clientCleared) return m.client;
  return m.clientAnonymous ?? "Client under NDA";
}

/** Metrics that actually have a value. A null metric renders no tile. */
export function realMetrics(m: WorkMeta): Metric[] {
  return (m.metrics ?? []).filter(
    (x) => x.value !== null && x.value !== undefined && x.value !== "",
  );
}

function readDir(): string[] {
  if (!fs.existsSync(WORK_DIR)) return [];
  return fs
    .readdirSync(WORK_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
}

export function getAllWork(): WorkDoc[] {
  return readDir()
    .map((file) => {
      const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const meta = data as WorkMeta;
      return {
        ...meta,
        slug: meta.slug ?? file.replace(/\.mdx?$/, "").replace(/^\d+-/, ""),
        body: content,
      };
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getWork(slug: string): WorkDoc | undefined {
  return getAllWork().find((w) => w.slug === slug);
}

export function getWorkSlugs(): string[] {
  return getAllWork().map((w) => w.slug);
}
