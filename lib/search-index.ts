import { NAV } from "@/components/shell/nav-links";
import { displayClient, getAllWork } from "@/lib/content";
import { getAllLab } from "@/lib/lab";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { cvHref } from "@/lib/cv";
import type { SearchEntry } from "@/lib/search";

/**
 * The Ctrl+K index, built at build time (server only — it reads content/).
 *
 * Everything in it is already on the site: page names, case-study titles
 * and their public facts (client names only through displayClient()),
 * lab notes, services, and the contact actions that exist. Nothing is
 * written here that a page does not already say.
 *
 * Writing is left out while lib/writing.ts is empty — there are no post
 * pages to land on.
 */
export function buildSearchIndex(): SearchEntry[] {
  const pages: SearchEntry[] = NAV.map((l) => ({
    id: `page-${l.href}`,
    group: "Pages",
    title: l.label,
    hint: l.hint,
    href: l.href,
  }));

  const work: SearchEntry[] = getAllWork().map((w) => ({
    id: `work-${w.slug}`,
    group: "Work",
    title: w.title,
    hint: w.fullName ?? w.subtitle,
    href: `/work/${w.slug}`,
    keywords: [
      w.subtitle,
      w.platform,
      w.status,
      displayClient(w),
      ...(w.stack ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  }));

  const lab: SearchEntry[] = getAllLab().map((e) => ({
    id: `lab-${e.slug}`,
    group: "Lab",
    title: e.title,
    hint: e.subtitle ?? e.kind,
    href: `/lab/${e.slug}`,
    keywords: [e.kind, e.blurb, ...(e.stack ?? [])].join(" "),
  }));

  // Services land on /services: the page that explains them. Each card's
  // own link (a case study) is its receipt, not its home.
  const services: SearchEntry[] = SERVICES.map((s) => ({
    id: `service-${s.name}`,
    group: "Services",
    title: s.title,
    hint: s.line,
    href: "/services",
    keywords: [s.name, s.badge, ...s.checks, ...s.tools].join(" "),
  }));

  const cv = cvHref();
  const actions: SearchEntry[] = [
    {
      id: "action-brief",
      group: "Actions",
      title: "Send a brief",
      hint: "A project or a job opportunity",
      href: "/contact",
      keywords: "contact hire message form",
    },
    {
      id: "action-email",
      group: "Actions",
      title: "Email me",
      hint: SITE.email,
      href: `mailto:${SITE.email}`,
      external: true,
      keywords: "contact email mail",
    },
    ...(SITE.bookingUrl?.startsWith("https://")
      ? [
          {
            id: "action-call",
            group: "Actions" as const,
            title: "Book a 30-min call",
            hint: "Opens Cal.com in a new tab",
            href: SITE.bookingUrl,
            external: true,
            keywords: "call meeting schedule calendar",
          },
        ]
      : []),
    ...(cv
      ? [
          {
            id: "action-cv",
            group: "Actions" as const,
            title: "Download CV",
            hint: "PDF",
            href: cv,
            external: true,
            keywords: "resume cv pdf recruiter",
          },
        ]
      : []),
  ];

  return [...pages, ...work, ...lab, ...services, ...actions];
}
