import type { ComponentPropsWithoutRef } from "react";

const WIDTH_CLASSES = {
  content: "max-w-[var(--page-content)]",
  narrow: "max-w-[var(--page-narrow)]",
  max: "max-w-[var(--page-max)]",
} as const;

/**
 * Section container (TASK-004): full-bleed surface plus a centered,
 * width-capped, section-padded inner container. Server-safe. `surface="card"`
 * paints card black and rescopes every nested primitive via data-surface.
 */
export default function Section({
  as: Tag = "section",
  surface = "canvas",
  width = "content",
  paddingY = "default",
  className,
  containerClassName,
  children,
  ...rest
}: ComponentPropsWithoutRef<"section"> & {
  as?: "section" | "div" | "header" | "footer" | "article";
  surface?: "canvas" | "card";
  width?: keyof typeof WIDTH_CLASSES;
  /** "none" leaves vertical rhythm to containerClassName. */
  paddingY?: "default" | "none";
  /** Classes for the centered inner container (spacing, grids). */
  containerClassName?: string;
}) {
  return (
    <Tag
      data-surface={surface}
      className={[surface === "card" ? "bg-card text-ink-on-card" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div
        className={[
          "mx-auto w-full px-[var(--section-px)]",
          paddingY === "default" ? "py-[var(--section-py)]" : "",
          WIDTH_CLASSES[width],
          containerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </Tag>
  );
}
