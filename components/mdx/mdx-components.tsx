import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Element styling for case-study prose.
 *
 * Mapped per element rather than through a typography plugin, so the prose
 * uses the same tokens as every other surface and cannot drift into a
 * second type scale.
 */

function A({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const cls =
    "text-text underline decoration-line-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cls}
      {...rest}
    >
      {children}
    </a>
  );
}

export const mdxComponents = {
  h2: (p: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-14 font-display text-xl font-semibold tracking-tight first:mt-0"
      {...p}
    />
  ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-10 font-display text-lg font-semibold tracking-tight"
      {...p}
    />
  ),
  p: (p: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-4 leading-relaxed text-text-2" {...p} />
  ),
  ul: (p: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mt-4 flex list-disc flex-col gap-2 pl-5 text-text-2 marker:text-text-3"
      {...p}
    />
  ),
  ol: (p: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-text-2 marker:text-text-3"
      {...p}
    />
  ),
  li: (p: ComponentPropsWithoutRef<"li">) => (
    <li className="pl-1 leading-relaxed" {...p} />
  ),
  strong: (p: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-text" {...p} />
  ),
  a: A,
  code: (p: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text"
      {...p}
    />
  ),
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-6 border-l-2 border-accent pl-5 text-text-2"
      {...p}
    />
  ),
  hr: () => <hr className="my-12 border-line" />,
};
