import type { MetadataRoute } from "next";
import { getWorkSlugs } from "@/lib/content";
import { SITE } from "@/lib/site";

// Required for `output: "export"` — generated once at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/work",
    "/services",
    "/about",
    "/contact",
    "/lab",
    "/writing",
    ...getWorkSlugs().map((s) => `/work/${s}`),
  ];

  // trailingSlash: true in next.config.ts — match it, or every URL in the
  // sitemap is a redirect.
  return routes.map((r) => ({
    url: `${SITE.url}${r}/`,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : r.startsWith("/work") ? 0.8 : 0.6,
  }));
}
