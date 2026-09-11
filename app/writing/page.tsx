import type { Metadata } from "next";
import { Container } from "@/components/site/container";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on building and shipping software products.",
};

export default function Writing() {
  return (
    <Container width="prose" className="py-16">
      <h1 data-split className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Writing
      </h1>
      <p className="mt-3 text-text-2">
        Notes on building and shipping software — desktop apps, web
        platforms, migrations, and what it takes to hand a system over cleanly.
      </p>

      <p className="mt-10 rounded-md border border-line bg-surface p-6 text-sm text-text-2">
        <span className="font-mono text-2xs uppercase tracking-widest text-text-3">
          Phase 6 · MDX
        </span>
        <br />
        <span className="mt-2 block">
          Candidates: shipping signed auto-updates for a Tauri desktop app,
          migrating a live app from SQLite to Postgres, and what it actually
          takes to hand a system over to a team with no developer.
        </span>
      </p>
    </Container>
  );
}
