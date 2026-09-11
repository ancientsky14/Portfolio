import { Check } from "lucide-react";
import type { WorkDoc } from "@/lib/content";
import { ToolIcon } from "@/components/icons/tool-icon";

/**
 * The About card's figure — "the workbench". Replaced Jan's portrait on
 * 2026-09-11, at his request.
 *
 * Three layered windows built from tokens, no image: the LMIS browser with
 * its three deployments as tabs, the eBudget desktop window with its real
 * version, an update toast, and each product's status. Every label is read
 * from content/work/*.mdx, so the picture can never show a product, version
 * or status the case studies do not. The skeleton bars and the chart are
 * decoration and carry no values — nothing here is a metric.
 *
 * aria-hidden: it is a picture of facts the story column already states.
 * The layers rise in sequence (`data-reveal-group` + `data-reveal-depth`)
 * and the whole scene leans toward the pointer (`data-tilt-card`); under
 * reduced motion both resolve to the still, complete scene.
 */

type LmisDoc = WorkDoc & { deployments?: string[] };

const BARS = [38, 55, 46, 70, 62, 84, 100];

function Skeleton({ w, strong = false }: { w: string; strong?: boolean }) {
  return (
    <span
      style={{ width: w }}
      className={`block h-2 rounded-full ${strong ? "bg-text-3" : "bg-line"}`}
    />
  );
}

export function AboutScene({ work }: { work: WorkDoc[] }) {
  const lmis = work.find((w) => w.slug === "santol-lmis") as LmisDoc | undefined;
  const ebudget = work.find((w) => w.slug === "mgb-ebudget");
  const tabs = lmis?.deployments ?? [];

  return (
    <div
      aria-hidden="true"
      data-tilt-card
      data-reveal-group
      data-reveal-depth
      className="absolute inset-0 select-none"
    >
      {/* 1 — the LMIS browser, at the back */}
      <div className="absolute left-[6%] top-[13%] w-[78%] -rotate-3 overflow-hidden rounded-md border border-line bg-surface shadow-soft">
        <div className="flex items-end gap-1 border-b border-line bg-surface-2 px-2 pt-2">
          <span className="mb-2 mr-1.5 flex gap-1">
            <span className="size-1.5 rounded-full bg-line-2" />
            <span className="size-1.5 rounded-full bg-line-2" />
            <span className="size-1.5 rounded-full bg-line-2" />
          </span>
          {tabs.map((t, i) => (
            <span
              key={t}
              className={`truncate rounded-t-sm px-2.5 py-1 font-mono text-2xs ${
                i === 0 ? "bg-surface text-text" : "text-text-3"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <ToolIcon name="Next.js" size={12} brand />
          <span className="h-4 flex-1 rounded-full bg-surface-2" />
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          <Skeleton w="36%" strong />
          <Skeleton w="88%" />
          <Skeleton w="72%" />
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-10 rounded-sm border border-line bg-surface-2"
              />
            ))}
          </div>
          <Skeleton w="64%" />
        </div>
      </div>

      {/* 2 — the eBudget desktop window, in front */}
      <div className="absolute left-[18%] top-[40%] w-[74%] overflow-hidden rounded-md border border-line bg-surface shadow-soft">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
          <ToolIcon name="Tauri" size={13} brand />
          <span className="text-xs font-semibold text-text">
            {ebudget?.title ?? "eBudget"}
          </span>
          {ebudget?.version ? (
            <span className="font-mono text-2xs text-text-3">
              v{ebudget.version}
            </span>
          ) : null}
          <span className="ml-auto flex gap-1.5">
            <span className="size-2 rounded-sm bg-line-2" />
            <span className="size-2 rounded-sm bg-line-2" />
            <span className="size-2 rounded-sm bg-line-2" />
          </span>
        </div>
        <div className="flex">
          <div className="flex w-1/4 flex-col gap-2 border-r border-line p-2.5">
            <span className="h-3 rounded-sm bg-accent-soft" />
            <Skeleton w="80%" />
            <Skeleton w="64%" />
            <Skeleton w="72%" />
            <Skeleton w="56%" />
          </div>
          <div className="flex-1 p-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="flex flex-col gap-1.5 rounded-sm border border-line p-2">
                <Skeleton w="50%" />
                <Skeleton w="70%" strong />
              </span>
              <span className="flex flex-col gap-1.5 rounded-sm border border-line p-2">
                <Skeleton w="44%" />
                <Skeleton w="62%" strong />
              </span>
            </div>
            <div className="mt-3 flex h-20 items-end gap-1.5 border-b border-line">
              {BARS.map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t-sm ${
                    i === BARS.length - 1 ? "bg-accent" : "bg-accent/35"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 — product status, top right */}
      <div className="absolute right-[4%] top-[4%] w-44 rounded-md border border-line bg-surface p-3 shadow-soft">
        <p className="font-mono text-2xs uppercase tracking-widest text-text-3">
          Status
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {work.map((w) => {
            const live = w.status ? !/develop|testing/i.test(w.status) : false;
            return (
              <li
                key={w.slug}
                className="flex items-center justify-between gap-2 text-xs font-semibold text-text"
              >
                {w.title}
                <span
                  className={`size-2 rounded-full ${live ? "bg-ok" : "bg-line-2"}`}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* 4 — the update toast, bottom left */}
      {ebudget?.version ? (
        <div className="absolute bottom-[16%] left-[4%] flex items-center gap-2.5 rounded-md border border-line bg-surface py-2.5 pl-2.5 pr-4 shadow-soft">
          <span className="grid size-8 place-items-center rounded-sm bg-accent text-accent-ink">
            <Check size={16} strokeWidth={2.25} />
          </span>
          <span>
            <span className="block text-xs font-semibold text-text">
              Update installed
            </span>
            <span className="mt-0.5 block font-mono text-2xs text-text-3">
              v{ebudget.version} · signed release
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
