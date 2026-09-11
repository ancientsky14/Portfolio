/**
 * Visitor accessibility preferences — text size, high contrast, reduced
 * motion — set from the panel in components/shell/a11y-panel.tsx.
 *
 * Stored in localStorage under A11Y_KEY and applied as classes on <html>
 * before first paint by the boot script in app/layout.tsx, so a visitor who
 * needs large text never sees the small version flash first.
 *
 * Reduced motion here is additive to the OS setting, never a replacement:
 * prefersReduced() is true if EITHER asks for it.
 */

export const A11Y_KEY = "a11y";

/** Fired on window whenever the panel changes a preference. */
export const A11Y_EVENT = "a11y-change";

export type A11yPrefs = {
  /** 0 = default, 1 = larger, 2 = largest. */
  text: 0 | 1 | 2;
  contrast: boolean;
  reduceMotion: boolean;
};

export const A11Y_DEFAULT: A11yPrefs = {
  text: 0,
  contrast: false,
  reduceMotion: false,
};

export function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-reduce-motion")
  );
}

export function applyA11y(p: A11yPrefs) {
  const c = document.documentElement.classList;
  c.toggle("a11y-text-1", p.text === 1);
  c.toggle("a11y-text-2", p.text === 2);
  c.toggle("a11y-contrast", p.contrast);
  c.toggle("a11y-reduce-motion", p.reduceMotion);
}

export function readA11y(): A11yPrefs {
  try {
    const raw = localStorage.getItem(A11Y_KEY);
    if (!raw) return A11Y_DEFAULT;
    return { ...A11Y_DEFAULT, ...(JSON.parse(raw) as Partial<A11yPrefs>) };
  } catch {
    return A11Y_DEFAULT;
  }
}

export function writeA11y(p: A11yPrefs) {
  try {
    localStorage.setItem(A11Y_KEY, JSON.stringify(p));
  } catch {
    /* blocked storage — the preference still applies for this visit */
  }
  applyA11y(p);
  window.dispatchEvent(new Event(A11Y_EVENT));
}
