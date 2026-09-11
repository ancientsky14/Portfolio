import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";

export const metadata: Metadata = {
  title: "Lab",
  description: "Experiments, interaction studies, and open source.",
};

export default function Lab() {
  return (
    <Container width="prose" className="py-16">
      <h1 data-split className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Lab
      </h1>
      <p className="mt-3 text-text-2">
        Experiments and interaction studies. This is the half of the site that
        isn&rsquo;t a pitch.
      </p>

      {/* Honest empty state. `lib/lab.ts` is empty on purpose — a lab full
          of invented studies is worse than no lab, because the one reader
          who clicks through finds nothing behind it. */}
      <div className="mt-10 rounded-md border border-glass-line bg-glass p-6 backdrop-blur-xl">
        <p className="font-mono text-2xs uppercase tracking-widest text-text-3">
          Nothing published yet
        </p>
        <p className="mt-3 text-sm text-text-2">
          Write-ups queued: shipping a self-updating desktop app with Tauri,
          moving a live app from SQLite to Postgres, and moving a Next.js app
          from Vercel to Cloudflare Workers mid-project. They go up when they
          are written, not as placeholders.
        </p>

        <Link
          href="/writing"
          className="mt-5 inline-flex w-fit items-center gap-2 border-b border-line-2 pb-0.5 text-sm text-text transition-colors hover:border-accent"
        >
          Longer pieces go under Writing
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </Container>
  );
}
