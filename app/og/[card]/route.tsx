import { ogCardIds } from "@/lib/og";
import { renderCard } from "@/app/_og/cards";

/**
 * Share cards, rendered once at build time and written to out/og/<card>.png.
 *
 * The one Route Handler on the site, and it is not a server: `force-static`
 * with `dynamicParams = false` means the export calls it for each card in
 * generateStaticParams() and keeps the bytes as a file. Nothing runs when a
 * visitor asks for the image. The `.png` in the param is what gives the file
 * its extension, so GitHub Pages serves it as image/png — see lib/og.ts.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ogCardIds().map((id) => ({ card: `${id}.png` }));
}

// Params typed by hand, as the pages do: the global RouteContext helper is
// generated into .next/, which CI's typecheck runs without.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ card: string }> },
) {
  const { card } = await params;
  const res = card.endsWith(".png")
    ? await renderCard(card.slice(0, -".png".length))
    : null;
  return res ?? new Response("Not found", { status: 404 });
}
