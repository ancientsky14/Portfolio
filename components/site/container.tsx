import { cn } from "@/lib/utils";

/**
 * The one horizontal rhythm for the whole site. Side padding is set here
 * and nowhere else, so the gutter can never be zeroed by a padding
 * shorthand further down the tree.
 */
export function Container({
  className,
  children,
  width = "default",
}: {
  className?: string;
  children: React.ReactNode;
  width?: "default" | "prose" | "wide";
}) {
  return (
    <div
      className={cn(
        // One gutter for the whole panel. `lg:px-12` matches the sections
        // written directly against the shell, so a page that uses Container
        // and one that does not line up at every width.
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        width === "prose" && "max-w-[68ch]",
        width === "default" && "max-w-5xl",
        width === "wide" && "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
