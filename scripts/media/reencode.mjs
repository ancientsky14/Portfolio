/**
 * Re-encode a case study's tour recording for the page banner.
 *
 * The first pass at these files chased file size and starved the bitrate:
 * 1280x800 at 25 fps on ~400 kb/s is roughly 16 bits per thousand pixels,
 * which VP8 spends on smearing scrolling text and then on dropping frames.
 * On the page that reads as judder — Jan, 2026-09-13.
 *
 * This trades length for quality: half the resolution, 15 fps, a tighter
 * cut, and about four times the data per frame.
 *
 *   node scripts/media/reencode.mjs                 # every slug in PLAN
 *   node scripts/media/reencode.mjs santol-lmis     # one
 *
 * The untouched recording is kept beside it as `00-tour.full.webm`, which
 * .gitignore excludes — the short cut is what ships.
 *
 * Uses Playwright's bundled ffmpeg. That build has `scale`, `crop` and
 * `trim` but NOT `fps`/`setpts`, so the cut is made with -ss/-t and the
 * frame rate with -r. PLAYWRIGHT_FFMPEG overrides its path.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const FFMPEG =
  process.env.PLAYWRIGHT_FFMPEG ??
  path.join(os.homedir(), "AppData", "Local", "ms-playwright", "ffmpeg-1011", "ffmpeg-win64.exe");

/** Seconds. `start` skips what the banner does not need. */
const PLAN = {
  "santol-lmis": { start: 0, duration: 45 },
  "mgb-region-1-etracker": { start: 10, duration: 45 },
  sentro: { start: 0, duration: 45 },
  "mgb-ebudget": { start: 0, duration: 29 },
};

const WIDTH = 960;
const HEIGHT = 600; // 8:5, the shape the pages now frame (aspect-[8/5])
const FPS = 15;
const BITRATE = "600k";

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) =>
      code === 0 ? resolve(err) : reject(new Error(err.trim().split("\n").slice(-3).join("\n"))),
    );
  });
}

/** `ffmpeg -i` with no output always exits non-zero, so read stderr whole. */
function info(file) {
  return new Promise((resolve) => {
    const p = spawn(FFMPEG, ["-hide_banner", "-i", file], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", () => resolve(err));
  });
}

async function probe(file) {
  const out = await info(file);
  const dur = /Duration: (\d+:\d+:\d+\.\d+)/.exec(out)?.[1] ?? "?";
  const rate = /bitrate: (\d+ kb\/s)/.exec(out)?.[1] ?? "?";
  const size = /, (\d+x\d+)[,\s]/.exec(out)?.[1] ?? "?";
  const fps = /(\d+(?:\.\d+)?) fps/.exec(out)?.[1] ?? "?";
  return `${dur}  ${size}  ${fps} fps  ${rate}`;
}

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PLAN);

for (const slug of slugs) {
  const plan = PLAN[slug];
  if (!plan) {
    console.log(`  skip   ${slug} — no plan entry`);
    continue;
  }
  const dir = path.join(process.cwd(), "public", "work", slug);
  const out = path.join(dir, "00-tour.webm");
  const full = path.join(dir, "00-tour.full.webm");
  if (!fs.existsSync(out) && !fs.existsSync(full)) {
    console.log(`  skip   ${slug} — no recording`);
    continue;
  }

  // Keep the original once; re-runs then always encode from it, never from
  // an already-compressed cut.
  if (!fs.existsSync(full)) fs.renameSync(out, full);

  console.log(`\n${slug}`);
  console.log(`  before ${await probe(full)}  ${mb(fs.statSync(full).size)} MB`);

  const tmp = path.join(os.tmpdir(), `${slug}-tour.webm`);
  await run([
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", String(plan.start),
    "-t", String(plan.duration),
    "-i", full,
    "-an",
    "-vf", `scale=${WIDTH}:${HEIGHT}`,
    "-r", String(FPS),
    "-c:v", "vp8",
    "-b:v", BITRATE,
    "-crf", "10",
    "-qmin", "4",
    "-qmax", "42",
    "-deadline", "good",
    "-cpu-used", "2",
    tmp,
  ]);

  fs.copyFileSync(tmp, out);
  fs.rmSync(tmp, { force: true });
  console.log(`  after  ${await probe(out)}  ${mb(fs.statSync(out).size)} MB`);
}

console.log("\ndone — check each banner plays smoothly before committing.");
