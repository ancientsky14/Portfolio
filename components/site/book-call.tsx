import { CalendarDays } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Book a 30-min call" — for a client who is ready to talk, rather than
 * start an email thread. Opens Jan's Cal.com event (SITE.bookingUrl).
 *
 * Renders nothing until that link is set, and nothing if it is not https —
 * a booking button that 404s, or leaves the site over plain http, is worse
 * than none. The outline pill of the site's secondary CTAs; `className`
 * adjusts only its spacing to sit with the buttons beside it.
 */
export function BookCall({ className }: { className?: string }) {
  const href = SITE.bookingUrl;
  if (!href?.startsWith("https://")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      data-magnetic
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-line-2 bg-surface py-3 pl-4 pr-5 text-sm font-semibold text-text transition-colors hover:border-accent",
        className,
      )}
    >
      <CalendarDays
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="text-accent"
      />
      Book a 30-min call
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
