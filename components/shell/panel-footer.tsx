import Link from "next/link";
import { SITE } from "@/lib/site";
import { NAV } from "./nav-links";
import { SocialLinks } from "./social-links";

/**
 * The panel's footer.
 *
 * Deliberately thin. On desktop the rail already carries the name, the role
 * line, the availability state, the socials and the copyright, so repeating
 * all of it here would be the third copy on screen. What the footer owes the
 * reader is the one thing the rail cannot guarantee: a plain, selectable
 * email address that works with JavaScript off.
 */

export function PanelFooter() {
  return (
    // `.panel-footer` is hidden on the fitted home page (design/tokens.css),
    // where the rail's copyright stands in for it.
    <footer className="panel-footer border-t border-line px-5 py-10 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {/* Hidden on /contact, where the same block sits in the page's own
            column (design/tokens.css, `.panel-footer__cta`). */}
        <div className="panel-footer__cta">
          <p className="font-mono text-2xs uppercase tracking-widest text-text-3">
            Start a project
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-2 block font-display text-xl font-semibold tracking-tight text-text transition-colors hover:text-accent"
          >
            {SITE.email}
          </a>
          <p className="mt-2 text-sm text-text-2">
            Or use the form on the contact page. Both reach the same inbox.
          </p>
        </div>

        <nav aria-label="Footer" className="lg:ml-auto lg:text-right">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
            {NAV.filter((l) => l.href !== "/").map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-text-2 transition-colors hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <SocialLinks className="mt-5 lg:justify-end" />

          <p className="mt-5 font-mono text-2xs uppercase tracking-widest text-text-3">
            © {new Date().getFullYear()} {SITE.name} · Built in the Philippines
          </p>
          <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-text-3">
            {SITE.credit.text}{" "}
            <a
              href={SITE.credit.href}
              target="_blank"
              rel="noopener"
              className="underline decoration-line-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              {SITE.credit.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </nav>
      </div>
    </footer>
  );
}
