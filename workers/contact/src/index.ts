/**
 * portfolio-contact — the contact form's sender
 * (components/contact/brief-form.tsx). Replaces "open your mail app", which
 * lost every visitor without one configured.
 *
 *   POST /contact   a brief → stored in D1 → emailed to Jan through Gmail SMTP
 *
 * In order: the Origin must be the live site (403); the body must be a valid
 * brief (lib/brief.ts, 400); the Turnstile token must verify for one of those
 * origins' hostnames (400); the visitor may have sent at most three messages
 * in the past hour (429). Then the message is stored, and only then emailed —
 * if Gmail fails the answer is still 200, `{ stored: true, emailed: false }`,
 * because the message is safe in D1.
 *
 * The email comes From Jan's Gmail (Gmail rewrites any other From), with
 * Reply-To set to the visitor, so answering it answers them.
 *
 * Privacy: no IP address is stored — a salted SHA-256 of it, for the rate
 * limit. A daily cron deletes emailed messages after 30 days and every
 * message after 90. No cookies.
 *
 * Header injection: every value that reaches a header (Subject, Reply-To) is
 * one-line text by validateBrief(); the mail library writes ASCII header
 * values unencoded, so that check is what keeps "\r\n" out.
 */

import { LogLevel, WorkerMailer } from "worker-mailer";
import { composeBrief, validateBrief } from "../../../lib/brief";

export interface Env {
  CONTACT_DB: D1Database;
  /** Comma-separated origins allowed to POST /contact. */
  ALLOWED_ORIGINS: string;
  /** Where briefs are delivered. */
  MAIL_TO: string;
  /** `npx wrangler secret put GMAIL_USER` — the Gmail address that sends. */
  GMAIL_USER: string;
  /** `npx wrangler secret put GMAIL_APP_PASSWORD` — a Google App Password. */
  GMAIL_APP_PASSWORD: string;
  /** `npx wrangler secret put TURNSTILE_SECRET` — the widget's secret key. */
  TURNSTILE_SECRET: string;
  /** `npx wrangler secret put IP_SALT` — a long random string. */
  IP_SALT: string;
}

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** A brief is at most ~11 KB of text; anything far past that is not one. */
const MAX_BODY_BYTES = 32_000;
/** Turnstile tokens are at most 2048 characters. */
const MAX_TOKEN = 2048;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const KEEP_EMAILED_DAYS = 30;
const KEEP_ANY_DAYS = 90;

const list = (csv: string) =>
  csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

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

/**
 * Turnstile's verdict on a token. Tokens are single-use and expire after five
 * minutes. The hostname check makes a token minted anywhere but the site
 * itself worthless.
 *
 * Except for Cloudflare's test secret keys (local testing, .dev.vars): they
 * answer `hostname: "example.com"` with `metadata.result_with_testing_key:
 * true` — seen 2026-09-14; their docs still say "localhost". Only a test
 * secret produces that flag, and a real secret rejects the dummy token, so
 * skipping the hostname check for it opens nothing in production.
 */
async function verifyTurnstile(
  token: string,
  ip: string,
  secret: string,
  hostnames: string[],
): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetch(SITEVERIFY, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return false;
    const outcome = await res.json<{
      success?: boolean;
      hostname?: string;
      metadata?: { result_with_testing_key?: boolean };
    }>();
    if (outcome.success !== true) return false;
    return (
      outcome.metadata?.result_with_testing_key === true ||
      hostnames.includes(outcome.hostname ?? "")
    );
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origins = list(env.ALLOWED_ORIGINS);
    const requestOrigin = request.headers.get("Origin");
    const origin = requestOrigin && origins.includes(requestOrigin) ? requestOrigin : null;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: origin
          ? {
              "access-control-allow-origin": origin,
              "access-control-allow-methods": "POST",
              "access-control-allow-headers": "content-type",
              "access-control-max-age": "86400",
              vary: "Origin",
            }
          : {},
      });
    }

    if (url.pathname !== "/contact" || request.method !== "POST") {
      return json({ error: "not found" }, 404, origin);
    }

    if (!origin) {
      return json({ error: "origin not allowed" }, 403, null);
    }

    // An empty secret counts as missing: on Windows, piping into
    // `wrangler secret put` stores "". Names only in the log, never values.
    const missing = (
      [
        "CONTACT_DB",
        "GMAIL_USER",
        "GMAIL_APP_PASSWORD",
        "TURNSTILE_SECRET",
        "IP_SALT",
        "MAIL_TO",
      ] as const
    ).filter((name) => !env[name]);
    if (missing.length > 0) {
      console.error(`contact: not configured, missing ${missing.join(", ")}`);
      return json({ error: "not configured" }, 500, origin);
    }

    // Size first, from the header, so an oversized body is never read.
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
      return json({ error: "too large" }, 413, origin);
    }
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return json({ error: "too large" }, 413, origin);
    }

    let input: unknown;
    try {
      input = JSON.parse(text);
    } catch {
      return json({ error: "invalid json" }, 400, origin);
    }

    const token = (input as { token?: unknown } | null)?.token;
    if (typeof token !== "string" || !token || token.length > MAX_TOKEN) {
      return json({ error: "verification missing" }, 400, origin);
    }

    const check = validateBrief(input);
    if (!check.ok) {
      return json({ error: check.error }, 400, origin);
    }
    const brief = check.brief;

    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    const hostnames = origins.map((o) => new URL(o).hostname);
    if (!(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET, hostnames))) {
      return json({ error: "verification failed" }, 400, origin);
    }

    const ipHash = await sha256(`${env.IP_SALT}:${ip}`);
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const recent = await env.CONTACT_DB.prepare(
      "SELECT COUNT(*) AS n FROM messages WHERE ip_hash = ?1 AND created_at > ?2",
    )
      .bind(ipHash, since)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= RATE_LIMIT) {
      return json({ error: "too many messages" }, 429, origin);
    }

    // Stored before the send, so a Gmail failure loses nothing.
    const stored = await env.CONTACT_DB.prepare(
      "INSERT INTO messages (created_at, mode, name, email, company, body_json, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
    )
      .bind(
        new Date().toISOString(),
        brief.mode,
        brief.name,
        brief.email,
        brief.company || null,
        JSON.stringify(brief),
        ipHash,
      )
      .run();
    const id = stored.meta.last_row_id;

    const { subject, body } = composeBrief(brief);
    try {
      await WorkerMailer.send(
        {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          credentials: { username: env.GMAIL_USER, password: env.GMAIL_APP_PASSWORD },
          // worker-mailer has no default: without this it refuses to log in.
          authType: ["plain", "login"],
          // Never DEBUG — at that level the library logs the AUTH line.
          logLevel: LogLevel.ERROR,
          socketTimeoutMs: 15_000,
          responseTimeoutMs: 15_000,
        },
        {
          from: { name: "Portfolio contact form", email: env.GMAIL_USER },
          to: env.MAIL_TO,
          // Quotes would end the quoted display name early; the address is
          // already restricted by validateBrief().
          reply: { name: brief.name.replace(/["\\]/g, ""), email: brief.email },
          subject,
          text: `${body}\n\n—\nSent from the contact form on ${origin}. Reply to this email to answer ${brief.name}.`,
        },
      );
    } catch (err) {
      // No personal data in the log — the id finds the row.
      console.error(
        `contact: message ${id} stored, email failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return json({ stored: true, emailed: false }, 200, origin);
    }

    await env.CONTACT_DB.prepare("UPDATE messages SET emailed = 1 WHERE id = ?1").bind(id).run();
    return json({ stored: true, emailed: true }, 200, origin);
  },

  /** Daily: emailed messages go after 30 days, everything after 90. */
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const now = Date.now();
    await env.CONTACT_DB.batch([
      env.CONTACT_DB.prepare("DELETE FROM messages WHERE emailed = 1 AND created_at < ?1").bind(
        new Date(now - KEEP_EMAILED_DAYS * DAY_MS).toISOString(),
      ),
      env.CONTACT_DB.prepare("DELETE FROM messages WHERE created_at < ?1").bind(
        new Date(now - KEEP_ANY_DAYS * DAY_MS).toISOString(),
      ),
    ]);
  },
} satisfies ExportedHandler<Env>;
