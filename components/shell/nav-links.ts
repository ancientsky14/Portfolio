import {
  BriefcaseBusiness,
  FlaskConical,
  House,
  Layers,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/**
 * The one nav definition. The rail, the mobile drawer and the footer all
 * read it, so a route can never appear in one and not the other.
 *
 * `n` is the ordinal shown in the mobile drawer. `icon` leads each item in
 * the rail, the way the reference layout does it.
 */

export type NavLink = {
  n: string;
  href: string;
  label: string;
  /** Shown under the label in the mobile drawer only. */
  hint: string;
  icon: LucideIcon;
};

export const NAV: NavLink[] = [
  {
    n: "01",
    href: "/",
    label: "Home",
    hint: "What I build, and for whom",
    icon: House,
  },
  {
    n: "02",
    href: "/work",
    label: "Work",
    hint: "Four products, built end to end",
    icon: BriefcaseBusiness,
  },
  {
    n: "03",
    href: "/services",
    label: "Services",
    hint: "What an engagement covers",
    icon: Layers,
  },
  {
    n: "04",
    href: "/lab",
    label: "Lab",
    hint: "Experiments and notes",
    icon: FlaskConical,
  },
  {
    n: "05",
    href: "/about",
    label: "About",
    hint: "Who I am, how I work",
    icon: UserRound,
  },
  {
    n: "06",
    href: "/contact",
    label: "Contact",
    hint: "Start a project",
    icon: Send,
  },
];

// Social profiles live in lib/socials.ts, rendered by
// components/shell/social-links.tsx.
