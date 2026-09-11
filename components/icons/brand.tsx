import { SiDiscord, SiFacebook, SiGithub } from "@icons-pack/react-simple-icons";
import type { Social } from "@/lib/socials";

/**
 * Brand marks for the four social profiles.
 *
 * GitHub, Facebook and Discord come from Simple Icons, which ships each
 * brand's official path. LinkedIn is not in Simple Icons — LinkedIn asked
 * for its removal — so its mark is inlined here from the last published
 * Simple Icons path, which matches LinkedIn's own brand guidelines.
 *
 * Every mark renders in `currentColor`, never in its brand colour. Rule 1 of
 * the design contract: one accent. Four brand colours in the rail is four
 * accents.
 */

function LinkedInMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function BrandIcon({
  id,
  size = 16,
}: {
  id: Social["id"];
  size?: number;
}) {
  switch (id) {
    case "github":
      return <SiGithub size={size} color="currentColor" aria-hidden="true" />;
    case "facebook":
      return <SiFacebook size={size} color="currentColor" aria-hidden="true" />;
    case "discord":
      return <SiDiscord size={size} color="currentColor" aria-hidden="true" />;
    case "linkedin":
      return <LinkedInMark size={size} />;
  }
}
