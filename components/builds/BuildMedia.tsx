import Image from "next/image";
import type { Build } from "@/lib/content/builds";
import {
  BUILD_CARD_BACK_SIZE,
  buildDisplayState,
  cardBackArtFor,
} from "@/lib/content/buildVisuals";

export type BuildMediaVariant = "featured" | "archive";

interface BuildMediaProps {
  readonly build: Build;
  readonly variant: BuildMediaVariant;
  readonly className?: string;
}

/**
 * Build media uses only approved Arizmi artwork and token-generated decoration.
 *
 * Featured cards treat the approved portrait card back as an overscanned image
 * behind a fixed aperture. The reel counter-moves that image layer to create
 * the window-style parallax treatment. Archive cards use a fixed-ratio CSS
 * placeholder with no visible placeholder copy.
 */
export default function BuildMedia({
  build,
  variant,
  className,
}: BuildMediaProps) {
  const state = buildDisplayState(build);
  const classes = ["build-media", `build-media--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  if (variant === "featured") {
    const art = cardBackArtFor(build);

    return (
      <span
        aria-hidden="true"
        data-state={state}
        data-variant={variant}
        className={classes}
      >
        <span className="build-media__aperture">
          <span className="build-media__image-layer">
            <Image
              src={art.src}
              alt=""
              width={BUILD_CARD_BACK_SIZE.width}
              height={BUILD_CARD_BACK_SIZE.height}
              draggable={false}
              unoptimized
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              className="build-media__image"
            />
          </span>
          <span className="build-media__glass" />
        </span>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-state={state}
      data-variant={variant}
      className={classes}
    >
      <span className="build-media__grid" />
      <span className="build-media__orbit" />
      <span className="build-media__mark" />
    </span>
  );
}
