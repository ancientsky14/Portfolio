/**
 * Social profiles. One definition — the rail, the mobile drawer, the footer
 * and the contact page all read this list, so a link can never be right in
 * one place and stale in another.
 *
 * All four were given by Jan directly. Nothing here is guessed.
 *
 * `handle` is what gets shown when there is room; `label` is what a screen
 * reader announces and what the icon-only buttons carry as their accessible
 * name.
 */

export type Social = {
  id: "github" | "linkedin" | "facebook" | "discord";
  label: string;
  handle: string;
  href: string;
  /** Shown on the contact page as the reason to use this one. */
  note: string;
};

export const SOCIALS: Social[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "ancientsky14",
    href: "https://github.com/ancientsky14",
    note: "The code, including this site.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Jan Luigi Rivera",
    href: "https://www.linkedin.com/in/jan-luigi-rivera-604750320/",
    note: "Experience, roles and recommendations.",
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "ancientsky009",
    href: "https://www.facebook.com/ancientsky009",
    note: "Quick messages and project enquiries.",
  },
  {
    id: "discord",
    label: "Discord",
    // Discord user IDs are not resolvable to a name without the API, so the
    // ID is the handle. discord.com/users/<id> opens the profile for anyone
    // signed in.
    handle: "468025148126134274",
    href: "https://discord.com/users/468025148126134274",
    note: "Fastest for a quick technical back-and-forth.",
  },
];
