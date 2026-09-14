/**
 * The brief — what the contact form collects, the email it becomes, and the
 * checks it has to pass. One module for both ends:
 *
 *   · components/contact/brief-form.tsx composes the email with it — for the
 *     mailto: path, and as the fallback when the Worker cannot be reached;
 *   · workers/contact validates the POST with it and sends the same email.
 *
 * So what lands in the inbox reads the same whichever way it came. Pure
 * TypeScript — no Next, no DOM, no Workers APIs — because the Worker bundles
 * this file directly.
 */

export type BriefMode = "project" | "role";

export type Brief = {
  mode: BriefMode;
  name: string;
  /** Required by the Worker (it becomes Reply-To); the mailto: path has none. */
  email: string;
  company: string;
  // A project
  what: string;
  users: string;
  timeline: string;
  budget: string;
  // A job opportunity
  title: string;
  type: string;
  setup: string;
  details: string;
};

/** Character limits — the form's maxLength and the Worker's check. */
export const BRIEF_LIMITS = {
  name: 120,
  email: 254,
  company: 120,
  title: 120,
  users: 300,
  /** A dropdown's value. Not an enum on purpose: the Worker should not have
   *  to change when a label in the form does. */
  choice: 60,
  /** "What do you want built?" and "Details". */
  text: 5000,
} as const;

type Field = Exclude<keyof Brief, "mode">;

const LIMIT: Record<Field, number> = {
  name: BRIEF_LIMITS.name,
  email: BRIEF_LIMITS.email,
  company: BRIEF_LIMITS.company,
  what: BRIEF_LIMITS.text,
  users: BRIEF_LIMITS.users,
  timeline: BRIEF_LIMITS.choice,
  budget: BRIEF_LIMITS.choice,
  title: BRIEF_LIMITS.title,
  type: BRIEF_LIMITS.choice,
  setup: BRIEF_LIMITS.choice,
  details: BRIEF_LIMITS.text,
};

const FIELDS = Object.keys(LIMIT) as Field[];

/** Free text that may run over several lines. Everything else is one line. */
const MULTILINE = new Set<Field>(["what", "details"]);

/**
 * Control characters. On one-line fields this includes CR and LF, and that
 * is the security boundary, not tidiness: the name, company and role title
 * go into the Subject and Reply-To headers, and the mail library writes
 * ASCII header values out unencoded — a "\r\n" there would add headers.
 */
const CONTROL_ONE_LINE = /[\u0000-\u001F\u007F]/;
const CONTROL_MULTILINE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

/** Deliberately plain: no quotes, brackets, commas or spaces anywhere, so the
 *  address is safe inside `"Name" <address>`. Real addresses pass. */
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

/** Markup is what spam bots send. A real brief can still say "a < b". */
const MARKUP = /<\s*\/?\s*(a|script|iframe|img|svg|object|embed|html|body|style|form|input|meta|link)\b|\bhref\s*=/i;

export type BriefCheck = { ok: true; brief: Brief } | { ok: false; error: string };

/** Everything the Worker accepts, or the first reason it does not. */
export function validateBrief(input: unknown): BriefCheck {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "expected an object" };
  }
  const raw = input as Record<string, unknown>;

  if (raw.mode !== "project" && raw.mode !== "role") {
    return { ok: false, error: "mode must be project or role" };
  }

  const brief = { mode: raw.mode } as Brief;
  for (const field of FIELDS) {
    const value = raw[field] ?? "";
    if (typeof value !== "string") return { ok: false, error: `${field} must be text` };
    const text = value.trim();
    if (text.length > LIMIT[field]) {
      return { ok: false, error: `${field} is longer than ${LIMIT[field]} characters` };
    }
    const control = MULTILINE.has(field) ? CONTROL_MULTILINE : CONTROL_ONE_LINE;
    if (control.test(text)) return { ok: false, error: `${field} has control characters` };
    if (MARKUP.test(text)) return { ok: false, error: `${field} looks like HTML` };
    brief[field] = text;
  }

  if (!brief.name) return { ok: false, error: "name is required" };
  if (!EMAIL.test(brief.email)) return { ok: false, error: "a valid email is required" };
  if (brief.mode === "project" && !brief.what) {
    return { ok: false, error: "what is required" };
  }
  if (brief.mode === "role" && (!brief.company || !brief.title)) {
    return { ok: false, error: "company and title are required" };
  }

  return { ok: true, brief };
}

/**
 * The email a brief becomes. The subjects are the ones the form has always
 * written, so a recruiter's message and a client's brief never land looking
 * alike. Missing answers leave their line out.
 */
export function composeBrief(b: Brief): { subject: string; body: string } {
  const project = b.mode === "project";

  const subject = project
    ? `Project brief — ${b.company || b.name}`
    : `Job opportunity — ${b.title}${b.company ? ` at ${b.company}` : ""}`;

  const lines: (string | false)[] = project
    ? [
        `Name: ${b.name}`,
        !!b.email && `Email: ${b.email}`,
        !!b.company && `Company / organisation: ${b.company}`,
        "",
        "What I want built:",
        b.what,
        "",
        !!b.users && `Who will use it: ${b.users}`,
        !!b.timeline && `Timeline: ${b.timeline}`,
        !!b.budget && `Budget: ${b.budget}`,
      ]
    : [
        `Name: ${b.name}`,
        !!b.email && `Email: ${b.email}`,
        `Company: ${b.company}`,
        `Role: ${b.title}`,
        !!b.type && `Type: ${b.type}`,
        !!b.setup && `Work setup: ${b.setup}`,
        ...(b.details ? ["", "Details:", b.details] : []),
      ];

  const body = lines
    .filter((l): l is string => l !== false)
    // No run of blank lines, and none at the end.
    .filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i < a.length - 1))
    .join("\n");

  return { subject, body };
}
