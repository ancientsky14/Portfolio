import { MARQUEE } from "@/lib/stack";
import { ToolIcon } from "@/components/icons/tool-icon";

/**
 * The tools strip — after the reference: a framed band with a label on the
 * left and a white inner row of tools, icon and name, split by hairlines.
 *
 * The row loops (CSS, no JS — see `.marquee-*` in design/tokens.css) so ten
 * tools fit a band that shows five at a time.
 *
 * Accessibility, since a moving row is a classic failure:
 *   · the moving copy is `aria-hidden`; a static `sr-only` list carries the
 *     same names to a screen reader, once
 *   · it pauses on hover and on focus-within
 *   · reduced motion (OS setting or the site's panel) leaves it static
 *
 * The row is MARQUEE in lib/stack.ts — Jan's daily tools, then the stack;
 * each entry carries its receipt there.
 */

export function ToolsMarquee() {
  return (
    <section data-intro="rise" className="px-5 pb-5 sm:px-8 lg:px-12">
      <div
        data-reveal
        className="frame flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:gap-0"
      >
        <div className="shrink-0 px-3 pt-1 lg:w-56 lg:border-r lg:border-line lg:pt-0">
          <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
            In every build
          </p>
          <h2 className="mt-1 font-display text-lg font-bold tracking-tight">
            Tools I ship with
          </h2>
        </div>

        <div className="marquee marquee-mask min-w-0 flex-1 overflow-hidden rounded-lg border border-line bg-surface shadow-soft lg:ml-4">
          <ul
            aria-hidden="true"
            className="marquee-track flex w-max items-center"
          >
            {[...MARQUEE, ...MARQUEE].map((t, i) => (
              <li
                key={`${t.name}-${i}`}
                className="inline-flex items-center gap-3 whitespace-nowrap border-r border-line px-7 py-4 text-sm font-semibold text-text"
              >
                <ToolIcon name={t.name} size={18} brand />
                {t.name}
              </li>
            ))}
          </ul>

          <ul className="sr-only">
            {MARQUEE.map((t) => (
              <li key={t.name}>{t.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
