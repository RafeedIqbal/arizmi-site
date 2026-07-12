import { buildDisplayState, type Build } from "@/lib/content/builds";

/**
 * Featured-media placeholder (D-07). Real project media has not been supplied,
 * so this renders a consistent, intentional, brand-tinted slot with a fixed
 * aspect ratio — when approved media arrives it drops into the same slot with
 * no layout shift. Never a broken <img> or random stock art.
 *
 * Decorative: the project name and state are already announced by the card
 * heading and detail, so the placeholder is aria-hidden to avoid duplicate
 * screen-reader output while staying visibly labelled.
 */
export default function BuildMedia({
  build,
  className,
}: {
  build: Build;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-state={buildDisplayState(build)}
      className={["build-media", className].filter(Boolean).join(" ")}
    >
      <span className="build-media__grid" />
      <span className="build-media__label font-meta">Preview coming soon</span>
      <span className="build-media__name">{build.name}</span>
    </div>
  );
}
