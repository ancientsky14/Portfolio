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
/**
 * Exactly half the viewport, so the downscale is clean and every frame gets
 * four times the bits it got at 1280x800 for the same bitrate. The page
 * frames this shape (8:5) without cropping.
 */
export const VIDEO_SIZE = { width: 960, height: 600 };

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

/**
 * Scroll down and back up over roughly `ms`, eased, one position per
 * animation frame.
 *
 * The first version jumped every ~40 ms with setTimeout. The recorder samples
 * on paint, so each jump was baked into the video as a hitch — most of the
 * judder Jan saw on the LMIS banner (2026-09-13). requestAnimationFrame moves
 * by fractions of a pixel each frame instead.
 */
export async function tourScroll(page, ms = 3000) {
  await page.evaluate(async (total) => {
    const el = document.scrollingElement ?? document.documentElement;
    const max = el.scrollHeight - window.innerHeight;
    const wait = (t) => new Promise((r) => setTimeout(r, t));
    if (max <= 40) {
      await wait(total);
      return;
    }
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const glide = (from, to, dur) =>
      new Promise((resolve) => {
        const t0 = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          window.scrollTo(0, from + (to - from) * ease(p));
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    await glide(0, max, total * 0.62);
    await wait(total * 0.12);
    await glide(max, 0, total * 0.26);
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
