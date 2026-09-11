/**
 * Shared helpers for the case-study capture scripts (scripts/capture/*.mjs).
 *
 * Dev-only. Nothing here ships: the scripts write screenshots and screen
 * recordings into public/work/<slug>/, where lib/shots.ts picks them up.
 *
 * THE RULE (lib/shots.ts, and the reason these scripts exist at all):
 * captures come from local instances seeded with synthetic data — never a
 * production database, never real citizen, client or financial records, and
 * never a blur over real data. `assertLocal` enforces the first half: every
 * URL a script opens must be loopback, unless it is on the script's own
 * explicit, reviewed allowlist (a public sign-in page with no data behind it).
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const VIEWPORT = { width: 1440, height: 900 };
/** Recorded smaller than the viewport: roughly halves the file size. */
export const VIDEO_SIZE = { width: 1280, height: 800 };

const LOOPBACK = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function assertLocal(url, allow = []) {
  const u = new URL(url);
  if (LOOPBACK.has(u.hostname) || allow.includes(u.origin)) return;
  throw new Error(
    `Refusing to capture ${u.origin}: captures come from local, synthetic-data instances only.`,
  );
}

export function outDir(slug) {
  const dir = path.join(process.cwd(), "public", "work", slug);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function tmpVideoDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "capture-video-"));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Scroll to the bottom and back, smoothly, over roughly `ms`. */
export async function tourScroll(page, ms = 3000) {
  await page.evaluate(async (total) => {
    const el = document.scrollingElement ?? document.documentElement;
    const max = el.scrollHeight - window.innerHeight;
    if (max <= 40) {
      await new Promise((r) => setTimeout(r, total));
      return;
    }
    const steps = Math.max(20, Math.round(total / 40));
    const half = Math.round(steps / 2);
    for (let i = 1; i <= half; i++) {
      window.scrollTo(0, (max * i) / half);
      await new Promise((r) => setTimeout(r, total / steps));
    }
    for (let i = half; i >= 0; i--) {
      window.scrollTo(0, (max * i) / half);
      await new Promise((r) => setTimeout(r, total / steps / 2));
    }
  }, ms);
}

/** Viewport screenshot as JPEG — small enough to ship, sharp enough to read. */
export async function shot(page, file) {
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  console.log(`  shot   ${path.relative(process.cwd(), file)}`);
}

/**
 * Close the context and move its one recorded video to `dest`. Playwright
 * writes one file per page, named at random, when the context closes.
 */
export async function saveVideo(context, page, dest) {
  const video = page.video();
  await context.close();
  if (!video) throw new Error("no video was recorded");
  const src = await video.path();
  fs.copyFileSync(src, dest);
  fs.rmSync(src, { force: true });
  const mb = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
  console.log(`  video  ${path.relative(process.cwd(), dest)}  (${mb} MB)`);
}

/** Wait until the page has stopped loading data, but never hang on it. */
export async function settle(page, ms = 800) {
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await sleep(ms);
}
