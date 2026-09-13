import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";
import { VerifiedBadge } from "./verified-badge";

/**
 * The top bar below lg.
 *
 * Navigation moved to the bottom tab bar (components/shell/tab-bar.tsx),
 * after the reference, so this bar no longer has a menu button or a drawer.
 * What stays is what must be visible without scrolling: whose site this is,
 * the theme toggle, and "Get in touch" — one tap from any page.
 *
 * A Server Component now; the theme toggle is its only client part.
 */

export function MobileBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-accent font-mono text-2xs font-medium tracking-widest text-accent-ink"
          >
            JLR
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate font-display text-sm font-semibold tracking-tight">
              {SITE.name}
            </span>
            <VerifiedBadge size={14} />
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-text py-1.5 pl-3.5 pr-3 text-xs font-semibold text-ground"
          >
            Get in touch
            <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
