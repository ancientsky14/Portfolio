/**
 * The latest eBudget release, read from the public releases repo at build
 * time — the /lab release strip.
 *
 * The repo holds nothing but signed installers and the update manifest (see
 * content/lab/02-signed-releases.mdx), so its latest release is the version
 * every installed copy is updating to right now. Reading it live means the
 * strip can never go stale the way a hand-typed version does.
 *
 * Static export: this runs once, during the build. If GitHub is slow or
 * unreachable it returns null within five seconds and the strip does not
 * render — the build never fails for a decoration. GITHUB_TOKEN, when the
 * environment has one (CI does), is sent only to api.github.com, to lift the
 * anonymous rate limit.
 */

export type Release = {
  name: string;
  tag: string;
  url: string;
  /** ISO date — formatted at render. */
  publishedAt: string;
};

export const RELEASES_REPO = "ancientsky14/mgb-ebudget-releases";

export async function latestRelease(): Promise<Release | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(
      `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(5000),
        cache: "force-cache",
      },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      name?: string;
      tag_name?: string;
      html_url?: string;
      published_at?: string;
    };
    if (!j.tag_name || !j.html_url || !j.published_at) return null;
    return {
      name: j.name ?? j.tag_name,
      tag: j.tag_name,
      url: j.html_url,
      publishedAt: j.published_at,
    };
  } catch {
    return null;
  }
}
