import { Lock } from "lucide-react";
import type { Media } from "@/lib/shots";
import { LoopVideo } from "@/components/work/loop-video";

/**
 * The case study's moving preview, in the frame of what it is: a browser
 * with the real hostname in the address bar for a web system, a desktop
 * window for a desktop app.
 *
 * Inside the frame, in order of preference: the first screen recording in
 * public/work/<slug>/, else the first screenshot, else a composed title
 * panel. Recordings and screenshots are captured from synthetic data only
 * (lib/shots.ts) — the frame shows a real address, the pixels must never
 * show a real record.
 *
 * No iframe: the live systems refuse to be framed (frame-ancestors
 * 'none'), correctly. The live link sits beside this, not inside it.
 */

export function LivePreview({
  title,
  platform,
  status,
  host,
  media,
}: {
  title: string;
  platform?: string;
  status?: string;
  /** The live hostname, when there is a cleared link. */
  host?: string;
  media: Media;
}) {
  const video = media.videos[0];
  const image = media.images[0];
  const desktop = platform === "Desktop";

  return (
    <figure
      data-reveal
      className="overflow-hidden rounded-lg border border-line bg-surface shadow-soft"
    >
      {desktop ? (
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="text-xs font-semibold text-text">{title}</span>
          <span aria-hidden="true" className="ml-auto flex gap-1.5">
            <span className="size-2.5 rounded-sm bg-line-2" />
            <span className="size-2.5 rounded-sm bg-line-2" />
            <span className="size-2.5 rounded-sm bg-line-2" />
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line-2" />
            <span className="size-2.5 rounded-full bg-line-2" />
            <span className="size-2.5 rounded-full bg-line-2" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-2xs text-text-2">
            <Lock
              size={11}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-accent"
            />
            <span className="truncate">{host ?? "private deployment"}</span>
          </span>
        </div>
      )}

      <div className="relative aspect-video bg-surface-2">
        {video ? (
          <LoopVideo
            src={video.src}
            poster={video.poster ?? image}
            label={`${title} — screen recording`}
          />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${title} — screenshot`}
            loading="lazy"
            className="size-full object-cover object-top"
          />
        ) : (
          <div className="grid size-full place-items-center p-8 text-center [background:radial-gradient(60%_70%_at_70%_20%,var(--accent-soft),transparent_70%)]">
            <div>
              <p className="font-display text-3xl font-bold tracking-tight text-text">
                {title}
              </p>
              <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-text-3">
                {[platform, status].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
