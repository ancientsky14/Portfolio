import fs from "node:fs";
import path from "node:path";

/**
 * Screenshots for a case study, read at build time from
 * public/work/<slug>/ (png, jpg, webp, avif), sorted by file name.
 *
 * None exist yet, so every viewer and card shows its no-screenshot state.
 * Drop files in and they appear at the next build — no code change.
 *
 * Build plan §09, and still the rule: capture from a database reseeded with
 * synthetic records. Never real citizen, client or financial data, and never
 * a blur over real data — blur gets undone.
 */

const IMAGE = /\.(png|jpe?g|webp|avif)$/i;

export function shotsFor(slug: string): string[] {
  const dir = path.join(process.cwd(), "public", "work", slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE.test(f))
    .sort()
    .map((f) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/work/${slug}/${f}`);
}
