/**
 * LMIS — screenshots and a screen recording for /work/santol-lmis, taken
 * from the LIVE system, on Jan's instruction (2026-09-11): the public portal
 * and the staff application, not a demo instance.
 *
 * Because this is production, with real records behind it:
 *
 *   · Read-only. The script only navigates. It never fills, submits, saves,
 *     publishes or deletes anything — no clicks except Jan's own sign-in.
 *   · Jan signs in himself, in a separate, visible, NOT-recorded window
 *     (email, password and the authenticator code never reach a recording,
 *     a log or this script). The session is then handed to the recording.
 *   · Admin pages are a fixed allowlist. Pages that exist to show personal
 *     data — citizen feedback, email delivery, security, settings, staff —
 *     are never opened.
 *   · Every page is masked before it is captured, with the LMIS repo's own
 *     MASK_FN (santol-municipal-portal/scripts/tour.mjs): email addresses,
 *     phone numbers, and personal names beside them are blurred. Jan decides
 *     at review what ships; anything still showing a private person's
 *     details is deleted, not published.
 *
 *   node scripts/capture/lmis-prod.mjs            # public + admin
 *   node scripts/capture/lmis-prod.mjs --public   # public portal only
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

const PUBLIC = "https://lmis.santol-lu.workers.dev";
const ADMIN = "https://lmis-admin.santol-lu.workers.dev";
assertLocal(PUBLIC, [PUBLIC, ADMIN]);
assertLocal(ADMIN, [PUBLIC, ADMIN]);
const PUBLIC_ONLY = process.argv.includes("--public");

const PUBLIC_STOPS = [
  ["legislation", "/legislation"],
  ["ordinances", "/legislation/ordinances"],
  ["sessions", "/sessions"],
  ["sangguniang-bayan", "/sangguniang-bayan"],
  ["transparency", "/transparency"],
];

// Pages that show the municipal record, not people. Empty "new" forms show
// the workflow with no record in them at all.
const ADMIN_STOPS = [
  ["overview", "/admin"],
  ["legislation", "/admin/legislation"],
  ["filing-a-measure", "/admin/legislation/new"],
  ["sessions", "/admin/sessions"],
  ["session-builder", "/admin/sessions/new"],
  ["committees", "/admin/committees"],
  ["statistical-data", "/admin/statistical-data"],
  ["compliance", "/admin/compliance"],
];
const NEVER = /feedback|notifications|security|settings|staff|secretariat|users|account/i;

// From santol-municipal-portal/scripts/tour.mjs — the repo's own masking,
// reviewed there for recordings shown outside the LGU.
const MASK_FN = () => {
  if (!document.getElementById("__tourmask")) {
    const s = document.createElement("style");
    s.id = "__tourmask";
    s.textContent = ".__mask{filter:blur(7px)!important;background:#d9cfe0!important;border-radius:3px}";
    document.head.appendChild(s);
  }
  const PAT = [
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
    /(\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}/,
  ];
  const hit = (t) => PAT.some((p) => p.test(t));
  let n = 0;
  const mark = (el) => { if (!el.classList.contains("__mask")) { el.classList.add("__mask"); n++; } };
  document.querySelectorAll("*").forEach((el) => {
    if (el.closest("script, style, .__mask")) return;
    const t = (el.textContent || "").trim();
    if (!t || !hit(t)) return;
    if ([...el.children].some((c) => hit((c.textContent || "").trim()))) return;
    mark(el);
  });
  document.querySelectorAll(".__mask").forEach((m) => {
    let box = m.parentElement;
    for (let i = 0; i < 4 && box; i++) {
      box.querySelectorAll("h2,h3,h4,p,span,div,td,li").forEach((el) => {
        if (el.children.length || el.classList.contains("__mask")) return;
        const t = (el.textContent || "").trim();
        if (!t || t.length > 42) return;
        if (/^[A-Z][\p{L}.'-]+(?:\s+[A-Z][\p{L}.'-]+){1,3}$/u.test(t) &&
            !/Edit|Remove|Resend|Active|Invited|Administrator|Editor|Uploader|Staff|Superadmin|Access|Account|Invite|Total|Dashboard|Legislation|Tasks|Calendar|Registry|Documents|Announcements|Sessions|Directory|Internal|Portal|Ordinance|Resolution|Committee|Filed|Reading|Enacted|Approved|Search|Home|About|Contact/i.test(t)) {
          mark(el);
        }
      });
      box = box.parentElement;
    }
  });
  return n;
};

async function visit(page, url) {
  const res = await page.goto(url, { waitUntil: "domcontentloaded" });
  await settle(page, 1200);
  await page.evaluate(MASK_FN).catch(() => {});
  return res?.status() ?? 0;
}

const onAuthScreen = (url) => /\/login|security\/mfa|setup-account/.test(new URL(url).pathname);

/**
 * Jan signs in, in a visible window that is not recorded. Returns the
 * session to hand to the recording, or null if sign-in did not finish.
 */
async function signIn(browser) {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();
  await page.goto(`${ADMIN}/admin/login`, { waitUntil: "domcontentloaded" });
  console.log("\n  ▶ Sign in to the staff application in the browser window that just opened");
  console.log("    (email, password, authenticator code). Nothing you type is recorded.");
  console.log("    Waiting up to 10 minutes…\n");
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(1500);
    if (!onAuthScreen(page.url()) && new URL(page.url()).origin === ADMIN) {
      await settle(page, 1500);
      const state = await ctx.storageState();
      await ctx.close();
      console.log("  signed in — continuing\n");
      return state;
    }
  }
  await ctx.close();
  return null;
}

const dir = outDir("santol-lmis");
const browser = await chromium.launch({ headless: false });
try {
  const session = PUBLIC_ONLY ? null : await signIn(browser);
  if (!PUBLIC_ONLY && !session) console.log("  sign-in did not finish — capturing the public portal only");

  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: tmpVideoDir(), size: VIDEO_SIZE },
    ...(session ? { storageState: session } : {}),
  });
  const page = await context.newPage();

  console.log(`public portal  ${PUBLIC}`);
  await visit(page, `${PUBLIC}/`);
  await shot(page, path.join(dir, "00-tour.jpg"));
  await tourScroll(page, 3200);
  let n = 1;
  for (const [name, route] of PUBLIC_STOPS) {
    const status = await visit(page, `${PUBLIC}${route}`);
    if (status >= 400) { console.log(`  skip   ${route} (${status})`); continue; }
    await shot(page, path.join(dir, `1${n}-public-${name}.jpg`));
    await tourScroll(page, 2400);
    n++;
  }

  if (session) {
    console.log(`\nstaff application  ${ADMIN}`);
    n = 1;
    for (const [name, route] of ADMIN_STOPS) {
      if (NEVER.test(route)) continue;
      const status = await visit(page, `${ADMIN}${route}`);
      if (status >= 400 || onAuthScreen(page.url()) || NEVER.test(new URL(page.url()).pathname)) {
        console.log(`  skip   ${route} (${status} ${new URL(page.url()).pathname})`);
        continue;
      }
      await shot(page, path.join(dir, `2${n}-admin-${name}.jpg`));
      await sleep(1600);
      n++;
    }
  }

  await saveVideo(context, page, path.join(dir, "00-tour.webm"));
} finally {
  await browser.close();
}
console.log("\ndone — review EVERY file in public/work/santol-lmis/ before committing.");
