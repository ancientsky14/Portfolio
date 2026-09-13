import fs from "node:fs";
import path from "node:path";

/**
 * Screenshots for a case study, read at build time from
 * public/work/<slug>/ (png, jpg, webp, avif), sorted by file name.
 *
 * None exist yet, so every viewer and card shows its no-screenshot state.
 * Drop files in and they appear at the next build — no code change.
 *
 * Build plan §09, and still the default: capture from a database reseeded
 * with synthetic records. Never citizen, client or financial records.
 *
 * One reviewed exception, Jan's call on 2026-09-11: LMIS is captured from the
 * live system (scripts/capture/lmis-prod.mjs) — its public portal, which is
 * public record, and an allowlist of staff pages with contact details
 * masked. Every other project is captured from synthetic data
 * (scripts/capture/*.mjs), and every file is reviewed by Jan before it ships.
 */

const IMAGE = /\.(png|jpe?g|webp|avif)$/i;

const VIDEO = /\.(webm|mp4)$/i;

export type Media = {
  images: string[];
  videos: { src: string; poster?: string }[];
};

/**
 * Screenshots and screen recordings for a case study's live preview, from
 * the same folder. A recording's poster is the image with the same base
 * name (`tour.webm` + `tour.jpg`); posters are not listed as screenshots.
 * Recordings follow the rule above: synthetic data only.
 */
export function mediaFor(slug: string): Media {
  const dir = path.join(process.cwd(), "public", "work", slug);
  if (!fs.existsSync(dir)) return { images: [], videos: [] };
  const base = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/work/${slug}/`;
  const files = fs.readdirSync(dir).sort();
  const stem = (f: string) => f.replace(/\.[^.]+$/, "");

  // `*.full.webm` is the uncut original kept by scripts/media/reencode.mjs.
  // It sorts before the short cut and is gitignored — never serve it.
  const videoFiles = files.filter((f) => VIDEO.test(f) && !/\.full\.[^.]+$/i.test(f));
  const posterStems = new Set(videoFiles.map(stem));
  const imageFiles = files.filter((f) => IMAGE.test(f));

  return {
    videos: videoFiles.map((f) => {
      const poster = imageFiles.find((i) => stem(i) === stem(f));
      return { src: base + f, poster: poster ? base + poster : undefined };
    }),
    images: imageFiles
      .filter((f) => !posterStems.has(stem(f)))
      .map((f) => base + f),
  };
}

export function shotsFor(slug: string): string[] {
  const dir = path.join(process.cwd(), "public", "work", slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE.test(f))
    .sort()
    .map((f) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/work/${slug}/${f}`);
}
