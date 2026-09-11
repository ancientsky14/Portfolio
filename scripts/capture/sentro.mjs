/**
 * SENTRO — screenshots and a screen recording for /work/sentro.
 *
 * Captures the sentro repo's own local demo stack (`npm run dev:duo` in
 * D:\Dev\AI\Projects\sentro): a city cloud and a barangay node, seeded with
 * throwaway data and fixed demo accounts, loopback only. Nothing here can
 * reach a real deployment — assertLocal refuses any non-loopback URL.
 *
 *   node scripts/capture/sentro.mjs
 *
 * SENTRO_NODE_URL / SENTRO_CITY_URL override the web shells' URLs, which
 * dev-duo prints when it starts (8111 and 8110 unless those were taken).
 */

import { chromium } from "playwright";
import path from "node:path";
import {
  VIEWPORT,
  VIDEO_SIZE,
  assertLocal,
  outDir,
  tmpVideoDir,
  tourScroll,
  shot,
  saveVideo,
  settle,
  sleep,
} from "./lib.mjs";

const NODE = (process.env.SENTRO_NODE_URL ?? "http://127.0.0.1:8111").replace(/\/$/, "");
const CITY = (process.env.SENTRO_CITY_URL ?? "http://127.0.0.1:8110").replace(/\/$/, "");
// dev-duo's fixed, local-only demo password (scripts/dev-duo.mjs).
const PASSWORD = "DevDuo123!";

/** Pages worth showing, matched against the app's own navigation labels. */
const WANT = /dashboard|blotter|report|submission|resident|household|finance|barangay|document/i;

assertLocal(NODE);
assertLocal(CITY);

async function login(page, base, email) {
  await page.goto(`${base}/login`);
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
  await settle(page, 1200);
}

/** Links from the app's own sidebar, in order, that match WANT. */
async function pages(page, limit) {
  const links = await page.$$eval("nav a[href], aside a[href]", (as) =>
    as.map((a) => ({ href: a.getAttribute("href") ?? "", text: a.textContent?.trim() ?? "" })),
  );
  const seen = new Set();
  return links
    .filter((l) => l.href.startsWith("/") && l.href !== "/login" && WANT.test(l.text))
    .filter((l) => (seen.has(l.href) ? false : seen.add(l.href)))
    .slice(0, limit);
}

async function walk(page, base, label, prefix, limit, dir) {
  console.log(`\n${label}  ${base}`);
  await shot(page, path.join(dir, `${prefix}-1-dashboard.jpg`));
  await sleep(1800);
  let n = 2;
  for (const l of await pages(page, limit)) {
    if (l.href === "/" || l.href === new URL(page.url()).pathname) continue;
    await page.goto(`${base}${l.href}`);
    await settle(page);
    const name = l.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await shot(page, path.join(dir, `${prefix}-${n}-${name}.jpg`));
    await tourScroll(page, 2600);
    n++;
  }
}

const dir = outDir("sentro");
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  recordVideo: { dir: tmpVideoDir(), size: VIDEO_SIZE },
});
const page = await context.newPage();

try {
  // Barangay hall first — the node that works offline — then the city hall
  // that oversees every barangay.
  await login(page, NODE, "admin@devduo.local");
  // The poster: the first frame a visitor sees, same stem as the video.
  await shot(page, path.join(dir, "00-tour.jpg"));
  await walk(page, NODE, "barangay hall", "10", 3, dir);

  await login(page, CITY, "city@devduo.local");
  await walk(page, CITY, "city hall", "20", 3, dir);

  await saveVideo(context, page, path.join(dir, "00-tour.webm"));
} finally {
  await browser.close();
}
console.log("\ndone — review public/work/sentro/ before committing.");
