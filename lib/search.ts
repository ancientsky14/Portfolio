/**
 * Site search — the shared, browser-safe half (Phase 4, Ctrl+K).
 *
 * The index itself is built at build time from the content files by
 * lib/search-index.ts (which reads the filesystem, so the browser never
 * imports it). This module holds only what both sides need: the entry
 * shape, the open event, and the matcher.
 *
 * No `cmdk`, no `fuse.js`: ~30 short entries do not need a library, and
 * every KB here is weighed against the 200KB first-load budget.
 */

export type SearchGroup = "Pages" | "Work" | "Lab" | "Services" | "Actions";

export type SearchEntry = {
  id: string;
  group: SearchGroup;
  title: string;
  /** One line under the title. */
  hint?: string;
  /**
   * A route without the base path (navigated with the router), or — when
   * `external` — a full URL, mailto: or file link opened as-is.
   */
  href: string;
  external?: boolean;
  /** Extra text that matches but is not shown: stack, full names, lines. */
  keywords?: string;
};

/** Dispatched on window by the search buttons; the launcher listens. */
export const PALETTE_EVENT = "palette:open";

const norm = (s: string) =>
  s.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const wordPrefix = (text: string, token: string) =>
  text.startsWith(token) || text.includes(` ${token}`) || text.includes(`-${token}`);

/**
 * Every word of the query must match somewhere; titles outrank hints and
 * keywords, prefixes outrank substrings. Ties keep the index order, so an
 * empty query lists everything as built.
 */
export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return entries;

  const scored: { e: SearchEntry; score: number; i: number }[] = [];
  entries.forEach((e, i) => {
    const title = norm(e.title);
    const rest = norm(`${e.hint ?? ""} ${e.keywords ?? ""}`);
    let score = 0;
    for (const t of tokens) {
      if (title.startsWith(t)) score += 100;
      else if (wordPrefix(title, t)) score += 60;
      else if (title.includes(t)) score += 40;
      else if (wordPrefix(rest, t)) score += 20;
      else if (rest.includes(t)) score += 10;
      else return;
    }
    scored.push({ e, score, i });
  });

  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((s) => s.e);
}
