import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080d",
          borderRadius: "36px",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            background: "linear-gradient(135deg, #009EDC, #3C2F88)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  );
}
