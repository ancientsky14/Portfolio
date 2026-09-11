/**
 * How a project runs — the process section on /services (#process), the
 * method row above it (lib/services.ts), and the "Updates" card on the home
 * page.
 *
 * These steps are promises the site makes on Jan's behalf to someone who
 * will hold him to them in a contract. That puts them in the same class as
 * a metric: not mine to invent. So they carry the same gate the rest of the
 * repo uses.
 *
 *   confirmed: true   — Jan has stated this. Renders.
 *   confirmed: false  — a draft of how it probably runs. Does NOT render.
 *
 * Any new step starts at `false`. Do not flip a flag without Jan reading the
 * text first — drafts are written to be plausible, which is exactly what
 * makes leaving them unread dangerous.
 *
 * Changed 2026-09-11 (Jan): the "working session before a price" step and
 * the "clients own the accounts" step are removed. Do not add ownership or
 * payment terms here — they are not stated anywhere on the site.
 */

export type Step = {
  n: number;
  title: string;
  body: string;
  confirmed: boolean;
};

export const STEPS: Step[] = [
  {
    n: 1,
    title: "A fixed scope, written to be approved",
    body: "A scope and a price your approval process can sign off without a second round of questions.",
    confirmed: true, // Jan, 2026-09-11
  },
  {
    n: 2,
    title: "A staging link from the first week",
    body: "You watch it get built. Feedback lands while changing something is still cheap, not at handover when it is not.",
    confirmed: true, // Jan, 2026-09-11
  },
  {
    n: 3,
    title: "Training the people who will use it",
    body: "The people who use it every day, not only the admin. Written documentation stays with you afterwards.",
    confirmed: true, // Jan, 2026-09-11
  },
  {
    n: 4,
    title: "Updates after launch",
    body: "I stay on after launch. Fixes, updates and new features come from the person who built it — no handover to a stranger.",
    confirmed: true, // Jan, 2026-09-11: he does the updates
  },
];

/** Steps Jan has actually confirmed. The rest do not render. */
export function confirmedSteps(): Step[] {
  return STEPS.filter((s) => s.confirmed);
}