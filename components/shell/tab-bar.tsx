"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV } from "./nav-links";

/**
 * Mobile tab bar — after the reference: below lg, navigation lives in a
 * floating bar at the bottom of the screen, where a thumb already is,
 * instead of behind a menu button.
 *
 * Every route is one tap from every page. It floats clear of the home
 * indicator (safe-area inset), and the panel content carries bottom padding
 * so it never covers the footer. Hidden from lg up, where the rail does the
 * same job.
 */

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      data-intro="tabbar"
      className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-1 rounded-full border border-line bg-surface/90 p-1.5 shadow-soft backdrop-blur-md">
        {NAV.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          const Icon = l.icon;

          return (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-full py-1.5 text-2xs font-semibold transition-colors",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-text-3 hover:text-text",
                )}
              >
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
