/**
 * portfolio-visits — the live visit count beside the handle in the rail
 * (components/shell/visit-count.tsx). Replaced GoatCounter, whose public
 * total lagged up to four hours (Jan, 2026-09-13).
 *
 *   POST /hit    count this visitor (once per Manila day), return { count }
 *   GET  /count  return { count }
 *
 * Privacy: no IP address is stored. A visitor is a SHA-256 of a secret salt,
 * the day, the IP and the user agent; keys older than two days are deleted
 * nightly. No cookies are set.
 *
 * Abuse: only the live site's Origin may add a visit, known bots are not
 * counted, and the same visitor counts once per day. A determined script can
 * still fake an Origin — the per-day key caps that at one visit per IP and
 * user agent per day.
 */

export interface Env {
  VISITS_DB: D1Database;
  /** `npx wrangler secret put VISIT_SALT` — a long random string. */
  VISIT_SALT: string;
  READ_ORIGINS: string;
  HIT_ORIGINS: string;
}

const BOT =
  /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|curl|wget|python|httpclient|monitor|scan/i;

const list = (csv: string) =>
  csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** YYYY-MM-DD in Asia/Manila — "one visit per day" means the visitor's day. */
function manilaDay(at = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status: number, origin: string | null): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "cache-control": "no-store",
  };
  if (origin) {
    headers["access-control-allow-origin"] = origin;
    headers.vary = "Origin";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function total(env: Env): Promise<number> {
  const row = await env.VISITS_DB.prepare("SELECT count FROM totals WHERE id = 1").first<{
    count: number;
  }>();
  return row?.count ?? 0;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const readOrigin = origin && list(env.READ_ORIGINS).includes(origin) ? origin : null;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: readOrigin
          ? {
              "access-control-allow-origin": readOrigin,
              "access-control-allow-methods": "GET, POST",
              "access-control-max-age": "86400",
              vary: "Origin",
            }
          : {},
      });
    }

    if (url.pathname === "/count" && request.method === "GET") {
      return json({ count: await total(env) }, 200, readOrigin);
    }

    if (url.pathname === "/hit" && request.method === "POST") {
      if (!origin || !list(env.HIT_ORIGINS).includes(origin)) {
        return json({ error: "origin not allowed" }, 403, readOrigin);
      }
      if (!env.VISIT_SALT) {
        return json({ error: "not configured" }, 500, origin);
      }

      const ua = request.headers.get("User-Agent") ?? "";
      if (!ua || BOT.test(ua)) {
        return json({ count: await total(env), counted: false }, 200, origin);
      }

      const ip = request.headers.get("CF-Connecting-IP") ?? "";
      const day = manilaDay();
      const visitor = await sha256(`${env.VISIT_SALT}:${day}:${ip}:${ua}`);

      // One transaction: the insert (a repeat is ignored, so the trigger
      // does not fire) and the read of the total that the trigger updated.
      const [, current] = await env.VISITS_DB.batch([
        env.VISITS_DB.prepare("INSERT OR IGNORE INTO visits (day, visitor) VALUES (?1, ?2)").bind(
          day,
          visitor,
        ),
        env.VISITS_DB.prepare("SELECT count FROM totals WHERE id = 1"),
      ]);
      const count = (current?.results?.[0] as { count: number } | undefined)?.count ?? 0;
      return json({ count }, 200, origin);
    }

    return json({ error: "not found" }, 404, readOrigin);
  },

  /** Daily: forget visitor keys older than two days. The total stays. */
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cutoff = manilaDay(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
    await env.VISITS_DB.prepare("DELETE FROM visits WHERE day < ?1").bind(cutoff).run();
  },
} satisfies ExportedHandler<Env>;
