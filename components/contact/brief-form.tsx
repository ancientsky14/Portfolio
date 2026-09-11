"use client";

import { useState } from "react";
import { BriefcaseBusiness, Lightbulb, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

/**
 * The contact form — a project brief, or a job opportunity.
 *
 * GitHub Pages runs no server, so there is no endpoint to POST to. Instead
 * the form composes an email: on submit it opens the visitor's own mail
 * client with the subject and body already written.
 *
 * Why this and not a third-party form service:
 *   · nothing the visitor types passes through anyone but their own mail
 *     provider
 *   · the reply comes from their real address, so there is no "did the form
 *     actually send?" ambiguity
 *   · zero accounts, keys or quotas to maintain
 *
 * The switch at the top changes both the fields and the email's subject,
 * so a recruiter's message and a client's brief never land looking alike.
 * With JavaScript off, `action="mailto:"` still hands the project fields to
 * the mail client as plain text.
 */

type Mode = "project" | "role";

const FIELD =
  "mt-2 w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-3 transition-colors focus:border-accent";

const LABEL = "block text-sm font-medium text-text";

function val(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

export function BriefForm() {
  const [mode, setMode] = useState<Mode>("project");
  const [opened, setOpened] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = val(d, "name");
    const company = val(d, "company");

    let subject: string;
    let lines: string[];

    if (mode === "project") {
      subject = `Project brief — ${company || name}`;
      lines = [
        `Name: ${name}`,
        company ? `Company / organisation: ${company}` : "",
        "",
        "What I want built:",
        val(d, "what"),
        "",
        val(d, "users") ? `Who will use it: ${val(d, "users")}` : "",
        val(d, "timeline") ? `Timeline: ${val(d, "timeline")}` : "",
        val(d, "budget") ? `Budget: ${val(d, "budget")}` : "",
      ];
    } else {
      const title = val(d, "title");
      subject = `Job opportunity — ${title}${company ? ` at ${company}` : ""}`;
      lines = [
        `Name: ${name}`,
        `Company: ${company}`,
        `Role: ${title}`,
        val(d, "type") ? `Type: ${val(d, "type")}` : "",
        val(d, "setup") ? `Work setup: ${val(d, "setup")}` : "",
        "",
        "Details:",
        val(d, "details"),
      ];
    }

    const body = lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");

    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  return (
    <form
      action={`mailto:${SITE.email}`}
      method="post"
      encType="text/plain"
      onSubmit={onSubmit}
      className="grid gap-5 sm:grid-cols-2"
    >
      {/* Mode switch — native radios, so it is keyboard-operable for free */}
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-text">
          What is this about?
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              { v: "project", label: "A project", icon: Lightbulb },
              { v: "role", label: "A job opportunity", icon: BriefcaseBusiness },
            ] as const
          ).map((o) => {
            const Icon = o.icon;
            const active = mode === o.v;
            return (
              <label
                key={o.v}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md border px-4 py-3 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                  active
                    ? "border-accent bg-accent-soft text-text"
                    : "border-line bg-surface text-text-2 hover:border-accent",
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={o.v}
                  checked={active}
                  onChange={() => {
                    setMode(o.v);
                    setOpened(false);
                  }}
                  className="sr-only"
                />
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className={active ? "text-accent" : "text-text-3"}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className={LABEL}>
        Your name
        <input name="name" required autoComplete="name" className={FIELD} />
      </label>

      <label className={LABEL}>
        {mode === "project" ? "Company or organisation" : "Company"}
        <input
          name="company"
          required={mode === "role"}
          autoComplete="organization"
          className={FIELD}
        />
      </label>

      {mode === "project" ? (
        <>
          <label className={cn(LABEL, "sm:col-span-2")}>
            What do you want built?
            <textarea
              name="what"
              required
              rows={4}
              placeholder="The problem, not the solution — what is slow, manual or missing today."
              className={FIELD}
            />
          </label>

          <label className={cn(LABEL, "sm:col-span-2")}>
            Who will use it?
            <input
              name="users"
              placeholder="Your team, your customers, the public…"
              className={FIELD}
            />
          </label>

          <label className={LABEL}>
            Timeline
            <select name="timeline" defaultValue="" className={FIELD}>
              <option value="">Not sure yet</option>
              <option>As soon as possible</option>
              <option>In the next 1–3 months</option>
              <option>Later this year</option>
            </select>
          </label>

          <label className={LABEL}>
            Budget
            <select name="budget" defaultValue="" className={FIELD}>
              <option value="">Prefer not to say yet</option>
              <option>Budget is approved</option>
              <option>Still scoping it</option>
              <option>Not sure how it would be funded</option>
            </select>
          </label>
        </>
      ) : (
        <>
          <label className={cn(LABEL, "sm:col-span-2")}>
            Role title
            <input
              name="title"
              required
              placeholder="e.g. Full-stack developer"
              className={FIELD}
            />
          </label>

          <label className={LABEL}>
            Type
            <select name="type" defaultValue="" className={FIELD}>
              <option value="">—</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
          </label>

          <label className={LABEL}>
            Work setup
            <select name="setup" defaultValue="" className={FIELD}>
              <option value="">—</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </label>

          <label className={cn(LABEL, "sm:col-span-2")}>
            Details
            <textarea
              name="details"
              rows={4}
              placeholder="A link to the posting, the team, the stack — whatever helps."
              className={FIELD}
            />
          </label>
        </>
      )}

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          className="group inline-flex items-center gap-2 rounded-full bg-accent py-2.5 pl-5 pr-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          Write the email
          <Send
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5"
          />
        </button>

        <p aria-live="polite" className="text-sm text-text-3">
          {opened
            ? "Your mail app should have opened with this filled in. Nothing was sent yet — press send there."
            : "Opens your own mail app with this filled in. Nothing is sent from this page."}
        </p>
      </div>
    </form>
  );
}
