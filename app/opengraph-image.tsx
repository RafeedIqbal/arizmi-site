import { ImageResponse } from "next/og";

export const alt = "Arizmi — Start-Up Apps & Websites";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const interBold = await fetch(
    "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080d",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            background: "linear-gradient(135deg, #009EDC, #3C2F88)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          Arizmi
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(240,240,240,0.5)",
            fontWeight: 400,
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Your technical co-founder for start-up apps &amp; websites
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          style: "normal",
          weight: 900,
        },
      ],
    }
  );
}
