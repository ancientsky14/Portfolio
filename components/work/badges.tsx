import { CodeXml, Layers, MonitorSmartphone, type LucideIcon } from "lucide-react";
import type { WorkMeta } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Platform, status and version, as a row of small badges.
 *
 * Read straight from each case study's frontmatter, so the work index, the
 * case-study header and the home bento can never disagree about what a
 * project is or where it stands. A status of "In development" gets a
 * neutral dot rather than the green one — a dot is a claim.
 */

const PLATFORM_ICON: Record<NonNullable<WorkMeta["platform"]>, LucideIcon> = {
  Desktop: MonitorSmartphone,
  Web: CodeXml,
  Platform: Layers,
};

const PILL =
  "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-text";

export function WorkBadges({
  w,
  className,
}: {
  w: Pick<WorkMeta, "platform" | "status" | "version">;
  className?: string;
}) {
  if (!w.platform && !w.status && !w.version) return null;

  const Icon = w.platform ? PLATFORM_ICON[w.platform] : null;
  const live = w.status ? !/develop|testing/i.test(w.status) : false;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {w.platform && Icon ? (
        <li className={PILL}>
          <Icon
            size={13}
            strokeWidth={1.75}
            aria-hidden="true"
            className="text-accent"
          />
          {w.platform}
        </li>
      ) : null}
      {w.status ? (
        <li className={PILL}>
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", live ? "bg-ok" : "bg-line-2")}
          />
          {w.status}
        </li>
      ) : null}
      {w.version ? (
        <li className={cn(PILL, "font-mono")}>v{w.version}</li>
      ) : null}
    </ul>
  );
}
