/**
 * eBudget — screenshots and a screen recording for /work/mgb-ebudget.
 *
 * eBudget is a Tauri desktop app, so there is no URL to open. Instead the
 * repo's own dev build runs on this machine against a throwaway local
 * Postgres filled with a fictional FY 2026 dataset, and this script attaches
 * to that window's WebView2 over the DevTools protocol:
 *
 *   # in D:\Dev\AI\Projects\mgb-ebudget, with a local cluster on :55433
 *   $env:MGB_PG_URL = "postgres://postgres@127.0.0.1:55433/mgb_capture"
 *   $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=9223"
 *   npm run tauri dev
 *
 *   node scripts/capture/ebudget.mjs
 *
 * Guards — an installed copy of eBudget on the same PC is connected to the
 * office's real records, so this refuses anything that is not the dev build:
 *   · the page must be served by the dev server (http://localhost:1420); the
 *     installed app loads from tauri:// and is never matched
 *   · the dashboard must not be the "not connected" screen
 * The local-connection path it relies on exists only in debug builds and
 * only for loopback hosts (mgb-ebudget src-tauri/src/db/pg.rs, is_loopback).
 *
 * A CDP-attached page cannot use Playwright's recordVideo, so frames come
 * from Page.startScreencast and are encoded to VP8 with Playwright's own
 * bundled ffmpeg at a constant frame rate.
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { outDir, shot, settle, sleep, tourScroll } from "./lib.mjs";

const CDP = process.env.EBUDGET_CDP ?? "http://127.0.0.1:9223";
const DEV_ORIGIN = "http://localhost:1420";
const FPS = 15;
const FFMPEG =
  process.env.PLAYWRIGHT_FFMPEG ??
  path.join(os.homedir(), "AppData", "Local", "ms-playwright", "ffmpeg-1011", "ffmpeg-win64.exe");

const TOUR = [
  ["appropriations", "/appropriations"],
  ["allotments", "/allotments"],
  ["obligations", "/obligations"],
  ["obligation-detail", "/obligations/4"],
  ["disbursements", "/disbursements"],
  ["far-reports", "/far"],
  ["saob-by-division", "/saob-by-division"],
];

/** Client-side navigation, so the recording shows no reload flash. */
async function go(page, route) {
  await page.evaluate((r) => {
    window.history.pushState({}, "", r);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, route);
  await settle(page, 1200);
}

/** Starts a constant-rate VP8 encode fed by the latest screencast frame. */
async function startRecording(page, dest) {
  const cdp = await page.context().newCDPSession(page);
  let latest = null;
  cdp.on("Page.screencastFrame", async (f) => {
    latest = Buffer.from(f.data, "base64");
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 80,
    maxWidth: 1280,
    maxHeight: 800,
  });

  const ff = spawn(
    FFMPEG,
    [
      "-loglevel", "error",
      "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "pipe:0",
      "-an", "-c:v", "vp8", "-b:v", "1M", "-crf", "10", "-qmin", "0", "-qmax", "50",
      "-deadline", "realtime", "-speed", "8",
      // VP8 needs even dimensions.
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-y", dest,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const tick = setInterval(() => {
    if (latest) ff.stdin.write(latest);
  }, 1000 / FPS);

  return async function stop() {
    clearInterval(tick);
    await cdp.send("Page.stopScreencast").catch(() => {});
    ff.stdin.end();
    await new Promise((resolve, reject) => {
      ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
    });
    const mb = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
    console.log(`  video  ${path.relative(process.cwd(), dest)}  (${mb} MB)`);
  };
}

const browser = await chromium.connectOverCDP(CDP);
try {
  const pages = browser.contexts().flatMap((c) => c.pages());
  const page = pages.find((p) => p.url().startsWith(DEV_ORIGIN));
  if (!page) {
    throw new Error(
      `No dev-build window at ${DEV_ORIGIN} (found: ${pages.map((p) => p.url()).join(", ") || "none"}). Not capturing.`,
    );
  }
  console.log(`\neBudget dev build  ${page.url()}`);

  await page.setViewportSize({ width: 1440, height: 900 });
  await go(page, "/");
  const body = (await page.textContent("body")) ?? "";
  if (/not connected to the office database/i.test(body)) {
    throw new Error("the dev build shows the not-connected screen — check MGB_PG_URL. Not capturing.");
  }

  const dir = outDir("mgb-ebudget");
  await shot(page, path.join(dir, "00-tour.jpg"));
  const stop = await startRecording(page, path.join(dir, "00-tour.webm"));
  await sleep(2500);

  let n = 1;
  for (const [name, route] of TOUR) {
    await go(page, route);
    // Stop rather than capture a page that did not load past its URL check.
    if (!new URL(page.url()).origin.startsWith(DEV_ORIGIN)) break;
    await shot(page, path.join(dir, `${String(n).padStart(2, "1")}-${name}.jpg`));
    await tourScroll(page, 2200);
    n++;
  }

  await go(page, "/");
  await sleep(1500);
  await stop();
} finally {
  // Detach only. Never close the app window — it belongs to the dev session.
  await browser.close().catch(() => {});
}
console.log("\ndone — review public/work/mgb-ebudget/ before committing.");
