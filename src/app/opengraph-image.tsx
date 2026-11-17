import { ImageResponse } from "next/og";

export const alt = "Vacaciones Inteligentes Colombia — vacation planner for Colombian holidays";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0b1623",
          color: "#d1e4f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#f4a261" }}>
          Vacaciones inteligentes
        </div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#9ab8cc" }}>
          Maximiza tu descanso con los festivos y puentes de Colombia
        </div>
      </div>
    ),
    size,
  );
}
