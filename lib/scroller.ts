/**
 * Which element scrolls the page content.
 *
 * After the reference shell: on desktop (≥ lg, 1024px) the page itself
 * never scrolls. The rail and the panel are two independent scroll areas,
 * and the panel — `#panel` in app/layout.tsx — is the one the content
 * scrolls in. Below lg it is an ordinary page and the window scrolls.
 *
 * Everything that listens to scroll — Lenis, every ScrollTrigger, the hero
 * canvas — asks here instead of assuming the window. `null` means "the
 * window": leave the scroller option unset and let each library default.
 */

export const PANEL_ID = "panel";

export const DESKTOP_QUERY = "(min-width: 1024px)";

export function panelScroller(): HTMLElement | null {
  if (typeof window === "undefined") return null;
  if (!window.matchMedia(DESKTOP_QUERY).matches) return null;
  return document.getElementById(PANEL_ID);
}
