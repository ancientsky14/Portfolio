import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getWork, type WorkDoc } from "@/lib/content";
import { getLab, type LabDoc } from "@/lib/lab";
import { OG_SIZE } from "@/lib/og";
import { posterFile } from "@/lib/shots";
import { SITE } from "@/lib/site";

/**
 * The share-card layouts, rendered by app/og/[card]/route.tsx.
 *
 * `ImageResponse` has no CSS variables and no stylesheet, so the design
 * contract is applied by hand: the hex values below are the light theme's
 * tokens in design/tokens.css (the site is light-first) — change a token
 * there and it must change here. One accent. Radii from the scale (28 for the
 * poster frame's outer edge, 999 for pills). The one shadow, on the frame.
 *
 * Every word on a card is a checked fact already on the page it previews:
 * SITE, a case study's frontmatter, a lab note's frontmatter. No figures.
 *
 * Fonts are the site's three faces as static TTFs in ./fonts (next/og reads
 * TTF, OTF or WOFF — not the WOFF2 next/font serves). Licences alongside.
 */

const C = {
  ground: "#f3f6f2",
  surface: "#ffffff",
  surface2: "#e9efeb",
  text: "#0f1f1a",
  text2: "#3d524b",
  text3: "#6d827a",
  line: "#d5e0da",
  line2: "#b7c7bf",
  accent: "#0b6e5c",
  accentSoft: "#daeee7",
  ok: "#0b6e5c",
} as const;

/* --shadow-soft, with its color-mix() resolved against --text. */
const SHADOW_SOFT =
  "0 1px 2px rgba(15, 31, 26, 0.05), 0 10px 28px -14px rgba(15, 31, 26, 0.22)";

/* The hero's colour wash (components/home/hero.tsx): accent-soft top right,
   a trace of sand bottom left. */
const WASH =
  "radial-gradient(circle at 88% 8%, #daeee7 0%, rgba(218, 238, 231, 0) 55%), radial-gradient(circle at 6% 100%, rgba(179, 129, 63, 0.14) 0%, rgba(179, 129, 63, 0) 45%)";

const FONT_DIR = path.join(process.cwd(), "app", "_og", "fonts");

type Font = {
  name: string;
  data: Buffer;
  weight: 400 | 600 | 800;
  style: "normal";
};

let fontsLoading: Promise<Font[]> | undefined;

function fonts(): Promise<Font[]> {
  fontsLoading ??= Promise.all(
    (
      [
        ["Bricolage", "BricolageGrotesque-ExtraBold-opsz96.ttf", 800],
        ["Public Sans", "PublicSans-Regular.ttf", 400],
        ["Public Sans", "PublicSans-SemiBold.ttf", 600],
        ["JetBrains Mono", "JetBrainsMono-SemiBold.ttf", 600],
      ] as const
    ).map(async ([name, file, weight]) => ({
      name,
      data: await readFile(path.join(FONT_DIR, file)),
      weight,
      style: "normal" as const,
    })),
  );
  return fontsLoading;
}

/** The site's address as it reads in a browser bar, without the scheme. */
const HOST = SITE.url.replace(/^https?:\/\//, "");

const DISPLAY = "Bricolage";
const SANS = "Public Sans";
const MONO = "JetBrains Mono";

function Eyebrow({
  children,
  size = 22,
  marginTop = 0,
}: {
  children: string;
  size?: number;
  marginTop?: number;
}) {
  return (
    <div
      style={{
        marginTop,
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.3,
        letterSpacing: size / 10,
        textTransform: "uppercase",
        color: C.accent,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, dot }: { children: string; dot?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 18px",
        borderRadius: 999,
        border: `1px solid ${C.line}`,
        background: C.surface,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 22,
        color: C.text,
      }}
    >
      {dot ? (
        <div
          style={{ width: 9, height: 9, borderRadius: 999, background: dot }}
        />
      ) : null}
      {children}
    </div>
  );
}

/** Name on the left, address on the right — the bottom edge of every card. */
function Footer({ left }: { left: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${C.line}`,
        paddingTop: 26,
        fontSize: 22,
      }}
    >
      <div style={{ fontFamily: SANS, fontWeight: 600, color: C.text }}>
        {left}
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 600, color: C.text3 }}>
        {HOST}
      </div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px 72px 48px",
        backgroundColor: C.ground,
        backgroundImage: WASH,
        color: C.text,
      }}
    >
      {children}
    </div>
  );
}

function SiteCard() {
  return (
    <Frame>
      <Eyebrow>{SITE.role}</Eyebrow>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1,
            letterSpacing: -2.5,
          }}
        >
          {SITE.name}
        </div>
        <div
          style={{
            marginTop: 30,
            maxWidth: 920,
            fontFamily: SANS,
            fontSize: 36,
            lineHeight: 1.35,
            color: C.text2,
          }}
        >
          {SITE.line}
        </div>
        <div style={{ display: "flex", marginTop: 36 }}>
          <Pill dot={C.accent}>{SITE.availability}</Pill>
        </div>
      </div>
      <Footer left={SITE.name} />
    </Frame>
  );
}

function WorkCard({ w, poster }: { w: WorkDoc; poster: string | null }) {
  // The same rule as components/work/badges.tsx: a green dot is a claim, so
  // "In development" and "In testing" get the neutral one.
  const live = w.status ? !/develop|testing/i.test(w.status) : false;

  return (
    <Frame>
      <div style={{ display: "flex", flexGrow: 1, gap: 56 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            flexBasis: 0,
            minWidth: 0,
          }}
        >
          {/* The case-study header's order: title, then what it stands for. */}
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {w.title}
          </div>
          {w.fullName ? (
            <Eyebrow size={20} marginTop={18}>
              {w.fullName}
            </Eyebrow>
          ) : null}
          {w.subtitle ? (
            <div
              style={{
                display: "block",
                lineClamp: 3,
                marginTop: 20,
                fontFamily: SANS,
                fontSize: 30,
                lineHeight: 1.3,
                color: C.text2,
              }}
            >
              {w.subtitle}
            </div>
          ) : null}
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "auto" }}
          >
            {w.platform ? <Pill>{w.platform}</Pill> : null}
            {w.status ? (
              <Pill dot={live ? C.ok : C.line2}>{w.status}</Pill>
            ) : null}
            {w.version ? <Pill>{`v${w.version}`}</Pill> : null}
          </div>
        </div>

        {poster ? (
          <div
            style={{
              display: "flex",
              alignSelf: "center",
              padding: 10,
              borderRadius: 28,
              border: `1px solid ${C.line}`,
              background: C.surface2,
              boxShadow: SHADOW_SOFT,
            }}
          >
            <img
              src={poster}
              width={512}
              height={320}
              alt=""
              style={{ borderRadius: 20, objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
        <Footer left={`${SITE.name} · Case study`} />
      </div>
    </Frame>
  );
}

function LabCard({ e }: { e: LabDoc }) {
  return (
    <Frame>
      <Eyebrow>{`Lab · ${e.kind} · ${e.year}`}</Eyebrow>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <div
          style={{
            display: "block",
            lineClamp: 2,
            maxWidth: 1000,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 76,
            lineHeight: 1.04,
            letterSpacing: -1.5,
          }}
        >
          {e.title}
        </div>
        <div
          style={{
            display: "block",
            lineClamp: 3,
            marginTop: 26,
            maxWidth: 980,
            fontFamily: SANS,
            fontSize: 30,
            lineHeight: 1.4,
            color: C.text2,
          }}
        >
          {e.blurb}
        </div>
      </div>
      <Footer left={SITE.name} />
    </Frame>
  );
}

async function dataUrl(file: string): Promise<string> {
  const type = /\.png$/i.test(file) ? "image/png" : "image/jpeg";
  return `data:${type};base64,${(await readFile(file)).toString("base64")}`;
}

/**
 * The card for an id from ogCardIds() in lib/og.ts, or null for an id that
 * names nothing.
 */
export async function renderCard(id: string): Promise<ImageResponse | null> {
  let card: React.ReactElement;

  if (id === "site") {
    card = <SiteCard />;
  } else if (id.startsWith("work-")) {
    const w = getWork(id.slice("work-".length));
    if (!w) return null;
    const file = posterFile(w.slug);
    card = <WorkCard w={w} poster={file ? await dataUrl(file) : null} />;
  } else if (id.startsWith("lab-")) {
    const e = getLab(id.slice("lab-".length));
    if (!e) return null;
    card = <LabCard e={e} />;
  } else {
    return null;
  }

  return new ImageResponse(card, { ...OG_SIZE, fonts: await fonts() });
}
