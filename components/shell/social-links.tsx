import { SOCIALS } from "@/lib/socials";
import { BrandIcon } from "@/components/icons/brand";
import { cn } from "@/lib/utils";

/**
 * The four profiles as icon buttons.
 *
 * Icon-only controls are the classic accessibility failure, so each one
 * carries its platform name as `aria-label` and as a `title` tooltip, and
 * the hit target is 36px — above the 24px WCAG 2.2 minimum, comfortable on
 * a phone.
 */

export function SocialLinks({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <ul className={cn("flex items-center gap-1.5", className)}>
      {SOCIALS.map((s) => (
        <li key={s.id}>
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${s.label} — ${s.handle} (opens in a new tab)`}
            title={s.label}
            className={cn(
              "grid place-items-center rounded-full border border-line text-text-3 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent",
              size === "sm" ? "size-8" : "size-9",
            )}
          >
            <BrandIcon id={s.id} size={size === "sm" ? 14 : 16} />
          </a>
        </li>
      ))}
    </ul>
  );
}
