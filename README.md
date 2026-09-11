# Portfolio

Full-stack product developer — web apps, desktop apps, and multi-site platforms.
Next.js 16 · TypeScript · Tailwind v4 · GSAP · Three.js (Phase 5).

The full build plan lives in the Claude artifact "Archipelago Portfolio Plan".
`PHASE-1.md` covers content and identity; this file covers running the thing.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

## Layout

```
app/                    routes — landing, work, lab, writing, about, contact
components/site/        shell — nav, footer, container, section stubs
lib/
  content.ts            typed frontmatter reader for content/work/*.mdx
  motion.ts             the motion signature: one easing, three durations
  utils.ts              cn()
content/
  positioning.md        the line, the proof strip, the voice rules
  work/*.mdx            three case study drafts
design/
  tokens.css            THE DESIGN CONTRACT — read before installing anything
```

## The design contract

`design/tokens.css` is not a suggestion. Every component pulled from
Magic UI, Aceternity or 21st.dev gets re-pointed at these tokens at install
time. Six rules, stated at the top of that file:

1. One accent. 2. Four radii. 3. One border treatment. 4. No shadows except
the focus ring. 5. One easing, three durations. 6. One showpiece per viewport.

There is also a kill list in there — twelve components that read instantly as
"AI-generated portfolio" in 2026. Don't install them.

## The permission gate

Case study frontmatter carries `clientCleared: false`. Every render goes
through `displayClient()` in `lib/content.ts`, which falls back to
`clientAnonymous` until you flip that boolean. So publishing a real client
name is one deliberate edit per file, not a find-and-replace you can forget.

Same principle for numbers: a metric with `value: null` renders no tile.
Nothing on this site displays a figure that wasn't supplied.

## Phase order

Phase 3 must look finished before Phase 4 starts. Phase 4 must be done before
Phase 5 starts. The hero is the fun part and the easiest thing to rebuild —
building it early is how the rest of the page ends up unfinished.

| Phase | | Status |
|---|---|---|
| 1 | Content & identity | drafts in, NEEDS blocks open |
| 2 | Foundations | this scaffold |
| 3 | Static landing — zero animation | next |
| 4 | Motion layer — Lenis + ScrollTrigger | |
| 5 | Archipelago hero — R3F | |
| 6 | Content routes — MDX, contact form | |
| 7 | Hardening — budgets, a11y, SEO | |

Deps for Phase 5 (`three`, `@react-three/fiber`, `@react-three/drei`) are
deliberately not installed yet — they stay out of the tree until the page
around them is finished.

## Deploy

Vercel, from `main`. Set the real domain in `SITE_URL` in `app/layout.tsx`
before launch — it drives OG tags and the sitemap.
