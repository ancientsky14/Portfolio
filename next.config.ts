import type { NextConfig } from "next";

/**
 * Built for GitHub Pages, which serves static files and runs no server.
 *
 * What that costs, so it is not rediscovered later:
 *   · no Route Handlers, no Server Actions, no `resend` — the contact form
 *     posts to a third-party endpoint or falls back to `mailto:`
 *   · no next/image optimisation (`unoptimized`), so ship sized assets
 *   · no ISR, no middleware, no dynamic `generateMetadata` at request time
 *
 * The repo is `ancientsky14/Portfolio`, so Pages serves it from
 * https://ancientsky14.github.io/Portfolio/ and every asset needs the
 * `/Portfolio` prefix. Set `NEXT_PUBLIC_BASE_PATH=""` if the site ever moves
 * to a custom domain or to an `ancientsky14.github.io` repo, where it is
 * served from the root instead.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,

  // GitHub Pages resolves /work/ to /work/index.html; without this a refresh
  // on any route but the home page 404s.
  trailingSlash: true,

  images: { unoptimized: true },

  // Dev-only badge. Default is bottom-left, where the accessibility button
  // sits on desktop (components/shell/a11y-panel.tsx). Never ships.
  devIndicators: { position: "bottom-right" },

  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
  },
};

export default nextConfig;
