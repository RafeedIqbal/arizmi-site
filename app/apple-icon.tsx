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
          background: "#101313",
          borderRadius: "36px",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 2000 2000">
          <defs>
            <linearGradient
              id="arizmi-teal"
              gradientUnits="userSpaceOnUse"
              x1="1544.3761"
              y1="577.308"
              x2="620.2028"
              y2="1294.9014"
            >
              <stop offset="0.2689" stopColor="#03B6A3" />
              <stop offset="0.4784" stopColor="#03B1A2" />
              <stop offset="0.7345" stopColor="#02A29E" />
              <stop offset="0.9451" stopColor="#019099" />
            </linearGradient>
          </defs>
          <path
            fill="url(#arizmi-teal)"
            d="M1216.87 672.8l-1.93 656.33L1544.07 1000 1216.87 672.8zM850.2 1394.27l.09-96.55.03-29.61.09-115.32.09-144.96-193.36 193.37 193.06 193.07zM455.93 1000l108.81 108.81L983.2 690.35l-.18 217.8-.18 217.8-.18 217.8-.15 182.83 17.5 17.5 107.21-107.21.18-217.85.16-217.77.18-217.8.18-217.8v-1.8L1000 455.93 455.93 1000z"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
