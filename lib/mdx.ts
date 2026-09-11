import type { WorkMeta } from "./content";

/**
 * Case-study bodies, prepared for rendering.
 *
 * The drafts in content/work/*.mdx carry two kinds of note that must never
 * reach a reader:
 *
 *   `<!-- NEEDS: ... -->`  HTML comments — questions only Jan can answer.
 *                          These are also a hard syntax error in MDX 2+,
 *                          so they have to go before compilation, not after.
 *   `{/* ... *\/}`         MDX comments — the CONFIRMED / INFERRED / NEEDS
 *                          ledger at the top of each file.
 *
 * Stripping them leaves some headings with nothing under them ("## Numbers"
 * with every metric still null). Those sections are dropped rather than
 * rendered as an empty promise.
 */
export function prepareBody(raw: string): string {
  const stripped = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^---\s*$/gm, "");

  // Split into chunks that each start at a ## or ### heading, then keep a
  // chunk only if something other than whitespace sits under its heading.
  const lines = stripped.split("\n");
  const chunks: string[][] = [[]];
  for (const line of lines) {
    if (/^#{2,3}\s/.test(line)) chunks.push([line]);
    else chunks[chunks.length - 1].push(line);
  }

  return chunks
    .filter((chunk) => {
      const [first, ...rest] = chunk;
      if (!first || !/^#{2,3}\s/.test(first)) return chunk.join("").trim() !== "";
      return rest.join("").trim() !== "";
    })
    .map((chunk) => chunk.join("\n"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * The publishing gate for bodies.
 *
 * Every draft body still contains INFERRED prose — my reasonable guesses
 * about Jan's projects, marked "correct or delete, do not ship as-is". So:
 *
 *   `next dev`            — always renders, under a visible draft banner, so
 *                           the prose can be reviewed in the real layout
 *   production / Pages    — renders only when the file's frontmatter says
 *                           `bodyReviewed: true`
 *
 * Flip that flag after reading the rendered page and correcting it, not
 * before. The summary, stack and real metrics render either way.
 */
export function bodyVisibility(meta: WorkMeta): "public" | "draft" | "hidden" {
  if (meta.bodyReviewed) return "public";
  return process.env.NODE_ENV === "production" ? "hidden" : "draft";
}
