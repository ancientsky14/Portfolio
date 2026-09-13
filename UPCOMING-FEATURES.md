# Upcoming features

A self-contained build plan, written 2026-09-13 so the work can continue on
another PC (and in a fresh Claude Code session that has none of the earlier
conversation). Read [CLAUDE.md](CLAUDE.md) first — its rules apply to every
phase below: design tokens only, a reduced-motion end state for every
animation, no invented numbers or quotes, static export (no Route Handlers,
no Server Actions, no middleware).

Build in phase order. Each phase is independently shippable.

| Phase | Feature | Needs from Jan |
|---|---|---|
| 1 | Share preview images, search-engine data, CV button, Book-a-call | CV PDF, Cal.com link |
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

**Known gotcha:** if `npm run build` fails with
`.next/dev/types/validator.ts(...): error TS1128`, a dev server left a
half-written generated file. Stop `npm run dev`, run `rm -rf .next/dev`, build
again. It is not a source error and does not affect CI.

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

**How.** Next 16 `opengraph-image` file convention. Confirmed in
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`:
generated images are **built at build time and cached** unless they use
request-time APIs — so they work with the static export.

Files:

- `app/opengraph-image.tsx` — site card: name, `SITE.line`, accent wash.
- `app/work/[slug]/opengraph-image.tsx` — per case study: `title`,
  `fullName`, platform/status, and the poster `public/work/<slug>/00-tour.jpg`
  embedded as a data URL (read with `readFile`). Reuses the existing
  `generateStaticParams` from `app/work/[slug]/page.tsx`.
- `app/lab/[slug]/opengraph-image.tsx` — per lab note: kind, title, blurb.
- `app/_og/` — shared layout helper and font files. `next/og` needs
  **TTF/OTF/WOFF (not WOFF2)**; ship the display and body faces the site uses
  (see the font setup in `app/layout.tsx`) as `.ttf` in `app/_og/fonts/`.
- Each file exports `alt`, `size = { width: 1200, height: 630 }`,
  `contentType = "image/png"`.

Rules: colours from the token values in `design/tokens.css` (hard-code the
hex values in the OG file — CSS variables do not exist in `ImageResponse`);
one accent; no invented figures on the card.

Check `metadataBase` is set from `SITE.url` in `app/layout.tsx` so image URLs
include `/Portfolio`.

**Verify.** `npm run build` then check `out/opengraph-image.png` and
`out/work/<slug>/opengraph-image.png` exist and look right. After deploy,
paste a case-study URL into https://www.opengraph.xyz/ or the Facebook Sharing
Debugger.

### 1.2 Search-engine data (JSON-LD)

**Why.** Helps Google show Jan's name, profiles and projects correctly.
Invisible on the page.

**How.** Inline `<script type="application/ld+json">` rendered by Server
Components:

- `app/layout.tsx` — `Person`: `name` (`SITE.name`), `url` (`SITE.url`),
  `email`, `jobTitle` (`SITE.role`), `sameAs` from `lib/socials.ts`,
  `image` (the avatar), `address` country `PH`.
- `app/work/[slug]/page.tsx` — `SoftwareApplication` (or `CreativeWork` for
  the platform): `name` = `title`, `alternateName` = `fullName`,
  `applicationCategory`, `operatingSystem` (Windows for eBudget, Web
  otherwise), `author` → the Person, `url` = the cleared live link from
  `liveLinks()` only.
- `app/lab/[slug]/page.tsx` — `TechArticle`.

Put the builders in `lib/structured-data.ts`. Escape `<` in the JSON
(`JSON.stringify(data).replace(/</g, "\\u003c")`).

Rules: only facts already on the page. No ratings, reviews or client names
that are not `clientCleared: true`.

**Verify.** Paste a deployed URL into https://search.google.com/test/rich-results
— no errors.

### 1.3 Downloadable CV

**Already built.** `cvHref()` in `lib/cv.ts` renders the "Download CV" button
on `/about` as soon as `public/cv.pdf` exists.

**Jan does:** export the CV to PDF and strip its metadata (author, software,
edit history): in Adobe Acrobat *File → Properties*, or with
`exiftool -all:all= cv.pdf`. Save as `public/cv.pdf`.

**Verify.** `/about` shows the button; the download opens the PDF.

### 1.4 Book-a-call button

**Why.** Clients who are ready want a slot, not an email thread.

**How.**

- `lib/site.ts` — add `bookingUrl: null as string | null` with a NEEDS
  comment, like `visitsApi`.
- A "Book a 30-min call" button (external link, `rel="noreferrer noopener"`)
  in: the home hero next to "Get in touch" (`components/home/hero.tsx`), the
  Services page CTA, and the Contact page. Renders nothing while `null`.
- Style: the existing outline pill used for secondary CTAs; `data-magnetic`.

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
