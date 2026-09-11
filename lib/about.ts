import {
  Atom,
  GraduationCap,
  MapPin,
  Network,
  Rocket,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * The About card — its story, its role rows and its credential chips.
 *
 * Laid out after the reference's About card (portfolio.brewedops.cloud):
 * a two-tone story headline, numbered role rows with tool icons, and
 * credential chips. The layout is copied; the claims are not. Each one here
 * is a thing a client will hold Jan to, so the story and the credentials
 * carry the repo's usual gate:
 *
 *   confirmed: true   — Jan has stated this. Renders.
 *   confirmed: false  — does NOT render.
 *
 * Until Jan's story is in, the card renders a fallback written only from
 * what the case studies already prove (see components/about/about-card.tsx).
 */

export type Story = {
  /** The bold half of the headline. */
  lead: string | null;
  /** The grey half that follows it. */
  rest: string | null;
  /** The paragraph under the headline. */
  body: string | null;
  confirmed: boolean;
};

// NEEDS: Jan's story — years building, what he did before, why he builds.
// Asked for on 2026-09-11; not yet given. Fill all three fields, then flip
// `confirmed`.
export const STORY: Story = {
  lead: null,
  rest: null,
  body: null,
  confirmed: false,
};

/** Jan's story, or null while it is still a NEEDS. */
export function confirmedStory(): {
  lead: string;
  rest: string;
  body: string;
} | null {
  const { lead, rest, body, confirmed } = STORY;
  return confirmed && lead && rest && body ? { lead, rest, body } : null;
}

export type Role = {
  title: string;
  /** Names from lib/stack.ts, drawn by ToolIcon. */
  tools: string[];
  /** The case study this row proves itself with. */
  slug?: string;
  /** Shown when there is no case study behind the row. */
  note?: string;
  receipt: string;
};

export const ROLES: Role[] = [
  {
    title: "Web apps & platforms",
    tools: ["Next.js", "React", "Supabase", "Cloudflare Workers"],
    slug: "santol-lmis",
    receipt: "LMIS case study — stack in its frontmatter",
  },
  {
    title: "Desktop apps",
    tools: ["Tauri", "Rust", "SQLite", "PostgreSQL"],
    slug: "mgb-ebudget",
    receipt: "eBudget case study — stack in its frontmatter",
  },
  {
    title: "Multi-site platforms",
    tools: ["React", "PocketBase", "Docker"],
    slug: "sentro",
    receipt: "SENTRO case study — stack in its frontmatter",
  },
  {
    title: "AI-assisted delivery",
    tools: ["Claude Code", "Codex", "n8n", "VS Code"],
    note: "My daily workflow",
    receipt: "WORKFLOW in lib/stack.ts — Jan, 2026-09-11",
  },
];

export type Credential = {
  title: string;
  meta: string;
  icon: LucideIcon;
  /** Issuer's credential ID, where there is one. Shown on hover. */
  id?: string;
  confirmed: boolean;
  receipt: string;
};

// Working hours are deliberately absent: the reference says "US hours", and
// nothing on file says Jan works to any timezone but his own.
export const CREDENTIALS: Credential[] = [
  {
    title: "Based in the Philippines",
    meta: "GMT+8",
    icon: MapPin,
    confirmed: true,
    receipt: "the About copy since v1; the Philippines is UTC+8",
  },
  {
    title: "BS Computer Science",
    meta: "ISPSC · Networking & telecom",
    icon: GraduationCap,
    confirmed: true,
    receipt:
      "LinkedIn Education, screenshot from Jan 2026-09-11 — Ilocos Sur Polytechnic State College, BS Computer Science, Computer Systems Networking and Telecommunications",
  },
  {
    title: "Cisco Cybersecurity Specialist",
    meta: "Cisco NetAcad · Feb 2025",
    icon: ShieldCheck,
    confirmed: true,
    receipt: "LinkedIn Licenses & certifications, screenshot from Jan 2026-09-11",
  },
  {
    title: "Network Technician Career Path",
    meta: "Cisco · Nov 2025",
    icon: Network,
    id: "7eb07add-e42b-4681-9efa-17d7438a810e",
    confirmed: true,
    receipt: "LinkedIn Licenses & certifications, screenshot from Jan 2026-09-11",
  },
  {
    title: "Quantum Computing & Blockchain Lecture Series",
    meta: "QCSP · Jul 2025",
    icon: Atom,
    id: "29011535575384",
    confirmed: true,
    receipt:
      "LinkedIn Licenses & certifications, screenshot from Jan 2026-09-11 — Certificate of Completion, Quantum Computing Society of the Philippines",
  },
];

export function confirmedCredentials(): Credential[] {
  return CREDENTIALS.filter((c) => c.confirmed);
}

/** The shipped chip's icon — its text is counted from the case studies. */
export const SHIPPED_ICON: LucideIcon = Rocket;
