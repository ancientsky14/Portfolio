"use client";

import { Component, type ReactNode } from "react";

/**
 * Wraps an enhancement that the page must survive without — the WebGL
 * background, the motion layer. If its lazily loaded chunk fails (a dropped
 * connection on mobile data, a proxy or blocker), the error would otherwise
 * reach the root and replace the whole page with Next's error screen. R9
 * (2026-09-14) found exactly that by blocking the three.js chunk: title,
 * `lang` and `<main>` gone. Here it renders nothing instead, and the page
 * stays as the server sent it.
 */
export class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Optional enhancement did not load:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
