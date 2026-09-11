/**
 * Live links for a case study — the real site, a demo, or a release feed —
 * and a build-time check that each one is actually up.
 *
 * Declared per project in content/work/*.mdx as `live:`. A link renders
 * only when all of these hold:
 *
 *   · `cleared: true` — Jan's permission to link it publicly. Naming a
 *     client (clientCleared) is a separate permission from linking their
 *     live system, and does not imply it.
 *   · it has an https URL
 *   · its host is not a staff, admin, intranet or internal surface. That
 *     is a hard block here, not a convention: even a frontmatter mistake
 *     cannot put a back-office login on the public site.
 *
 * Why links and not embeds: every one of these systems sends
 * `frame-ancestors 'none'` / `X-Frame-Options: DENY`, which is correct and
 * stays. The moving preview is a recording (lib/shots.ts, mediaFor).
 */

export type LiveKind = "production" | "demo" | "release";

export type LiveLink = {
  kind: LiveKind;
  label: string;
  /** null while it is a NEEDS — renders nothing. */
  href: string | null;
  /** One line under the button: what the visitor will find there. */
  note?: string;
  cleared?: boolean;
};

export type ClearedLink = LiveLink & { href: string };

export type LiveStatus = {
  up: boolean;
  /** ISO date of the build that checked it. */
  checkedAt: string;
};

/** Hosts that are never linked, whatever the frontmatter says. */
const BLOCKED = /(^|[.-])(staff|admin|intranet|internal)([.-]|$)/i;

export function liveLinks(meta: { live?: LiveLink[] }): ClearedLink[] {
  return (meta.live ?? []).filter((l): l is ClearedLink => {
    if (!l.cleared || !l.href) return false;
    let url: URL;
    try {
      url = new URL(l.href);
    } catch {
      return false;
    }
    return url.protocol === "https:" && !BLOCKED.test(url.hostname);
  });
}

/** The hostname shown in the preview's address bar. */
export function hostOf(href: string): string {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
}

/**
 * Is it up? One GET at build time, five-second timeout. A login page
 * answering 401 or 403 is up; a 404 or a 5xx is not. A network failure
 * resolves to "down" rather than failing the build.
 *
 * `force-cache`, because a static export cannot contain a request-time
 * fetch — the status is as of the build, and the page says so.
 */
export async function checkLive(href: string): Promise<LiveStatus> {
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(href, {
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      cache: "force-cache",
    });
    return { up: res.status !== 404 && res.status < 500, checkedAt };
  } catch {
    return { up: false, checkedAt };
  }
}
