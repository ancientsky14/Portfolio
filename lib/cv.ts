import fs from "node:fs";
import path from "node:path";

/**
 * The CV link for employers and recruiters.
 *
 * Drop a PDF into public/cv.pdf and the "Download CV" button appears on
 * /about at the next build. Until then there is no button — a CV link that
 * 404s is worse than none. Same build-time pattern as lib/avatar.ts,
 * including the hand-added basePath prefix for GitHub Pages.
 */
export function cvHref(): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", "cv.pdf"))
    ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cv.pdf`
    : null;
}
