import type { Metadata } from "next";
import { Download, Mail } from "lucide-react";
import { TOOLS } from "@/lib/stack";
import { SITE } from "@/lib/site";
import { cvHref } from "@/lib/cv";
import { ToolIcon } from "@/components/icons/tool-icon";
import { SocialLinks } from "@/components/shell/social-links";

export const metadata: Metadata = {
  title: "About",
  description:
    "Full-stack developer building web apps, desktop apps and multi-site platforms — open to projects and full-time roles.",
};

/**
 * About — who you would be hiring, as a client or as an employer.
 *
 * Everything here is checkable: the project facts come from
 * content/work/*.mdx (themselves checked against each repo), the skills
 * from lib/stack.ts, and the ownership paragraph is Jan's own stance. There
 * is no origin story, because an invented one is the easiest thing on a
 * portfolio to catch and the least useful thing on it to read.
 *
 * `#hire` is where the home page's "Hire me" lands. The CV button renders
 * only if public/cv.pdf exists — see lib/cv.ts.
 *
 * NEEDS: anything only you can say — years building, where you are based,
 * what you studied or did before this.
 */

/** Skills grouped the way a recruiter scans them. Every item is in lib/stack.ts. */
const SKILLS: { area: string; tools: string[] }[] = [
  { area: "Frontend", tools: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { area: "Desktop", tools: ["Tauri", "Rust"] },
  { area: "Data", tools: ["PostgreSQL", "Supabase", "SQLite", "PocketBase"] },
  { area: "Delivery", tools: ["Docker", "Cloudflare Workers", "Vite"] },
];

export default function About() {
  const cv = cvHref();

  return (
    <>
      <section className="border-b border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <p className="font-mono text-2xs uppercase tracking-widest text-text-3">
          About
        </p>

        <h1 data-split className="mt-6 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          I build software end to end — design, code, release, and the updates
          after.
        </h1>

        <div className="mt-8 max-w-2xl">
          <p className="text-lg text-text-2">
            I&rsquo;m a full-stack developer in the Philippines. I&rsquo;ve
            shipped a Windows desktop app with a Rust backend and signed
            auto-updates, a web platform with a role-based CMS across three
            surfaces, and a document-tracking portal with a full audit trail —
            and I&rsquo;m building an open-source multi-site platform on top of
            an MIT-licensed project.
          </p>

          <p className="mt-4 text-text-2">
            On every project here I was the only developer — the person who
            designed it, shipped it and kept it running. I build software the
            way I&rsquo;d want to maintain it: signed releases, audit trails,
            and updates that install themselves.
          </p>
        </div>

        {/* "After launch" — step 4 in lib/engagement.ts. The earlier
            ownership stance was withdrawn on 2026-09-11; no ownership or
            payment terms here. */}
        <div className="mt-10 max-w-2xl rounded-lg border border-line bg-surface p-6 shadow-soft sm:p-8">
          <p className="font-mono text-2xs uppercase tracking-widest text-accent">
            After launch
          </p>
          <p className="mt-4 text-lg text-text-2">
            I stay on. Fixes, updates and new features come from the person who
            built it — no handover to a stranger.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="font-mono text-2xs uppercase tracking-widest text-text-3">
            What I work in
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <li
                key={t.name}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3 pr-3.5 font-mono text-2xs uppercase tracking-widest text-text-2"
              >
                <span className="text-text">
                  <ToolIcon name={t.name} size={13} />
                </span>
                {t.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-text-3">
            Nothing on this list is aspirational. Each one is in a project I
            have shipped or am building, or in this site.
          </p>
        </div>
      </section>

      {/* HIRE — the landing spot for "Hire me" */}
      <section
        id="hire"
        className="scroll-mt-20 border-b border-line px-5 py-16 sm:px-8 lg:px-12"
      >
        <p className="font-mono text-2xs uppercase tracking-widest text-accent">
          Hiring?
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-2xl font-bold tracking-tight">
          Open to full-time roles as well as projects.
        </h2>
        <p className="mt-4 max-w-2xl text-text-2">
          I work across the stack — interface, database, desktop and delivery —
          and I&rsquo;m used to owning a product from the first commit to the
          release that installs itself.
        </p>

        <dl
          data-reveal-group
          className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2"
        >
          {SKILLS.map((s) => (
            <div
              key={s.area}
              className="rounded-lg border border-line bg-surface p-5 shadow-soft"
            >
              <dt className="font-mono text-2xs uppercase tracking-widest text-text-3">
                {s.area}
              </dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {s.tools.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-text"
                  >
                    <ToolIcon name={t} size={14} />
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {cv ? (
            <a
              href={cv}
              download
              className="inline-flex items-center gap-2 rounded-full bg-text py-2.5 pl-4 pr-5 text-sm font-semibold text-ground transition-opacity hover:opacity-90"
            >
              <Download size={16} strokeWidth={2} aria-hidden="true" />
              Download CV
            </a>
          ) : null}
          <a
            href={`mailto:${SITE.email}?subject=${encodeURIComponent("Job opportunity")}`}
            className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface py-2.5 pl-4 pr-5 text-sm font-semibold text-text transition-colors hover:border-accent"
          >
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
            Email me about a role
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-accent"
            />
            <span className="font-mono text-2xs uppercase tracking-widest text-text-2">
              {SITE.availability}
            </span>
          </p>
          <SocialLinks />
        </div>
      </section>
    </>
  );
}
