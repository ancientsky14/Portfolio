import { cn } from "@/lib/utils";

/**
 * The check badge beside Jan's name, in the rail and the mobile bar
 * (Jan's request, 2026-09-13).
 *
 * Deliberately NOT a platform's verified mark — not Meta's, not X's. Those
 * say a platform confirmed who someone is, which nobody has done for a
 * personal site, and they are the platforms' trademarks. This is a generic
 * scalloped check, and its label says only what it is.
 *
 * Army green, from the `--verified` token (design/tokens.css): an exception
 * to the one-accent rule, recorded there.
 */
export function VerifiedBadge({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label="Real person, real projects"
      className={cn("verified-badge shrink-0", className)}
    >
      <title>Real person, real projects</title>
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        // The fallback is the light-theme army green, so the badge is never
        // black if the token is missing; `--verified` swaps in the olive on
        // the dark theme.
        fill="var(--verified, #4b5320)"
        stroke="var(--verified, #4b5320)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke="#fff"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}