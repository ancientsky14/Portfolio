import {
  BellRing,
  CircleCheck,
  Database,
  Cloud,
  Monitor,
  Network,
  RefreshCw,
  ShieldCheck,
  Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * "One release. Every desk updated." — eBudget's update path, drawn as a
 * workflow after the reference's live automation diagram.
 *
 * Every node is in the eBudget case study's CONFIRMED block: signed
 * installer and in-app updater that checks on launch; the hosting PC serves
 * the installer to the office network; every PC connects to the shared
 * Postgres database on Supabase (no LAN pairing since the 2026-08-30 move).
 * Nothing here claims CI or offline use — neither is confirmed
 * (content/work/04-mgb-ebudget.mdx). eBudget is in testing, not in use.
 *
 * Server Component. The connectors are SVG paths in a 1000×360 box; the
 * nodes are HTML placed on the same grid. page-motion.tsx sends glowing
 * dots along each `[data-flow-path]` (MotionPath) and pulses the node a
 * dot reaches (`data-flow-to` → `data-flow-node`). Under reduced motion the
 * diagram is simply still. Narrow screens scroll it sideways.
 */

type Node = {
  id: string;
  x: number;
  y: number;
  icon: LucideIcon;
  title: string;
  sub: string;
  tone?: "start" | "end";
};

const NODES: Node[] = [
  { id: "tag", x: 90, y: 90, icon: Tag, title: "Release tagged", sub: "New version", tone: "start" },
  { id: "sign", x: 290, y: 90, icon: ShieldCheck, title: "Signed installer", sub: "Built and signed" },
  { id: "check", x: 490, y: 90, icon: RefreshCw, title: "Checks on launch", sub: "Every installed copy" },
  { id: "offer", x: 690, y: 90, icon: BellRing, title: "Update offered", sub: "One click to accept" },
  { id: "done", x: 890, y: 90, icon: CircleCheck, title: "Installed", sub: "Same version everywhere", tone: "end" },
  { id: "pc", x: 170, y: 250, icon: Monitor, title: "New office PC", sub: "First install", tone: "start" },
  { id: "lan", x: 440, y: 250, icon: Network, title: "Installer from host", sub: "Over the office network" },
  { id: "cloud", x: 630, y: 250, icon: Cloud, title: "Connects to the cloud", sub: "Postgres on Supabase" },
  { id: "db", x: 860, y: 250, icon: Database, title: "Same records", sub: "One shared database", tone: "end" },
];

/** d, the order a dot runs it in, and the node it arrives at. */
// The branch leaves the signed installer's right edge and bends down to
// the host node, clear of the "Signed installer" label at every width.
const PATHS: { d: string; order: number; to: string; dashed?: boolean }[] = [
  { d: "M 90 90 L 290 90", order: 0, to: "sign" },
  { d: "M 290 90 L 490 90", order: 1, to: "check" },
  { d: "M 490 90 L 690 90", order: 2, to: "offer" },
  { d: "M 690 90 L 890 90", order: 3, to: "done" },
  { d: "M 318 90 C 400 90 440 150 440 222", order: 1, to: "lan", dashed: true },
  { d: "M 170 250 L 440 250", order: 1.4, to: "lan" },
  { d: "M 440 250 L 630 250", order: 2.4, to: "cloud" },
  { d: "M 630 250 L 860 250", order: 3.4, to: "db" },
];

const CHIPS: { label: string; icon: LucideIcon }[] = [
  { label: "Tauri updater", icon: RefreshCw },
  { label: "Signed releases", icon: ShieldCheck },
  { label: "Office network", icon: Network },
];

export function UpdateFlow() {
  return (
    <div className="mt-12 sm:mt-14">
      <div className="text-center">
        <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
          Live update flow
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-text">
          One release. Every desk updated.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-text-2">
          Tag a release and every installed copy offers it on its next
          launch. A new PC installs from the hosting PC, over the office
          network. From eBudget, now in testing.
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => {
            const Icon = c.icon;
            return (
              <li
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-text shadow-soft"
              >
                <Icon size={13} strokeWidth={2} aria-hidden="true" className="text-accent" />
                {c.label}
              </li>
            );
          })}
        </ul>
      </div>

      <figure className="mt-6 overflow-hidden rounded-lg border border-line bg-surface shadow-soft">
        <div className="relative flex items-center border-b border-line px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line-2" />
            <span className="size-2.5 rounded-full bg-line-2" />
            <span className="size-2.5 rounded-full bg-line-2" />
          </span>
          <figcaption className="absolute inset-x-0 text-center text-sm font-semibold text-text-2">
            Update flow — eBudget
          </figcaption>
        </div>

        {/* Scrolls sideways on phones, so it takes focus: arrow keys scroll
            it for a keyboard user. */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Update flow diagram, scrolls sideways"
          className="overflow-x-auto bg-surface-2"
        >
          <div
            data-flow
            className="relative mx-auto min-w-180"
            style={{ aspectRatio: "1000 / 360" }}
          >
            <p className="absolute left-4 top-3 hidden font-mono text-2xs uppercase tracking-widest text-text-3 sm:block">
              Every release
            </p>
            <p className="absolute left-4 top-[50%] hidden font-mono text-2xs uppercase tracking-widest text-text-3 sm:block">
              Every new desk
            </p>

            <svg
              aria-hidden="true"
              viewBox="0 0 1000 360"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
            >
              {PATHS.map((p) => (
                <path
                  key={p.d}
                  d={p.d}
                  data-flow-path
                  data-flow-order={p.order}
                  data-flow-to={p.to}
                  fill="none"
                  stroke={p.dashed ? "var(--accent)" : "var(--line-2)"}
                  strokeWidth={p.dashed ? 1.5 : 1.25}
                  strokeDasharray={p.dashed ? "6 6" : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <ol>
              {NODES.map((n) => {
                const Icon = n.icon;
                return (
                  <li
                    key={n.id}
                    className="absolute flex w-36 -translate-x-1/2 -translate-y-7 flex-col items-center text-center"
                    style={{ left: `${n.x / 10}%`, top: `${(n.y / 360) * 100}%` }}
                  >
                    <span
                      data-flow-node={n.id}
                      className={
                        n.tone === "start"
                          ? "grid size-14 place-items-center rounded-lg border border-accent bg-accent-soft text-accent shadow-soft"
                          : n.tone === "end"
                            ? "grid size-14 place-items-center rounded-lg border border-line bg-surface text-ok shadow-soft"
                            : "grid size-14 place-items-center rounded-lg border border-line bg-surface text-text shadow-soft"
                      }
                    >
                      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-xs font-semibold text-text">{n.title}</span>
                    <span className="text-2xs text-text-3">{n.sub}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </figure>
    </div>
  );
}