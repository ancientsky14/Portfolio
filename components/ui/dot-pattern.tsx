import { cn } from "@/lib/utils";

/**
 * Dot pattern — after Magic UI's Dot Pattern, re-tokenized.
 *
 * What changed from the registry version, and why:
 *
 *   · One SVG <pattern>, not one <motion.circle> per dot. The original
 *     renders width×height/256 DOM nodes and re-renders all of them on every
 *     resize — several thousand nodes on a wide screen, for a texture.
 *   · Server Component. No `motion`, no state, no resize listener; the
 *     browser tiles the pattern at any size for free.
 *   · Colour is `currentColor` driven by a token class, so it follows the
 *     theme. The original hardcoded `text-neutral-400/80`.
 *   · The glow animation is gone. Rule 6: the Archipelago is the showpiece;
 *     a texture that pulses competes with it.
 *
 * `id` must be unique per page, because SVG pattern ids are document-global.
 */

export function DotPattern({
  id,
  className,
  gap = 22,
  radius = 1,
  fade = true,
}: {
  id: string;
  className?: string;
  gap?: number;
  radius?: number;
  /** Radial fade to transparent at the edges, so the texture has no hard border. */
  fade?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 h-full w-full text-line-2",
        className,
      )}
      style={
        fade
          ? {
              maskImage:
                "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%)",
            }
          : undefined
      }
    >
      <defs>
        <pattern
          id={id}
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={radius} cy={radius} r={radius} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
