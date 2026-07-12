import { ImageResponse } from "next/og";
import { NAV_SUPPORTING_LINE } from "@/lib/content/navigation";

/*
 * Site-wide Open Graph / Twitter share image. Self-contained: renders with
 * next/og's bundled default font so there is no external font fetch at build or
 * request time (TASK-018 — no unnecessary external calls). Brand surface is the
 * warm off-white canvas with the card-black wordmark and a teal full stop.
 */
export const alt = `Arizmi Labs — ${NAV_SUPPORTING_LINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CANVAS = "#F7F5EF";
const INK = "#101313";
const TEAL = "#00AFA7";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: CANVAS,
          padding: "96px",
        }}
      >
        <div
          style={{
            fontSize: 128,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: INK,
            lineHeight: 1,
            display: "flex",
          }}
        >
          Arizmi Labs
          <span style={{ color: TEAL }}>.</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 40,
            fontWeight: 500,
            color: "rgba(16,19,19,0.6)",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          {NAV_SUPPORTING_LINE}
        </div>
      </div>
    ),
    { ...size },
  );
}
