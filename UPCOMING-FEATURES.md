# Upcoming features

A self-contained build plan, written 2026-09-13 so the work can continue on
another PC (and in a fresh Claude Code session that has none of the earlier
conversation). Read [CLAUDE.md](CLAUDE.md) first — its rules apply to every
phase below: design tokens only, a reduced-motion end state for every
animation, no invented numbers or quotes, static export (no request-time
Route Handlers, no Server Actions, no middleware).

Build in phase order. Each phase is independently shippable.

| Phase | Feature | Needs from Jan |
|---|---|---|
| 1 | Share preview images, search-engine data, CV button, Book-a-call — **built 2026-09-14** | CV PDF, Cal.com link |
| 2 | Contact form that really sends (Gmail SMTP) | Gmail App Password, Turnstile keys |
| 3 | Testimonials | Real quotes + written permission |
| 4 | Ctrl+K search | — |
| 5 | Tagalog / English on key pages | Review of every Tagalog page |

---

## 0. Resume on a new PC

**State as of 2026-09-13** (branch `portfolio`, deployed to
https://ancientsky14.github.io/Portfolio/ by `.github/workflows/deploy.yml`
on every push):

- Case studies have live links, build-time status, tour recordings and
  screenshots (`lib/live.ts`, `lib/shots.ts`, `components/work/`).
- The rail shows a live visit count from the `portfolio-visits` Cloudflare
  Worker in `workers/visits/` (D1, Jan's own Cloudflare account). GoatCounter
  was removed.
- Capture scripts live in `scripts/capture/`; video re-encoding in
  `scripts/media/reencode.mjs`.

**Set up the office PC:**

```bash
git pull
npm install
cd workers/visits && npm install && cd ../..
npm run dev
```

- Log in to Cloudflare only when a phase needs it: `cd workers/visits && npx wrangler login`
  — Jan's **own** account, never a client's (Santol's Workers live elsewhere).
- `workers/visits/.dev.vars` is gitignored, so it does not come with `git pull`.
  Recreate it for local Worker testing:

  ```
  VISIT_SALT=local-dev-salt-not-for-production
  HIT_ORIGINS=https://ancientsky14.github.io,http://localhost:3000
  ```

**Known gotchas:**

- If `npm run build` fails with
  `.next/dev/types/validator.ts(...): error TS1128`, a dev server left a
  half-written generated file. Stop `npm run dev`, run `rm -rf .next/dev`,
  build again. It is not a source error and does not affect CI.
- Never run `npm ci` while `npm run dev` is running (Windows). `npm ci`
  deletes `node_modules` first, then stops with `EPERM: operation not
  permitted, unlink ...\next-swc.win32-x64-msvc.node` because the dev server
  holds that file — leaving most packages gone. Stop the dev server first. If
  it has already happened, `npm install` restores the tree in place without
  touching the lockfile (seen 2026-09-14).

**Commands Jan runs himself** (see his global instructions): `npm run build`,
`git commit`, `git push`, any database push (`wrangler d1 migrations apply
--remote`), `wrangler deploy`, `wrangler secret put`. Claude prepares the
change and hands over exact commands.

**Prompt to start a phase in Claude Code:**

> Read UPCOMING-FEATURES.md and CLAUDE.md, then build Phase N. Follow the
> plan's file list and verification steps, and hand me the commands I run.

---

## Phase 1 — Quick wins

### 1.1 Share preview images (Open Graph)

**Why.** A link pasted into Messenger, Viber, LinkedIn or Facebook currently
shows a blank card. Buyers share links internally; the card is the first
impression.

**Built** — but not with the `opengraph-image.tsx` convention this section
first planned. Reading Next 16.3's export code showed two problems with it:

- A generated `opengraph-image` exports as an **extensionless** file
  (`out/opengraph-image`, see `node_modules/next/dist/export/index.js`,
  `handlerDest`). GitHub Pages serves that as `application/octet-stream`, and
  Facebook's crawler rejects an og:image with that content type.
- Under `app/work/[slug]/`, the image route's static params come only from
  its own file, and the loader's generated `generateStaticParams` fills just
  `__metadata_id__` — `slug` would be missing in the export.

What shipped instead (Jan chose it, 2026-09-14):

- `app/og/[card]/route.tsx` — a `force-static` GET with `dynamicParams =
  false`. `generateStaticParams` returns `site.png`, `work-<slug>.png`,
  `lab-<slug>.png`; the `.png` in the param becomes the file's extension.
  Static export supports this officially; nothing runs at request time.
  CLAUDE.md's "no Route Handlers" line now reads "no request-time Route
  Handlers".
- `app/_og/cards.tsx` — the three layouts (site: role, name, `SITE.line`,
  availability; case study: title, `fullName`, subtitle, platform/status/
  version pills, the tour poster; lab: kind · year, title, blurb). Light-token
  hex values, one accent, no figures.
- `app/_og/fonts/` — Bricolage Grotesque 800 (opsz 96), Public Sans 400/600,
  JetBrains Mono 600 as static TTF, with their OFL licences.
- `lib/og.ts` — card ids and `openGraphFor(id, alt)`; `lib/shots.ts` —
  `posterFile(slug)`. The layout sets the site card; case-study and lab pages
  set their own. Next fills og:title/description and the twitter tags from
  each page's own title and description.

Checked in `next dev` on 2026-09-14: all seven cards render (largest 340 KB),
an unknown id is a 404, the pages carry the right og:image, and Next's own
`resolveUrl` turns `/og/site.png` into
`https://ancientsky14.github.io/Portfolio/og/site.png` with the CI
`metadataBase`.

**Verify.** `npm run build`, then `out/og/` holds `site.png`, four `work-*.png`
and three `lab-*.png`. After deploy: `curl -I
https://ancientsky14.github.io/Portfolio/og/site.png` says `content-type:
image/png`, and a case-study URL pasted into the Facebook Sharing Debugger
shows its card.

### 1.2 Search-engine data (JSON-LD)

**Why.** Helps Google show Jan's name, profiles and projects correctly.
Invisible on the page.

**Built.** Builders in `lib/structured-data.ts`, rendered by
`components/site/json-ld.tsx` (escapes `<`):

- `app/layout.tsx` — `Person`: name, url, email, jobTitle (`SITE.role`),
  `sameAs` from `lib/socials.ts`, the avatar, `addressCountry: PH`.
- `app/work/[slug]/page.tsx` — **`CreativeWork`, not `SoftwareApplication`.**
  Google's Software App result *requires* `offers.price` and a rating or
  review; without them the Rich Results Test marks the item invalid, and the
  site states neither. Carries name, alternateName, headline (subtitle),
  description (summary), author, `dateCreated` (year), keywords (stack), and
  `about` with the cleared live link from `liveLinks()` when there is one.
- `app/lab/[slug]/page.tsx` — `TechArticle`.

Rules: only facts already on the page. No ratings, reviews or client names
that are not `clientCleared: true`.

**Verify.** Paste a deployed URL into https://search.google.com/test/rich-results
— no errors.

### 1.3 Downloadable CV

**Already built.** `cvHref()` in `lib/cv.ts` renders the "Download CV" button
on `/about` as soon as `public/cv.pdf` exists.

**Jan does:** export the CV to PDF and strip its metadata (author, software,
edit history): in Adobe Acrobat *File → Properties* and *Save As*, or with
`exiftool -all:all= cv.pdf` **followed by** `qpdf --linearize cv.pdf
cv-clean.pdf`. ExifTool's PDF edits are an incremental update — reversible
by design — so without the qpdf rewrite the old metadata is still in the
file. Save the result as `public/cv.pdf`.

**Verify.** `/about` shows the button; the download opens the PDF.

### 1.4 Book-a-call button

**Why.** Clients who are ready want a slot, not an email thread.

**Built.** `SITE.bookingUrl` (null, NEEDS) drives
`components/site/book-call.tsx` — the outline pill, `data-magnetic`, new tab,
rendered only for an https link — in three places:

- the home hero, after "Hire me". From 1100px it sits on its own row under
  the other two (`.home-fit__actions` in `design/tokens.css`): three pills in
  one row took the headline's width and broke it onto four lines at 1100 and
  1280px. Measured with a placeholder link: the headline stays on two lines
  at 1100×600, 1280×720 and 1536×864; the bento gives up 12px at 1100×600
  only; the home page still does not scroll.
- `/services` — under the header line. The page had no CTA of its own.
- `/contact` — beside "Email me".

**Jan does:** create a free https://cal.com account, a 30-minute event (with
Google Calendar connected so busy times block), and send the event link.

**Verify.** Button appears in all three places once set; hidden while null.

---

## Phase 2 — Contact form that really sends (Gmail SMTP)

**Why.** `components/contact/brief-form.tsx` builds a `mailto:` link, so it
depends on the visitor having a mail app configured — many give up there.

**Decision.** Gmail SMTP from a Cloudflare Worker (Jan's choice). Workers can
open outbound TCP sockets (`cloudflare:sockets`); port 25 is blocked but
**465 (TLS) and 587 work**. Use the `worker-mailer` npm package (SMTP client
for Workers) — check its README for required `compatibility_flags` before
installing. Gmail consumer limit is roughly 500 recipients a day.

### 2.1 Worker

Recommendation: a **separate Worker** `workers/contact/` (not inside
`workers/visits`). The Gmail App Password can send mail as Jan; keeping it in
its own Worker keeps the visit counter's code and secrets apart.

- `workers/contact/wrangler.jsonc` — D1 binding `CONTACT_DB`, vars
  `ALLOWED_ORIGINS` (`https://ancientsky14.github.io,http://localhost:3000`),
  `MAIL_TO` (Jan's address), `TURNSTILE_SITE_HOST` if needed.
- `workers/contact/migrations/0001_init.sql` —
  `messages(id INTEGER PRIMARY KEY, created_at TEXT, mode TEXT, name TEXT,
  email TEXT, company TEXT, body_json TEXT, ip_hash TEXT, emailed INTEGER)`.
- `workers/contact/src/index.ts` — `POST /contact`:
  1. Origin must be in `ALLOWED_ORIGINS` → else 403.
  2. Parse JSON; validate required fields and lengths (name ≤ 120, email
     format, message ≤ 5,000 chars). Reject HTML-looking payloads.
  3. Verify the Turnstile token:
     `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with
     `secret`, `response`, `remoteip` (`CF-Connecting-IP`). Fail → 400.
  4. Rate limit: max 3 messages per salted IP hash per hour (count rows in
     `messages`). Exceeded → 429.
  5. Insert into `messages`.
  6. Send via `smtp.gmail.com:465` with `worker-mailer`: From = Jan's Gmail,
     To = `MAIL_TO`, **Reply-To = the visitor's email**, subject as the form
     builds it today ("Project brief — …" / "Job opportunity — …"). Plain-text
     body; escape nothing into HTML.
  7. Mark `emailed = 1`. If sending fails, still return 200 with
     `{ stored: true, emailed: false }` — the message is safe in D1.
- Secrets: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `TURNSTILE_SECRET`, `IP_SALT`.
- No IPs stored — only the salted hash, as in `workers/visits`.

### 2.2 Site

- `lib/site.ts` — `contactApi: null as string | null` and
  `turnstileSiteKey: null as string | null`.
- `components/contact/brief-form.tsx`:
  - Load the Turnstile widget script
    (`https://challenges.cloudflare.com/turnstile/v0/api.js`) only on the
    Contact page, only when both values are set.
  - On submit: `fetch(contactApi + "/contact", { method: "POST", body: JSON })`
    with the token. Show sending / sent / error states in the form's existing
    style. Keep both modes (project brief, job opportunity) and their fields.
  - **Fallback:** if the Worker is not configured, the request fails, or
    JavaScript is off, keep today's `mailto:` behaviour (`action="mailto:"`
    already covers no-JS).
  - Accessible status: `aria-live="polite"` region; focus the success
    message.

### 2.3 Jan does

1. Google Account → Security → turn on **2-Step Verification**.
2. Google Account → Security → **App passwords** → create one named
   "portfolio contact". Never paste it into chat or a file.
3. Cloudflare dashboard → **Turnstile** → add site `ancientsky14.github.io`
   (and `localhost`) → copy site key (public) and secret key.
4. In `workers/contact`:

   ```bash
   npm install
   npx wrangler d1 create portfolio-contact        # paste id into wrangler.jsonc
   npx wrangler d1 migrations apply portfolio-contact --remote
   npx wrangler deploy                              # deploy BEFORE secrets
   npx wrangler secret put GMAIL_USER
   npx wrangler secret put GMAIL_APP_PASSWORD       # paste; input is hidden
   npx wrangler secret put TURNSTILE_SECRET
   node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | clip
   npx wrangler secret put IP_SALT                  # paste from clipboard
   echo off | clip
   ```

   Lesson from the visits Worker: on Windows, **piping** a value into
   `wrangler secret put` stored an empty secret. Use clipboard + paste.
5. Send Claude the Worker URL and the Turnstile **site** key (never the
   secret).

### 2.4 Verify

- Local: `npx wrangler dev` with `.dev.vars` (test secrets, Turnstile test
  keys `1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`).
  Valid submission → 200 and an email arrives; wrong origin → 403; bad token
  → 400; 4th message in an hour → 429; SMTP failure → stored, `emailed:false`.
- Site: form sends, success state shows, Reply-To works; with `contactApi`
  null the old `mailto:` still works.

---

## Phase 3 — Testimonials

**Why.** A real quote from MGB RO1 or Santol staff is the strongest trust
signal for public-sector buyers. **Never invent or paraphrase one.**

**How.**

- `lib/testimonials.ts`:

  ```ts
  type Testimonial = {
    quote: string;          // verbatim, as approved
    name: string;
    role: string;
    organization: string;  // rendered only if the matching case study is clientCleared
    project?: string;       // work slug
    consent: boolean;       // written permission to publish name + quote
    consentDate: string;    // ISO date
    consentSource: string;  // "email from … 2026-..-..", not rendered
  };
  ```

  Export `publishedTestimonials()` → only `consent === true`.
- `components/sections/testimonials.tsx` — Server Component, token styling,
  `data-reveal-group`. Placed on `/about` and `/services`, and on the related
  case study (`project`). **Renders nothing when the list is empty** — the
  section stays cut rather than faked.

**Jan does:** ask each person for a short quote and **written** permission
(email is enough) to publish their name, role and office with it. Paste the
approved wording exactly.

**Verify.** With zero consented entries no section or heading renders; with
one, it renders on the three pages.

---

## Phase 4 — Ctrl+K search

**Why.** Quick jump across work, lab, writing and services; keyboard-friendly.

**How** (no Route Handlers — static export rule):

- `lib/search-index.ts` — Server-side builder: pages from
  `components/shell/nav-links.ts`, case studies (`getAllWork()` — title,
  `fullName`, subtitle, stack), lab notes (`getAllLab()`), services
  (`lib/services.ts`). Returns ~30 small entries.
- `app/layout.tsx` passes the index as a prop to
  `components/shell/command-palette.tsx` (client). Serialized once in the RSC
  payload — a few KB.
- Palette: opens on Ctrl+K / Cmd+K and a search button in the rail and
  mobile bar; plain substring + word-prefix matching (no `cmdk` or `fuse.js`
  — protect the 200 KB JS budget); arrow keys, Enter navigates with
  `next/link` router, Esc closes; focus trap and return focus (reuse the
  pattern from the work gallery viewer in `components/work/work-gallery.tsx`);
  `role="dialog"`, `aria-modal`, `role="listbox"`/`option`.
- Motion: open/close fade only; instant under reduced motion.
- `data-lenis-prevent` on the list, as the gallery viewer does.

**Verify.** Keyboard only: Ctrl+K → type "ebud" → Enter lands on
`/work/mgb-ebudget/`; Esc returns focus; screen reader announces results;
main JS size unchanged within a few KB.

---

## Phase 5 — Tagalog / English (key pages)

**Scope (Jan's decision):** Home, Services, About, Contact in Tagalog. Case
studies, Lab and Writing stay English. Claude drafts the Tagalog; **it ships
only after Jan reviews each page.**

**How** (static export: no middleware or i18n routing):

- `content/i18n/en.ts` and `content/i18n/tl.ts` — typed dictionaries
  (`satisfies Dictionary`) holding every string on the four pages plus nav
  labels, rail, footer and form labels. `tl.ts` carries
  `reviewed: { home: false, services: false, about: false, contact: false }`.
- Refactor the four pages' sections to take strings from a `dict` prop
  instead of inline literals (English output must stay byte-identical — check
  by diffing the built HTML before/after).
- Routes: `app/tl/page.tsx`, `app/tl/services/page.tsx`,
  `app/tl/about/page.tsx`, `app/tl/contact/page.tsx` — thin wrappers passing
  `tl` strings. A Tagalog page is **not generated** until its `reviewed` flag
  is true (skip it in the route, and in `app/sitemap.ts`).
- Metadata: `alternates.languages` (`en` ↔ `tl`) and `<html lang>` per route
  (`lang="tl"` on the `/tl` segment layout).
- Toggle: "EN / TL" in the rail and mobile bar, linking to the counterpart
  page (only when it exists); remembers choice in `localStorage` but never
  auto-redirects.
- Truthfulness: translate meaning, never add claims; numbers, client names and
  technical names stay as in English.

**Jan does:** read each Tagalog page in the dev server, correct it, then flip
its `reviewed` flag.

**Verify.** `/tl/` renders only reviewed pages; toggle round-trips to the
same page; `hreflang` present; English pages unchanged.

---

## Budgets to re-check after each phase

From CLAUDE.md: LCP < 2.0 s on 4G mid-range Android · CLS < 0.05 · INP < 200 ms
· main JS < 200 KB gzip · Lighthouse ≥ 95 performance, 100 accessibility.
Phase 2 (Turnstile script, Contact page only) and Phase 4 (palette) are the
two that touch JS weight.
